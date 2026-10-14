"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";

export type TrackingConfig = {
  banner: { enabled: boolean; message: string; accept: string; decline: string };
  ga: string; googleTag: string; gtm: string; pixel: string; adsense: string;
};

// Defence in depth: these are re-checked here even though the dashboard validates them on save.
const OK = {
  ga: /^G-[A-Z0-9]{4,20}$/, googleTag: /^(G|AW|GT|DC)-[A-Z0-9-]{4,24}$/, gtm: /^GTM-[A-Z0-9]{4,12}$/,
  pixel: /^\d{8,20}$/, adsense: /^ca-pub-\d{10,20}$/,
};
const valid = (k: keyof typeof OK, v: string) => (OK[k].test(v) ? v : "");

type Consent = "accepted" | "declined" | null;
const KEY = "cc_consent";
let memory: Consent = null; // used if the browser blocks localStorage
const listeners = new Set<() => void>();

function readConsent(): string {
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "declined" ? v : memory ?? "none";
  } catch {
    return memory ?? "none";
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => { listeners.delete(cb); window.removeEventListener("storage", cb); };
}
function choose(c: Exclude<Consent, null>) {
  memory = c;
  try { localStorage.setItem(KEY, c); } catch { /* private mode: honoured for this visit only */ }
  listeners.forEach((l) => l());
}

export default function Tracking({ cfg }: { cfg: TrackingConfig }) {
  // "unknown" on the server / first paint, so the banner never flashes for people who already chose.
  const raw = useSyncExternalStore(subscribe, readConsent, () => "unknown");
  const consent: Consent | undefined = raw === "unknown" ? undefined : raw === "none" ? null : (raw as Consent);

  const ga = valid("ga", cfg.ga), gt = valid("googleTag", cfg.googleTag), gtm = valid("gtm", cfg.gtm), px = valid("pixel", cfg.pixel), ad = valid("adsense", cfg.adsense);
  const allowed = consent !== undefined && (!cfg.banner.enabled || consent === "accepted");
  const gtagIds = [ga, gt].filter(Boolean);

  return (
    <>
      {allowed && gtagIds.length > 0 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagIds[0]}`} strategy="afterInteractive" />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());${gtagIds.map((id) => `gtag('config','${id}');`).join("")}`}
          </Script>
        </>
      )}
      {allowed && gtm && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}
      {allowed && px && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${px}');fbq('track','PageView');`}
        </Script>
      )}
      {allowed && ad && <Script src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ad}`} strategy="afterInteractive" crossOrigin="anonymous" />}

      {cfg.banner.enabled && consent === null && (
        <div role="dialog" aria-label="Cookie consent" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-deep/95 px-4 py-4 text-sm backdrop-blur">
          <div className="mx-auto flex max-w-[1112px] flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-bone">{cfg.banner.message}</p>
            <div className="flex shrink-0 gap-3">
              <button type="button" onClick={() => choose("declined")} className="border border-white/30 px-5 py-2 uppercase tracking-wide text-bone hover:bg-white/10">{cfg.banner.decline}</button>
              <button type="button" onClick={() => choose("accepted")} className="bg-gold px-5 py-2 font-bold uppercase tracking-wide text-white hover:brightness-110">{cfg.banner.accept}</button>
            </div>
          </div>
        </div>
      )}
      <ConsentAwareViewTracker declined={consent === "declined"} />
    </>
  );
}


// Our own cookie-less page counter. Skipped if the visitor declined cookies, to stay on the safe side.
function ConsentAwareViewTracker({ declined }: { declined: boolean }) {
  const path = usePathname();
  useEffect(() => {
    if (declined) return;
    const body = JSON.stringify({ path, ref: document.referrer });
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [path, declined]);
  return null;
}
