"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AgeVerificationField, useAgeVerification } from "@/components/AgeVerification";
import { Field, serif } from "@/components/FormField";
import { formatUsd } from "@/lib/money";
import { cartCount, clearCart, useCart } from "@/lib/cart";
import { priceLines } from "@/lib/shop";

// Checkout: the 21+ ID check is required and the server re-checks it. The total is computed on the server
// from the product list (the browser only sends product ids and quantities). After the order is saved we send
// the customer to Authorize.net's hosted page to pay; card numbers are never entered on this site.
export default function CheckoutForm() {
  const lines = useCart();
  const age = useAgeVerification();
  const [state, setState] = useState<"idle" | "sending" | "paying" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const payForm = useRef<HTMLFormElement>(null);
  const [payToken, setPayToken] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!age.verified || !age.vId) {
      setError("Please complete the ID verification before placing your order.");
      setState("error");
      return;
    }
    setState("sending");
    const fd = new FormData(e.currentTarget);
    fd.set("items", JSON.stringify(lines)); // ids and quantities only: the server prices the order
    fd.set("verificationId", age.vId);
    try {
      const res = await fetch("/api/order", { method: "POST", body: fd });
      const json = (await res.json().catch(() => ({}))) as { error?: string; payToken?: string | null };
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      clearCart();
      if (json.payToken) {
        setPayToken(json.payToken);
        setState("paying");
        // Same-origin POST to our pay route, which hands the customer to Authorize.net's payment page.
        setTimeout(() => payForm.current?.submit(), 0);
      } else {
        setState("done"); // order saved, but no payment link could be made right now
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  if (state === "paying" && payToken) {
    return (
      <div className={`${serif} mx-auto max-w-[460px] rounded bg-white p-6 text-center`}>
        <p role="status" className="font-bold">Order received. Taking you to our secure payment page…</p>
        <form ref={payForm} method="POST" action={`/api/pay/${payToken}`} className="mt-4">
          <button type="submit" className="rounded bg-[#197bff] px-6 py-3 font-bold text-white">Continue to secure payment</button>
        </form>
        <p className="mt-3 text-sm text-[#111]/60">Not redirected? Use the button above. You can also pay later from <Link href={`/pay/${payToken}`} className="text-[#197bff] underline">this page</Link>.</p>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className={`${serif} mx-auto max-w-[460px] rounded bg-white p-6`}>
        <p role="status" className="font-bold">Thank you. We&apos;ve received your order.</p>
        <p className="mt-3">We&apos;ll contact you shortly to arrange payment and shipping.</p>
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

  const t = priceLines(lines);
  return (
    <div className={`${serif} mx-auto w-full max-w-[460px] rounded bg-white p-6`}>
      <h2 className="font-bold">Order summary ({cartCount(lines)} {cartCount(lines) === 1 ? "unit" : "units"})</h2>
      <ul className="mt-2 text-sm leading-6">
        {t.lines.map((l) => (
          <li key={l.id} className="flex justify-between gap-3">
            <span>{l.qty} × {l.name} <span className="text-[#111]/60">({l.unit})</span></span>
            <span>{formatUsd(l.lineCents)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1 border-t border-[#111]/15 pt-3 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatUsd(t.subtotalCents)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd>{formatUsd(t.shippingCents)}</dd></div>
        <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatUsd(t.totalCents)}</dd></div>
      </dl>
      <p className="mt-2 text-xs text-[#111]/60">Prices exclude sales, excise or other taxes.</p>
      <p className="mt-1 text-sm"><Link href="/cart" className="text-[#197bff] underline">Edit cart</Link></p>

      <form onSubmit={onSubmit} className="mt-6">
        <p className="mb-[21px] font-bold italic leading-[18px]">Where should we ship this order?</p>
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
            {state === "sending" ? "…" : `Place order and pay ${formatUsd(t.totalCents)}`}
          </button>
          <p className="mt-3 text-sm text-[#111]/60">You&apos;ll enter your card on our payment processor&apos;s secure page. We never see or store your card number.</p>
          {state === "error" && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </form>
    </div>
  );
}
