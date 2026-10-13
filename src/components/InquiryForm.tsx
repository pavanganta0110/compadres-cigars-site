"use client";

import { useState } from "react";
import type { InquiryKind } from "@/lib/inquiry";

type Field = { name: string; label: string; required?: boolean; type?: string; textarea?: boolean; half?: boolean };

const CONTACT: Field[] = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email", required: true, type: "email" },
  { name: "message", label: "Message", required: true, textarea: true },
];

const CUSTOMER: Field[] = [
  { name: "firstName", label: "First Name", required: true, half: true },
  { name: "lastName", label: "Last Name", required: true, half: true },
  { name: "company", label: "Company", required: true },
  { name: "address", label: "Shipping Address", required: true },
  { name: "city", label: "City", required: true, half: true },
  { name: "state", label: "State", required: true, half: true },
  { name: "zip", label: "Zip", required: true },
  { name: "email", label: "Email", required: true, type: "email", half: true },
  { name: "phone", label: "Phone", required: true, type: "tel", half: true },
  { name: "message", label: "Message", textarea: true },
];

const input = "w-full bg-ink px-4 py-3 text-sm text-[#bfbfbf] placeholder:text-muted focus:outline focus:outline-gold";

export default function InquiryForm({ kind }: { kind: InquiryKind }) {
  const fields = kind === "customer" ? CUSTOMER : CONTACT;
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
        body: JSON.stringify({ ...body, kind }),
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
    return (
      <p role="status" className="rounded bg-panel p-6 text-center">
        {kind === "customer"
          ? "Thank you for becoming a customer. We look forward to serving you."
          : "Thank you! Your message has been sent."}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`grid grid-cols-1 sm:grid-cols-2 ${kind === "contact" ? "gap-[27px]" : "gap-4"}`}>
      {fields.map((f) => (
        <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
          <label htmlFor={f.name} className={kind === "contact" ? "sr-only" : "mb-1 block text-sm text-[#ababab]"}>
            {f.label}{f.required && " *"}
          </label>
          {f.textarea ? (
            <textarea id={f.name} name={f.name} required={f.required} maxLength={4000} placeholder={kind === "contact" ? `${f.label}${f.required ? "*" : ""}` : undefined} className={`${input} ${kind === "contact" ? "h-[155px]" : "h-32"}`} />
          ) : (
            <input id={f.name} name={f.name} type={f.type ?? "text"} required={f.required} maxLength={500} placeholder={kind === "contact" ? `${f.label}${f.required ? "*" : ""}` : undefined} className={`${input} h-11`} />
          )}
        </div>
      ))}

      {kind === "customer" && (
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-xs uppercase tracking-wide text-muted">Payment Method</legend>
          <label className="mr-6 inline-flex items-center gap-2 text-sm">
            <input type="radio" name="paymentMethod" value="Check / ACH / Wire" defaultChecked /> Check / ACH / Wire
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="radio" name="paymentMethod" value="Credit Card" /> Credit Card
          </label>
          <p className="mt-2 text-xs text-muted">
            Please do not enter card numbers here. If you choose Credit Card, we will contact you to collect payment securely.
          </p>
        </fieldset>
      )}

      {/* Honeypot — hidden from people, filled by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div className={`text-center sm:col-span-2 ${kind === "contact" ? "-mt-[5px]" : ""}`}>
        <button
          type="submit"
          disabled={state === "sending"}
          className="h-14 rounded bg-gold px-9 text-sm font-bold uppercase text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : kind === "customer" ? "Submit" : "Send"}
        </button>
        {state === "error" && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </form>
  );
}
