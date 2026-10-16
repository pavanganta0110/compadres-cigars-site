import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { VerificationStatus } from "@/lib/store/types";

// Didit identity verification (https://docs.didit.me). Server-side only: the API key never reaches a browser.
const API = "https://verification.didit.me/v3";
export const MIN_AGE = 21;
const WEBHOOK_MAX_AGE_SECONDS = 300;

export function diditConfigured(): boolean {
  return Boolean(process.env.DIDIT_API_KEY && process.env.DIDIT_WORKFLOW_ID);
}

function apiKey(): string {
  const k = process.env.DIDIT_API_KEY;
  if (!k) throw new Error("DIDIT_API_KEY is not set");
  return k;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);

/** Didit status strings are matched case-insensitively (the docs show both "APPROVED" and "Approved"). */
export function mapStatus(s: unknown): VerificationStatus {
  switch (String(s ?? "").trim().toLowerCase()) {
    case "approved":
      return "approved";
    case "declined":
      return "declined";
    case "in review":
      return "in_review";
    case "expired":
    case "abandoned":
    case "kyc expired":
      return "expired";
    default:
      return "pending"; // Not Started, In Progress, Awaiting User, Resubmitted, unknown
  }
}

export async function createSession(opts: { vendorData: string; callback: string }): Promise<{ sessionId: string; url: string }> {
  const workflowId = process.env.DIDIT_WORKFLOW_ID;
  if (!workflowId) throw new Error("DIDIT_WORKFLOW_ID is not set");
  const res = await fetch(`${API}/session/`, {
    method: "POST",
    headers: { "x-api-key": apiKey(), "Content-Type": "application/json" },
    body: JSON.stringify({
      workflow_id: workflowId,
      vendor_data: opts.vendorData,
      callback: opts.callback,
      callback_method: "initiator",
      language: "en",
      metadata: { purpose: "customer_application" },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Didit create session failed: HTTP ${res.status}`);
  const json = (await res.json()) as { session_id?: unknown; url?: unknown };
  if (!isUuid(json.session_id) || typeof json.url !== "string" || !json.url.startsWith("https://")) {
    throw new Error("Didit create session returned an unexpected response");
  }
  return { sessionId: json.session_id, url: json.url };
}

export type Decision = { status: VerificationStatus; ageOk: boolean };

/** Fetch the authoritative result straight from Didit (never trust a client or an unsigned payload). */
export async function fetchDecision(sessionId: string, now = Date.now()): Promise<Decision> {
  if (!isUuid(sessionId)) throw new Error("Invalid Didit session id");
  const res = await fetch(`${API}/session/${sessionId}/decision/`, {
    headers: { "x-api-key": apiKey() },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Didit decision fetch failed: HTTP ${res.status}`);
  return decisionFrom(await res.json(), now);
}

/** Turns a Didit decision payload into our status plus a "21 or older" flag computed on our side. */
export function decisionFrom(payload: unknown, now = Date.now()): Decision {
  const p = (payload ?? {}) as { status?: unknown; id_verifications?: unknown };
  const status = mapStatus(p.status);
  if (status !== "approved") return { status, ageOk: false };

  // Fail closed: approved only counts as 21+ if every ID on the session has a parseable date of birth that
  // makes the person at least 21 today. We compute the age ourselves from the date of birth.
  const ids = Array.isArray(p.id_verifications) ? (p.id_verifications as { date_of_birth?: unknown }[]) : [];
  if (ids.length === 0) return { status, ageOk: false };
  const ageOk = ids.every((i) => {
    const age = ageOn(i?.date_of_birth, now);
    return age !== null && age >= MIN_AGE;
  });
  return { status, ageOk };
}

export function ageOn(dob: unknown, now: number): number | null {
  if (typeof dob !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const born = new Date(Date.UTC(y, mo - 1, d));
  if (born.getUTCFullYear() !== y || born.getUTCMonth() !== mo - 1 || born.getUTCDate() !== d) return null; // e.g. 1990-02-31
  const t = new Date(now);
  let age = t.getUTCFullYear() - y;
  if (t.getUTCMonth() < mo - 1 || (t.getUTCMonth() === mo - 1 && t.getUTCDate() < d)) age--;
  return age >= 0 && age < 130 ? age : null;
}

// ---- Webhook signature verification -------------------------------------------------------------

const hmacHex = (secret: string, data: string) => createHmac("sha256", secret).update(data, "utf8").digest("hex");

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

// Recursively sort object keys; arrays keep their order.
function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v !== null && typeof v === "object") {
    return Object.keys(v as object)
      .sort()
      .reduce<Record<string, unknown>>((out, k) => {
        out[k] = sortKeys((v as Record<string, unknown>)[k]);
        return out;
      }, {});
  }
  return v;
}

export type WebhookBody = {
  event_id?: string;
  webhook_type?: string;
  status?: string;
  session_id?: string;
  vendor_data?: string;
  workflow_id?: string;
};

/**
 * Verifies a Didit webhook. Returns the parsed body when authentic, otherwise null. Only the two signatures
 * that cover the whole body are accepted: X-Signature-V2 (canonical JSON, preferred) and X-Signature (raw
 * bytes). The deprecated X-Signature-Simple covers only the envelope and is deliberately not accepted.
 */
export function verifyWebhook(rawBody: string, headers: Headers, now = Date.now()): WebhookBody | null {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;
  if (!secret) return null; // fail closed
  const ts = Number.parseInt(headers.get("x-timestamp") ?? "", 10);
  if (!Number.isFinite(ts) || Math.abs(Math.floor(now / 1000) - ts) > WEBHOOK_MAX_AGE_SECONDS) return null;

  let body: unknown;
  try {
    body = JSON.parse(rawBody); // for reading fields only; the raw bytes are what X-Signature signs
  } catch {
    return null;
  }
  if (!body || typeof body !== "object") return null;

  const v2 = headers.get("x-signature-v2");
  if (v2 && safeEqual(hmacHex(secret, JSON.stringify(sortKeys(body))), v2)) return body as WebhookBody;
  const raw = headers.get("x-signature");
  if (raw && safeEqual(hmacHex(secret, rawBody), raw)) return body as WebhookBody;
  return null;
}
