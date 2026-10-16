"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Styled to match the original Elfsight "Become a Customer" form: white page, Times serif, bordered
// floating-label fields, dashed upload box, blue Submit. Card-number fields are intentionally NOT
// collected here (card data must never go through a plain form).
const serif = "font-[Times,'Times_New_Roman',serif] text-[15px] text-[#111]";

function Field({ name, label, required, type = "text", half, textarea }: { name: string; label: string; required?: boolean; type?: string; half?: boolean; textarea?: boolean }) {
  const control =
    "peer absolute inset-x-[15px] bottom-[8px] bg-transparent text-[15px] text-[#111] outline-none placeholder:text-transparent";
  return (
    <div className={`relative rounded border border-[#111]/20 focus-within:border-[#197bff] ${half ? "" : "col-span-2"} ${textarea ? "h-[92px]" : "h-[52px]"}`}>
      {textarea ? (
        <textarea id={name} name={name} required={required} maxLength={4000} placeholder=" " className={`${control} h-[60px] resize-none`} />
      ) : (
        <input id={name} name={name} type={type} required={required} maxLength={500} placeholder=" " className={`${control} h-5`} />
      )}
      <label
        htmlFor={name}
        className="pointer-events-none absolute left-[15px] top-[15px] origin-left text-[15px] font-bold text-[#111]/50 transition-all peer-focus:top-[4px] peer-focus:text-[11px] peer-not-placeholder-shown:top-[4px] peer-not-placeholder-shown:text-[11px]"
      >
        {label}
        {required && " *"}
      </label>
    </div>
  );
}

export default function CustomerForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [over, setOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 21+ ID check (Didit). It opens in a second tab so the application isn't lost; we poll our own server,
  // which asks Didit. The server re-checks the result on submit, so this state is only for the UI.
  const [vState, setVState] = useState<"idle" | "starting" | "waiting" | "verified" | "review" | "failed">("idle");
  const [vError, setVError] = useState("");
  const [vId, setVId] = useState<string | null>(null);
  const [vUrl, setVUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!vId || (vState !== "waiting" && vState !== "review")) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const started = Date.now();
    const tick = async () => {
      if (stopped) return;
      if (Date.now() - started > 20 * 60 * 1000) {
        setVError("This check timed out. Please start it again.");
        setVState("failed");
        return;
      }
      try {
        const r = await fetch(`/api/verify/status?id=${vId}`, { cache: "no-store" });
        const j = (await r.json().catch(() => ({}))) as { state?: string };
        if (stopped) return;
        if (j.state === "verified") return setVState("verified");
        if (j.state === "failed" || j.state === "used") {
          setVError(j.state === "used" ? "This check was already used. Please start a new one." : "We couldn't verify that you are 21 or older. You can try again, or call us at (816) 878-3545.");
          return setVState("failed");
        }
        setVState(j.state === "review" ? "review" : "waiting");
      } catch {
        /* network blip: keep polling */
      }
      timer = setTimeout(tick, 4000);
    };
    timer = setTimeout(tick, 4000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [vId, vState]);

  async function startVerification() {
    setVError("");
    setVState("starting");
    // Open the tab synchronously (inside the click) so popup blockers allow it, then point it at Didit.
    const tab = window.open("", "_blank");
    try {
      const res = await fetch("/api/verify/start", { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as { id?: string; url?: string; error?: string };
      if (!res.ok || !json.id || !json.url) throw new Error(json.error || "We couldn't start ID verification.");
      setVId(json.id);
      setVUrl(json.url);
      if (tab) tab.location.href = json.url;
      setVState("waiting");
    } catch (err) {
      tab?.close();
      setVError(err instanceof Error ? err.message : "We couldn't start ID verification.");
      setVState("failed");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (vState !== "verified" || !vId) {
      setError("Please complete the ID verification below before submitting.");
      setState("error");
      return;
    }
    setState("sending");
    const fd = new FormData(e.currentTarget);
    fd.set("kind", "customer");
    fd.set("verificationId", vId);
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

          <fieldset className="mt-6">
            <legend className="mb-1 font-bold leading-5">Age Verification (21+) *</legend>
            <p className="text-sm leading-[17px] text-[#111]/50">
              To buy tobacco products we must verify your age. You&apos;ll scan a government-issued photo ID on Didit, our secure verification partner. It opens in a new tab.
            </p>
            {vState === "verified" ? (
              <p role="status" className="mt-3 font-bold text-green-700">✓ Verified — you&apos;re 21 or older.</p>
            ) : (
              <div className="mt-3">
                <button type="button" onClick={startVerification} disabled={vState === "starting" || vState === "waiting" || vState === "review"} className="h-11 rounded border border-[#111] px-4 font-bold transition hover:bg-[#111]/5 disabled:opacity-60">
                  {vState === "starting" ? "Starting…" : vState === "waiting" || vState === "review" ? "Waiting for your ID check…" : vState === "failed" ? "Try ID verification again" : "Verify my age"}
                </button>
                {(vState === "waiting" || vState === "review") && (
                  <p className="mt-2 text-sm leading-[17px]">
                    {vState === "review" ? "Your ID check needs a quick manual review. This page will update when it's done. " : "Finish the check in the new tab. This page will update automatically. "}
                    {vUrl && <a href={vUrl} target="_blank" rel="noreferrer" className="text-[#197bff] underline">Reopen the verification tab</a>}
                  </p>
                )}
                {vState === "failed" && vError && <p role="alert" className="mt-2 text-sm text-red-600">{vError}</p>}
              </div>
            )}
          </fieldset>

          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

          <div className="mt-8 text-center">
            <button type="submit" disabled={state === "sending" || vState !== "verified"} className="h-12 w-[110px] rounded bg-[#197bff] text-lg font-bold text-white transition hover:brightness-110 disabled:opacity-60">
              {state === "sending" ? "…" : "Submit"}
            </button>
            {state === "error" && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
        </form>
      )}
    </div>
  );
}
