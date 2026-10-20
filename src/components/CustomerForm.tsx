"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AgeVerificationField, useAgeVerification } from "@/components/AgeVerification";
import { Field, serif } from "@/components/FormField";

// Styled to match the original Elfsight "Become a Customer" form: white page, Times serif, bordered
// floating-label fields, dashed upload box, blue Submit. Card-number fields are intentionally NOT
// collected here (card data must never go through a plain form).
export default function CustomerForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [over, setOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const age = useAgeVerification();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!age.verified || !age.vId) {
      setError("Please complete the ID verification below before submitting.");
      setState("error");
      return;
    }
    setState("sending");
    const fd = new FormData(e.currentTarget);
    fd.set("kind", "customer");
    fd.set("verificationId", age.vId);
    try {
      const res = await fetch("/api/inquiry", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  return (
    <div className={`${serif} mx-auto w-full max-w-[460px]`}>
      <Image src="/images/lion-crest-white.png" alt="Compadres Premium Cigars" width={200} height={113} className="h-[113px] w-[200px]" />
      <p className="mt-[22px] max-w-[445px] font-bold italic leading-[19.5px]">
        Compadres Cigars is a licensed US importer supplying tobacco products to businesses with proper tobacco licensing within their respective state.
      </p>

      {state === "done" ? (
        <p role="status" className="mt-6 font-bold italic">Thank you for becoming a customer. We look forward to serving you.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6">
          <p className="mb-[21px] font-bold italic leading-[18px]">Please provide the following information.</p>
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
            <Field name="message" label="Message" textarea />
          </div>

          <div className="mt-6">
            <label htmlFor="license" className="block leading-5">Upload Your Tobacco License Here</label>
            <p className="my-1 text-sm leading-[17px] text-[#111]/50">
              Allowed file types: jpg, jpeg, png, gif, pdf, doc, docx, xls, xlsx, odt, ppt, pptx, pps, ppsx, html, and less than 4 MB.
            </p>
            <label
              htmlFor="license"
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(false);
                if (fileRef.current && e.dataTransfer.files.length) {
                  fileRef.current.files = e.dataTransfer.files;
                  setFileName(e.dataTransfer.files[0].name);
                }
              }}
              className={`mt-2 flex h-[86px] cursor-pointer items-center justify-center rounded border border-dashed px-4 text-center ${over ? "border-[#197bff] bg-[#197bff]/5" : "border-[#111]/20"}`}
            >
              {fileName ? (
                <span className="break-all">{fileName}</span>
              ) : (
                <span><span className="text-[#197bff]">Choose file</span> or drop here</span>
              )}
              <input ref={fileRef} id="license" name="license" type="file" className="sr-only" accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.odt,.ppt,.pptx,.pps,.ppsx,.html" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
            </label>
          </div>

          <fieldset className="mt-6">
            <legend className="mb-2 font-bold leading-5">Payment Method</legend>
            <label className="flex items-start gap-2 py-[2px] leading-5">
              <input type="checkbox" name="paymentMethod" value="Credit Card" className="mt-1" />
              <span>Credit Card (we will contact you to take payment securely — please do not enter card numbers here)</span>
            </label>
            <label className="mt-2 flex items-center gap-2 leading-5">
              <input type="checkbox" name="paymentMethod" value="Check / ACH / Wire" /> Check / ACH / Wire
            </label>
          </fieldset>

          <AgeVerificationField v={age} />

          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

          <div className="mt-8 text-center">
            <button type="submit" disabled={state === "sending" || !age.verified} className="h-12 w-[110px] rounded bg-[#197bff] text-lg font-bold text-white transition hover:brightness-110 disabled:opacity-60">
              {state === "sending" ? "…" : "Submit"}
            </button>
            {state === "error" && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
        </form>
      )}
    </div>
  );
}
