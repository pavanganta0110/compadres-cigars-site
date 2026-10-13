import { promises as dns } from "node:dns";

// Search crawlers may read the public pages without the age cookie. The User-Agent alone is trivially
// spoofable, so a crawler is only trusted when the client IP reverse-resolves to the operator's domain
// AND that hostname resolves forward to the same IP (the method Google and Bing document).
const OPERATORS: { ua: RegExp; domains: string[] }[] = [
  { ua: /Googlebot|Google-InspectionTool|GoogleOther|Storebot-Google/i, domains: [".googlebot.com", ".google.com"] },
  { ua: /bingbot|BingPreview|msnbot/i, domains: [".search.msn.com"] },
];

const cache = new Map<string, { ok: boolean; at: number }>();
const TTL_MS = 6 * 3600 * 1000;
const MAX_CACHE = 1000;

async function resolvesBack(ip: string, domains: string[]): Promise<boolean> {
  try {
    const hosts = await dns.reverse(ip);
    for (const host of hosts) {
      if (!domains.some((d) => host.toLowerCase().endsWith(d))) continue;
      const [v4, v6] = await Promise.all([dns.resolve4(host).catch(() => []), dns.resolve6(host).catch(() => [])]);
      if ([...v4, ...v6].includes(ip)) return true;
    }
  } catch {
    // fall through: unverifiable means not trusted
  }
  return false;
}

export async function isVerifiedCrawler(userAgent: string | null, ip: string | null): Promise<boolean> {
  if (!userAgent || !ip) return false;
  const op = OPERATORS.find((o) => o.ua.test(userAgent));
  if (!op) return false;

  const hit = cache.get(ip);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.ok;

  const ok = await resolvesBack(ip, op.domains);
  if (cache.size >= MAX_CACHE) cache.clear();
  cache.set(ip, { ok, at: Date.now() });
  return ok;
}
