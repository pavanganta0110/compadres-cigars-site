"use client";

import { useState } from "react";

const FIELDS = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email", required: true, type: "email" },
  { name: "message", label: "Message", required: true, textarea: true },
];

const input = "w-full bg-ink px-4 py-3 text-sm text-[#bfbfbf] placeholder:text-muted focus:outline focus:outline-gold";

// Contact form — matches the original GoDaddy form (placeholders inside the fields).
export default function InquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, kind: "contact" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  if (state === "done") {
    return <p role="status" className="bg-ink p-6 text-center">Thank you! Your message has been sent.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-[27px]">
      {FIELDS.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="sr-only">{f.label}</label>
          {f.textarea ? (
            <textarea id={f.name} name={f.name} required={f.required} maxLength={4000} placeholder={`${f.label}${f.required ? "*" : ""}`} className={`${input} h-[155px]`} />
          ) : (
            <input id={f.name} name={f.name} type={f.type ?? "text"} required={f.required} maxLength={500} placeholder={`${f.label}${f.required ? "*" : ""}`} className={`${input} h-11`} />
          )}
        </div>
      ))}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="-mt-[5px] text-center">
        <button type="submit" disabled={state === "sending"} className="h-14 rounded bg-gold px-9 text-sm font-bold uppercase text-white transition hover:brightness-110 disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Send"}
        </button>
        {state === "error" && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </form>
  );
}
