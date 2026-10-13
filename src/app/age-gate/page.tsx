import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { safeNext } from "@/lib/age-gate";

export const metadata: Metadata = {
  title: "Age Verification",
  robots: { index: false, follow: false },
};

const EXIT_URL = process.env.AGE_GATE_EXIT_URL || "https://www.google.com";

async function Form({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <form action="/api/age-verify" method="POST" className="mt-8 flex flex-col items-center gap-4">
      <input type="hidden" name="next" value={safeNext(next)} />
      <button
        type="submit"
        autoFocus
        className="w-full max-w-xs bg-gold px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:brightness-110"
      >
        I am 21 or older
      </button>
      <a href={EXIT_URL} className="text-xs uppercase tracking-widest text-muted underline-offset-4 hover:text-bone hover:underline">
        I am under 21 — exit
      </a>
    </form>
  );
}

export default function AgeGate({ searchParams }: PageProps<"/age-gate">) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-deep px-4 py-10">
      <div role="dialog" aria-modal="true" aria-labelledby="age-title" className="w-full max-w-md bg-white px-6 py-10 text-center text-ink sm:px-10">
        <div className="-mx-6 -mt-10 mb-8 bg-black sm:-mx-10">
          <Image
            src="/images/age-gate-logo.jpg"
            alt="Compadres Cigars"
            width={480}
            height={480}
            unoptimized
            priority
            className="mx-auto h-auto w-full max-w-60"
          />
        </div>
        <h1 id="age-title" className="text-sm font-semibold uppercase leading-relaxed tracking-wide">
          Entering this website you must be 21 years of age or older
        </h1>
        <Suspense fallback={null}>
          <Form searchParams={searchParams as Promise<{ next?: string }>} />
        </Suspense>
        <p className="mt-8 text-xs text-ink/60">{`WARNING: Cigars Are Not A Safe Alternative To Cigarettes.`}</p>
      </div>
    </main>
  );
}
