import { NextResponse } from "next/server";
import { adminEmails, supabaseAuthClient } from "@/lib/admin-auth";
import { supabaseConfigured } from "@/lib/store";

// Landing point of the emailed sign-in link.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const fail = (why: string) => NextResponse.redirect(new URL(`/admin/login?error=${why}`, url.origin));
  if (!supabaseConfigured()) return fail("not-configured");

  const code = url.searchParams.get("code");
  if (!code) return fail("link");

  const sb = await supabaseAuthClient();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (error) return fail("link");

  const { data } = await sb.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email || !adminEmails().includes(email)) {
    await sb.auth.signOut();
    return fail("not-allowed");
  }
  return NextResponse.redirect(new URL("/admin", url.origin));
}
