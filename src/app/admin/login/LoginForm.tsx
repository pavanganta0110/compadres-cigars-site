"use client";

import { useActionState } from "react";
import { sendLoginLink, type LoginState } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendLoginLink, {});
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium text-slate-700" htmlFor="email">Email address</label>
      <input id="email" name="email" type="email" required autoComplete="email" autoFocus
        className="w-full rounded border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-[#0e7c86] focus:ring-2 focus:ring-[#0e7c86]/20" />
      <button type="submit" disabled={pending}
        className="w-full rounded bg-[#0e7c86] px-4 py-2.5 font-semibold text-white hover:brightness-110 disabled:opacity-60">
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
      {state.message && <p role="status" className="text-sm text-slate-600">{state.message}</p>}
    </form>
  );
}
