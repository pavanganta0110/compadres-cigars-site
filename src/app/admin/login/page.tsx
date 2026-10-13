import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign-in", robots: { index: false, follow: false } };

const ERRORS: Record<string, string> = {
  link: "That sign-in link is invalid or has expired. Request a new one.",
  "not-allowed": "That email isn't on the admin list.",
  "not-configured": "The dashboard isn't connected to Supabase yet (see the setup steps in the README).",
};

async function Notice({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const text = error ? ERRORS[error] : null;
  return text ? <p role="alert" className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{text}</p> : null;
}

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-4 text-slate-900">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold">Compadres Cigars</h1>
        <p className="mb-6 text-sm text-slate-500">Admin dashboard sign-in</p>
        <Suspense fallback={null}>
          <Notice searchParams={searchParams as Promise<{ error?: string }>} />
        </Suspense>
        <LoginForm />
      </div>
    </div>
  );
}
