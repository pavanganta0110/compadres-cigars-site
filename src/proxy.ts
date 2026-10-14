import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AGE_COOKIE, verifyAgeToken } from "@/lib/age-gate";
import { isVerifiedCrawler } from "@/lib/crawler";

// Every request needs a valid signed age cookie, except the gate itself and a few public files.
const OPEN = new Set(["/age-gate", "/api/age-verify", "/robots.txt", "/llms.txt", "/favicon.ico", "/icon.png", "/apple-touch-icon.png"]);

// Next's image optimizer fetches /images/* internally WITHOUT the visitor's cookie, so gating them would
// break every <Image>. They are product photos only; pages, PDFs and the API stay gated.
const OPEN_PREFIXES = ["/_next/static/", "/images/"];

// Verified search crawlers get public content only: no PDFs/downloads and no API.
const CRAWLER_BLOCKED = ["/files/", "/api/"];

// The admin dashboard has its own login (checked on the server for every page and action), so it sits
// outside the 21+ gate. Here we only keep the Supabase session cookie fresh.
async function adminSession(request: NextRequest) {
  let res = NextResponse.next({ request });
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return res;
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        res = NextResponse.next({ request });
        res.headers.set("X-Robots-Tag", "noindex, nofollow");
        res.headers.set("Cache-Control", "no-store");
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  await sb.auth.getUser();
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/auth/") || pathname.startsWith("/api/admin/")) {
    return adminSession(request);
  }
  // The optimizer route is open only for the public /images/* files (the gate page shows them behind the popup).
  if (pathname === "/_next/image" && (request.nextUrl.searchParams.get("url") ?? "").startsWith("/images/")) {
    return NextResponse.next();
  }
  if (OPEN.has(pathname) || OPEN_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  if (await verifyAgeToken(request.cookies.get(AGE_COOKIE)?.value)) return NextResponse.next();

  if (
    request.method === "GET" &&
    !CRAWLER_BLOCKED.some((p) => pathname.startsWith(p)) &&
    (await isVerifiedCrawler(request.headers.get("user-agent"), request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null))
  ) {
    return NextResponse.next();
  }

  const gate = new URL("/age-gate", request.url);
  if (request.method === "GET") gate.searchParams.set("next", pathname + search);
  const res = NextResponse.redirect(gate, 307);
  res.cookies.delete(AGE_COOKIE); // drop any invalid/expired cookie
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico).*)"],
};
