import { createSession, diditConfigured } from "@/lib/didit";
import { getStore } from "@/lib/store";

// Starts a Didit ID check for a "Become a Customer" applicant. The Didit API key stays on the server;
// the browser only receives our own verification id and the hosted Didit URL.

// Best-effort throttle so the endpoint can't be used to run up Didit usage. In-memory, so it is per server
// instance; it limits casual abuse, it is not a hard guarantee.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_STARTS = 5;

function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_STARTS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return false;
}

export async function POST(request: Request) {
  const store = getStore();
  if (!diditConfigured() || !store) {
    // Names only, never values: tells whoever reads the server log what to set.
    const missing = [
      !process.env.DIDIT_API_KEY && "DIDIT_API_KEY",
      !process.env.DIDIT_WORKFLOW_ID && "DIDIT_WORKFLOW_ID",
      !store && "Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY)",
    ].filter(Boolean);
    console.error(`verify/start unavailable, missing: ${missing.join(", ")}`);
    return Response.json({ error: "ID verification isn't available right now. Please call us at (816) 878-3545." }, { status: 503 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (tooMany(ip)) return Response.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });

  try {
    const row = await store.createVerification();
    const origin = process.env.SITE_URL?.replace(/\/+$/, "") || new URL(request.url).origin;
    const session = await createSession({ vendorData: row.id, callback: `${origin}/verify/return?v=${row.id}` });
    await store.attachVerificationSession(row.id, session.sessionId);
    return Response.json({ id: row.id, url: session.url }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("verify/start failed", e);
    return Response.json({ error: "We couldn't start ID verification. Please try again, or call us at (816) 878-3545." }, { status: 502 });
  }
}
