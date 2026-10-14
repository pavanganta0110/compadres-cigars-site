import { createHash } from "node:crypto";
import { getStore } from "@/lib/store";

// First-party page-view counter. Stores no IP and sets no cookie: "visitor" is a hash that changes daily.
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget|python|node-fetch|axios/i;

export async function POST(request: Request) {
  const store = getStore();
  const ua = request.headers.get("user-agent") ?? "";
  if (!store || !ua || BOT.test(ua)) return new Response(null, { status: 204 });

  let body: { path?: unknown; ref?: unknown };
  try { body = JSON.parse(await request.text()); } catch { return new Response(null, { status: 400 }); }

  const p = typeof body.path === "string" ? body.path : "";
  if (!/^\/[\w\-./]{0,150}$/.test(p) || p.startsWith("/admin") || p.startsWith("/api") || p.startsWith("/auth")) return new Response(null, { status: 204 });

  let referrer: string | null = null;
  try { if (typeof body.ref === "string" && body.ref) referrer = new URL(body.ref).hostname.slice(0, 100); } catch { /* ignore */ }

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "0";
  const salt = process.env.TRACK_SALT || process.env.AGE_GATE_SECRET || "dev-salt";
  const visitor = createHash("sha256").update(`${salt}|${new Date().toISOString().slice(0, 10)}|${ip}|${ua}`).digest("hex").slice(0, 24);

  try {
    await store.addPageView({
      path: p,
      referrer_host: referrer && referrer !== new URL(request.url).hostname ? referrer : null,
      device: /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop",
      country: (request.headers.get("x-vercel-ip-country") ?? "").slice(0, 2) || null,
      visitor,
    });
  } catch (e) {
    console.error("track: could not record page view", e);
  }
  return new Response(null, { status: 204 });
}
