import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { centsToAmount } from "@/lib/money";
import type { PaymentRequest } from "@/lib/store/types";

// Authorize.net "Accept Hosted": the customer enters their card on Authorize.net's own page. This site only
// asks Authorize.net for a one-time page token and later learns the outcome from a signed webhook. Card
// numbers never reach our server or database. All secrets come from environment variables:
//   AUTHNET_ENV             "sandbox" (test, no real money) or "production"
//   AUTHNET_API_LOGIN_ID    API Login ID
//   AUTHNET_TRANSACTION_KEY Transaction Key (secret)
//   AUTHNET_SIGNATURE_KEY   Signature Key (secret), verifies webhooks

type Mode = "sandbox" | "production";

const ENDPOINTS: Record<Mode, { api: string; page: string }> = {
  sandbox: { api: "https://apitest.authorize.net/xml/v1/request.api", page: "https://test.authorize.net/payment/payment" },
  production: { api: "https://api.authorize.net/xml/v1/request.api", page: "https://accept.authorize.net/payment/payment" },
};

export const MAX_AMOUNT_CENTS = 5_000_000; // $50,000 per request

export function authnetMode(): Mode | null {
  const m = process.env.AUTHNET_ENV?.trim().toLowerCase();
  return m === "sandbox" || m === "production" ? m : null; // anything else: not configured (fail closed)
}

export function authnetConfigured(): boolean {
  return Boolean(authnetMode() && process.env.AUTHNET_API_LOGIN_ID && process.env.AUTHNET_TRANSACTION_KEY && process.env.AUTHNET_SIGNATURE_KEY);
}

function endpoints() {
  const m = authnetMode();
  if (!m) throw new Error("AUTHNET_ENV must be 'sandbox' or 'production'");
  // Local testing only: point at a fake Authorize.net. Ignored in production builds.
  const fake = process.env.NODE_ENV !== "production" ? process.env.AUTHNET_TEST_BASE : undefined;
  if (fake) return { api: `${fake}/xml/v1/request.api`, page: `${fake}/payment/payment` };
  return ENDPOINTS[m];
}

function auth() {
  const name = process.env.AUTHNET_API_LOGIN_ID;
  const transactionKey = process.env.AUTHNET_TRANSACTION_KEY;
  if (!name || !transactionKey) throw new Error("Authorize.net credentials are not set");
  return { name, transactionKey };
}

// ---- amounts (always whole cents; never floating point) ---------------------------------------------------

/** "123", "123.4", "123.45" -> cents. Rejects anything else (negatives, 3 decimals, commas, NaN, zero). */
export function parseAmountToCents(input: string): number | null {
  const m = /^(\d{1,6})(?:\.(\d{1,2}))?$/.exec(input.trim());
  if (!m) return null;
  const cents = Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0") || "0");
  return cents > 0 && cents <= MAX_AMOUNT_CENTS ? cents : null;
}

export { centsToAmount, formatUsd } from "@/lib/money";

// ---- identifiers ----------------------------------------------------------------------------------------

export const newPayToken = (): string => randomBytes(24).toString("base64url"); // 32 unguessable chars
/** Authorize.net invoice numbers are at most 20 characters. "CC" + 14 hex = 16. */
export const newInvoiceNumber = (): string => `CC${randomBytes(7).toString("hex").toUpperCase()}`;
export const isPayToken = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z0-9_-]{32}$/.test(v);

// ---- API calls ------------------------------------------------------------------------------------------

async function call(body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(endpoints().api, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Authorize.net HTTP ${res.status}`);
  // Authorize.net prefixes its JSON with a UTF-8 byte order mark.
  return JSON.parse((await res.text()).replace(/^﻿/, "")) as Record<string, unknown>;
}

type Messages = { resultCode?: string; message?: { code?: string; text?: string }[] };
function failure(what: string, messages: Messages | undefined): Error {
  const m = messages?.message?.[0];
  return new Error(`${what}: ${m?.code ?? "?"} ${m?.text ?? ""}`.trim());
}

const clean = (s: string, max: number) => s.replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

/** Creates the one-time token for the hosted payment page (valid 15 minutes; show the page right away). */
export async function createHostedPageToken(p: PaymentRequest, opts: { returnUrl: string; cancelUrl: string; email?: string | null }): Promise<{ token: string; pageUrl: string }> {
  const setting = (settingName: string, value: unknown) => ({ settingName, settingValue: JSON.stringify(value) });
  const json = await call({
    getHostedPaymentPageRequest: {
      merchantAuthentication: auth(),
      refId: p.invoice_number,
      transactionRequest: {
        transactionType: "authCaptureTransaction",
        amount: centsToAmount(p.amount_cents),
        order: { invoiceNumber: p.invoice_number, description: clean(p.description || "Compadres Cigars order", 200) },
        ...(opts.email ? { customer: { email: opts.email } } : {}),
      },
      hostedPaymentSettings: {
        setting: [
          setting("hostedPaymentReturnOptions", { showReceipt: true, url: opts.returnUrl, urlText: "Back to Compadres Cigars", cancelUrl: opts.cancelUrl, cancelUrlText: "Cancel" }),
          setting("hostedPaymentButtonOptions", { text: "Pay" }),
          setting("hostedPaymentPaymentOptions", { cardCodeRequired: true, showCreditCard: true, showBankAccount: false }),
          setting("hostedPaymentBillingAddressOptions", { show: true, required: false }),
          setting("hostedPaymentShippingAddressOptions", { show: false, required: false }),
          setting("hostedPaymentOrderOptions", { show: true, merchantName: "Compadres Cigars" }),
        ],
      },
    },
  });
  const token = (json as { token?: unknown }).token;
  const messages = (json as { messages?: Messages }).messages;
  if (messages?.resultCode !== "Ok" || typeof token !== "string" || !token) throw failure("Authorize.net could not create the payment page", messages);
  return { token, pageUrl: endpoints().page };
}

export type TransactionDetails = {
  approved: boolean;
  amountCents: number | null;
  invoiceNumber: string | null;
  status: string;
};

/** The authoritative outcome of a transaction, fetched straight from Authorize.net. */
export async function getTransactionDetails(transId: string): Promise<TransactionDetails> {
  if (!/^\d{1,20}$/.test(transId)) throw new Error("Invalid transaction id");
  const json = await call({ getTransactionDetailsRequest: { merchantAuthentication: auth(), transId } });
  const messages = (json as { messages?: Messages }).messages;
  const t = (json as { transaction?: Record<string, unknown> }).transaction;
  if (messages?.resultCode !== "Ok" || !t) throw failure("Authorize.net transaction lookup failed", messages);

  const status = String(t.transactionStatus ?? "");
  const amount = Number(t.authAmount ?? t.settleAmount);
  const order = (t.order ?? {}) as { invoiceNumber?: unknown };
  return {
    // Only a captured card payment counts as paid: responseCode 1 (approved) AND a captured/settled status.
    approved: String(t.responseCode) === "1" && (status === "capturedPendingSettlement" || status === "settledSuccessfully"),
    amountCents: Number.isFinite(amount) ? Math.round(amount * 100) : null,
    invoiceNumber: typeof order.invoiceNumber === "string" ? order.invoiceNumber : null,
    status,
  };
}

// ---- webhook signature ----------------------------------------------------------------------------------

const hmacHex = (key: string | Buffer, data: string) => createHmac("sha512", key).update(data, "utf8").digest("hex");
function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Verifies the X-ANET-Signature header: HMAC-SHA512 of the exact raw body with the Signature Key. The docs
 * don't say whether the key is used as plain text or hex-decoded, or the case of the digest, so both key
 * forms and both cases are accepted (either needs the secret key to produce).
 */
export function verifyWebhookSignature(rawBody: string, header: string | null): boolean {
  const key = process.env.AUTHNET_SIGNATURE_KEY;
  if (!key || !header) return false; // fail closed
  const given = header.trim().replace(/^sha512=/i, "").toLowerCase();
  if (!/^[0-9a-f]{128}$/.test(given)) return false;
  const candidates = [hmacHex(key, rawBody)];
  if (/^(?:[0-9a-fA-F]{2})+$/.test(key)) candidates.push(hmacHex(Buffer.from(key, "hex"), rawBody));
  return candidates.some((c) => safeEqual(c, given));
}
