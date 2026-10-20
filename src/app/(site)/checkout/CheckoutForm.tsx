"use client";

import Link from "next/link";
import { useState } from "react";
import { AgeVerificationField, useAgeVerification } from "@/components/AgeVerification";
import { Field, serif } from "@/components/FormField";
import { cartCount, clearCart, useCart } from "@/lib/cart";
import { itemById } from "@/lib/shop";

// Order REQUEST: no payment is taken here. The 21+ ID check is required, and the server re-checks it.
export default function CheckoutForm() {
  const lines = useCart();
  const age = useAgeVerification();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!age.verified || !age.vId) {
      setError("Please complete the ID verification before submitting your order.");
      setState("error");
      return;
    }
    setState("sending");
    const fd = new FormData(e.currentTarget);
    fd.set("items", JSON.stringify(lines));
    fd.set("verificationId", age.vId);
    try {
      const res = await fetch("/api/order", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      clearCart();
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className={`${serif} mx-auto max-w-[460px] rounded bg-white p-6`}>
        <p role="status" className="font-bold">Thank you. We&apos;ve received your order request.</p>
        <p className="mt-3">We&apos;ll contact you to confirm pricing, shipping and payment before anything ships.</p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[560px] text-center">
        <p className="text-muted">Your cart is empty.</p>
        <Link href="/all-products" className="mt-6 inline-block rounded bg-gold px-6 py-3 font-bold uppercase tracking-wide text-white hover:brightness-110">Browse products</Link>
      </div>
    );
  }

  return (
    <div className={`${serif} mx-auto w-full max-w-[460px] rounded bg-white p-6`}>
      <h2 className="font-bold">Order summary ({cartCount(lines)} {cartCount(lines) === 1 ? "unit" : "units"})</h2>
      <ul className="mt-2 text-sm leading-6">
        {lines.map((l) => {
          const i = itemById(l.id);
          return i ? <li key={l.id}>{l.qty} × {i.name} <span className="text-[#111]/60">({i.unit})</span></li> : null;
        })}
      </ul>
      <p className="mt-1 text-sm"><Link href="/cart" className="text-[#197bff] underline">Edit cart</Link></p>

      <form onSubmit={onSubmit} className="mt-6">
        <p className="mb-[21px] font-bold italic leading-[18px]">Where should we send and confirm this order?</p>
        <div className="grid grid-cols-2 gap-x-5 gap-y-5">
          <Field name="firstName" label="First Name" required half />
          <Field name="lastName" label="Last Name" required half />
          <Field name="company" label="Company" required />
          <Field name="address" label="Shipping Address" required />
          <Field name="city" label="City" required />
          <Field name="state" label="State" required half />
          <Field name="zip" label="Zip" required half />
          <Field name="email" label="Email" required type="email" half />
          <Field name="phone" label="Phone" required type="tel" half />
          <Field name="message" label="Notes (optional)" textarea />
        </div>

        <div className="mt-6">
          <label htmlFor="license" className="block leading-5">Tobacco license (optional if we already have it)</label>
          <p className="my-1 text-sm leading-[17px] text-[#111]/50">jpg, png, pdf or Office document, less than 4 MB.</p>
          <input id="license" name="license" type="file" accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.odt,.ppt,.pptx,.pps,.ppsx,.html" className="text-sm" />
        </div>

        <AgeVerificationField v={age} />

        <label className="mt-6 flex items-start gap-2 leading-5">
          <input type="checkbox" name="acceptTerms" value="yes" required className="mt-1" />
          <span>
            I am a licensed business and at least 21 years old, and I agree to the{" "}
            <Link href="/terms-and-conditions" target="_blank" className="text-[#197bff] underline">Terms &amp; Conditions</Link>,{" "}
            <Link href="/privacy-policy" target="_blank" className="text-[#197bff] underline">Privacy Policy</Link>,{" "}
            <Link href="/refund-policy" target="_blank" className="text-[#197bff] underline">Refund Policy</Link> and{" "}
            <Link href="/shipping-policy" target="_blank" className="text-[#197bff] underline">Shipping Policy</Link>.
          </span>
        </label>

        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

        <div className="mt-8 text-center">
          <button type="submit" disabled={state === "sending" || !age.verified} className="h-12 rounded bg-[#197bff] px-6 text-lg font-bold text-white transition hover:brightness-110 disabled:opacity-60">
            {state === "sending" ? "…" : "Submit order request"}
          </button>
          <p className="mt-3 text-sm text-[#111]/60">No payment is taken now. We confirm pricing and payment with you first.</p>
          {state === "error" && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </form>
    </div>
  );
}
