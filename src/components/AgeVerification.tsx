"use client";

import { useEffect, useState } from "react";

type VState = "idle" | "starting" | "waiting" | "verified" | "review" | "failed";

// 21+ ID check (Didit), shared by the customer application and checkout. It opens in a second tab so the
// form isn't lost; we poll our own server, which asks Didit. The server re-checks the result on submit,
// so this state is only for the UI.
export function useAgeVerification() {
  const [vState, setVState] = useState<VState>("idle");
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

  async function start() {
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

  return { vState, vError, vId, vUrl, verified: vState === "verified" && vId !== null, start };
}

export function AgeVerificationField({ v }: { v: ReturnType<typeof useAgeVerification> }) {
  const { vState, vError, vUrl, start } = v;
  return (
    <fieldset className="mt-6">
      <legend className="mb-1 font-bold leading-5">Age Verification (21+) *</legend>
      <p className="text-sm leading-[17px] text-[#111]/50">
        To buy tobacco products we must verify your age. You&apos;ll scan a government-issued photo ID on Didit, our secure verification partner. It opens in a new tab.
      </p>
      {vState === "verified" ? (
        <p role="status" className="mt-3 font-bold text-green-700">✓ Verified — you&apos;re 21 or older.</p>
      ) : (
        <div className="mt-3">
          <button type="button" onClick={start} disabled={vState === "starting" || vState === "waiting" || vState === "review"} className="h-11 rounded border border-[#111] px-4 font-bold transition hover:bg-[#111]/5 disabled:opacity-60">
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
  );
}
