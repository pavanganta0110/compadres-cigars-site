// Signed age-confirmation cookie. Uses Web Crypto so it runs in both the proxy and route handlers.
export const AGE_COOKIE = "cc_age_ok";

const enc = new TextEncoder();

export function ttlSeconds(): number {
  const days = Number(process.env.AGE_GATE_TTL_DAYS);
  return Math.round((Number.isFinite(days) && days > 0 ? days : 30) * 86400);
}

function secret(): string | null {
  const s = process.env.AGE_GATE_SECRET;
  if (s && s.length >= 16) return s;
  // Local development only; production fails closed without a real secret.
  return process.env.NODE_ENV === "production" ? null : "dev-only-age-gate-secret";
}

export function ageGateConfigured(): boolean {
  return secret() !== null;
}

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64url(s: string): Uint8Array<ArrayBuffer> | null {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

async function hmacKey(usage: "sign" | "verify") {
  const s = secret();
  if (!s) return null;
  return crypto.subtle.importKey("raw", enc.encode(s), { name: "HMAC", hash: "SHA-256" }, false, [usage]);
}

/** Returns a token "<expiryEpochSeconds>.<signature>", or null if no secret is configured. */
export async function createAgeToken(now = Date.now()): Promise<string | null> {
  const key = await hmacKey("sign");
  if (!key) return null;
  const exp = String(Math.floor(now / 1000) + ttlSeconds());
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`age:${exp}`));
  return `${exp}.${b64url(sig)}`;
}

export async function verifyAgeToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const [exp, sig, ...rest] = token.split(".");
  if (!exp || !sig || rest.length || !/^\d{1,12}$/.test(exp)) return false;
  if (Number(exp) * 1000 <= now) return false;
  const sigBytes = unb64url(sig);
  const key = await hmacKey("verify");
  if (!sigBytes || !key) return false;
  // crypto.subtle.verify compares in constant time.
  return crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(`age:${exp}`));
}

/** Only allow same-site relative paths as post-confirmation destinations. */
export function safeNext(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.startsWith("/age-gate") || value.startsWith("/api/")) {
    return "/";
  }
  return value;
}
