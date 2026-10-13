import type { Metadata } from "next";
import Image from "next/image";
import DownloadCard from "@/components/DownloadCard";
import PageHeading from "@/components/PageHeading";
import { MAIN_LINE } from "@/lib/site";

export const metadata: Metadata = { title: "Main Line Cigars", alternates: { canonical: "/main-line-cigars" } };

export default function Page() {
  return (
    <>
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <PageHeading>Main Line Cigars</PageHeading>
          <div className="space-y-20">
            {MAIN_LINE.map((c) => (
              <article key={c.name} className="text-center">
                <Image src={c.image} alt={`${c.name} box`} width={900} height={800} sizes="(min-width: 768px) 700px, 100vw" className="mx-auto h-auto w-full max-w-xl" />
                <h2 className="mt-6 text-lg font-semibold uppercase">{c.name}</h2>
                <p className="uppercase text-muted">{c.size}</p>
                <dl className="my-6 space-y-1 text-sm">
                  <div><dt className="inline">Filler: </dt><dd className="inline">{c.filler}</dd></div>
                  <div><dt className="inline">Binder: </dt><dd className="inline">{c.binder}</dd></div>
                  <div><dt className="inline">Wrap: </dt><dd className="inline">{c.wrap}</dd></div>
                </dl>
                <div className="mx-auto max-w-lg space-y-3 text-sm leading-relaxed text-bone/90">
                  <p><strong>First Third:</strong> {c.first}</p>
                  <p><strong>Second Third:</strong> {c.second}</p>
                  <p><strong>Final Third:</strong> {c.final}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <DownloadCard heading="Download Our Full Product List" />
    </>
  );
}
