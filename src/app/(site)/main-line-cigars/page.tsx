import type { Metadata } from "next";
import Image from "next/image";
import DownloadCard from "@/components/DownloadCard";
import PageHeading from "@/components/PageHeading";
import { MAIN_LINE } from "@/lib/site";

export const metadata: Metadata = { title: "Main Line Cigars", alternates: { canonical: "/main-line-cigars" } };

const gap = <div className="h-6" aria-hidden />;

export default function Page() {
  return (
    <>
      <section className="px-6 pb-14 pt-14 lg:px-[84px] lg:pb-[81px]">
        <div className="mx-auto max-w-[1112px]">
          <PageHeading>Main Line Cigars</PageHeading>
          <div className="mx-auto max-w-[725px] text-center leading-6 text-muted">
            {MAIN_LINE.map((c, n) => (
              <article key={c.name} className={n === 0 ? "" : n === 1 ? "mt-10" : "mt-4"}>
                <Image src={c.image} alt={`${c.name} box`} width={c.w} height={c.h} sizes="(min-width: 768px) 725px, 100vw" quality={90} className="mx-auto h-auto w-full" />
                <p className="mt-[3px] uppercase">{c.name}</p>
                <p>{c.size}</p>
                {gap}
                <p>Filler: {c.filler}</p>
                <p>Binder: {c.binder}</p>
                <p>Wrap: {c.wrap}</p>
                {gap}
                {c.first.map((l) => <p key={l}>{l}</p>)}
                {gap}
                {c.second.map((l) => <p key={l}>{l}</p>)}
                {gap}
                {c.final.map((l) => <p key={l}>{l}</p>)}
              </article>
            ))}
          </div>
        </div>
      </section>
      <DownloadCard heading="Download OUR FULL PRODUCT LIST" title="Compadres Cigars (pdf)" />
    </>
  );
}
