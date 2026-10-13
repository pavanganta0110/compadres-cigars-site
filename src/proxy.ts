import { NextResponse, type NextRequest } from "next/server";
import { AGE_COOKIE, verifyAgeToken } from "@/lib/age-gate";

// Every request needs a valid signed age cookie, except the gate itself and a few public files.
const OPEN = new Set(["/age-gate", "/api/age-verify", "/robots.txt", "/images/age-gate-logo.jpg"]);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (OPEN.has(pathname) || pathname.startsWith("/_next/static/")) return NextResponse.next();

  if (await verifyAgeToken(request.cookies.get(AGE_COOKIE)?.value)) return NextResponse.next();

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
