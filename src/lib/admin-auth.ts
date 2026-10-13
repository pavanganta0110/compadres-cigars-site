import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { devStoreAllowed, supabaseConfigured } from "@/lib/store";

export const adminEmails = (): string[] =>
  (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

export async function supabaseAuthClient() {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          /* called from a Server Component: the proxy refreshes the session instead */
        }
      },
    },
  });
}

export type Admin = { email: string };

/** The signed-in admin, or null. In local development with no Supabase, a clearly-labelled dev user. */
export async function getAdmin(): Promise<Admin | null> {
  if (!supabaseConfigured()) return devStoreAllowed() ? { email: "dev@local" } : null;
  const sb = await supabaseAuthClient();
  const { data } = await sb.auth.getUser(); // validates the token with Supabase, not just the cookie
  const email = data.user?.email?.toLowerCase();
  if (!email || !adminEmails().includes(email)) return null;
  return { email };
}

export async function requireAdmin(): Promise<Admin> {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  return a;
}

export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : "";
}
