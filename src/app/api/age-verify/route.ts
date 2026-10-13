import { NextResponse } from "next/server";
import { AGE_COOKIE, createAgeToken, safeNext, ttlSeconds } from "@/lib/age-gate";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = await createAgeToken();
  if (!token) {
    return new Response("Age verification is not configured (AGE_GATE_SECRET missing).", { status: 500 });
  }

  const res = NextResponse.redirect(new URL(safeNext(form?.get("next")), request.url), 303);
  res.cookies.set(AGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ttlSeconds(),
  });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
