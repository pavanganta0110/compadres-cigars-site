import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { safeNext } from "@/lib/age-gate";
import { HERO_SLIDES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Age Verification",
  robots: { index: false, follow: false },
};

const EXIT_URL = process.env.AGE_GATE_EXIT_URL || "https://www.google.com";

async function Form({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <form action="/api/age-verify" method="POST" className="flex flex-col items-center gap-4 px-8 pb-8">
      <input type="hidden" name="next" value={safeNext(next)} />
      <button
        type="submit"
        autoFocus
        className="rounded bg-gold px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow transition hover:brightness-110"
      >
        I am 21 or older
      </button>
      <a href={EXIT_URL} className="text-xs uppercase tracking-widest text-[#5e5e5e] underline-offset-4 hover:underline">
        I am under 21 — exit
      </a>
    </form>
  );
}

// The site shows through behind a dimmed overlay, like the original popup. There is deliberately no
// close/X control: the only ways forward are confirming, or leaving.
export default function AgeGate({ searchParams }: PageProps<"/age-gate">) {
  return (
    <div className="flex min-h-screen flex-col">
      <div inert aria-hidden className="pointer-events-none flex flex-1 flex-col select-none">
        <Header />
        <Hero slides={HERO_SLIDES.slice(0, 1)} />
        <Footer />
      </div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-title"
          className="w-full max-w-[451px] overflow-hidden bg-white text-center shadow-[0_4px_12px_rgba(117,117,117,0.4)]"
        >
          <div className="relative aspect-[1.85/1] w-full bg-black">
            <Image
              src="/images/age-gate-logo.jpg"
              alt="Compadres Cigars"
              fill
              unoptimized
              priority
              className="object-cover"
              style={{ objectPosition: "50% 41%" }}
            />
          </div>
          <h1 id="age-title" className="px-8 py-6 text-base font-normal uppercase leading-6 text-[#5e5e5e]">
            Entering this website you must be 21 years of age or older
          </h1>
          <Suspense fallback={null}>
            <Form searchParams={searchParams as Promise<{ next?: string }>} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
