import type { Metadata } from "next";
import Image from "next/image";
import DownloadCard from "@/components/DownloadCard";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "Cardinal Line", alternates: { canonical: "/cardinal-line" } };

const ITEMS = [
  { src: "/images/cardinal-box-press.jpg", name: "Compadres Cardinal Box Press", specs: ["60 x 6.75 Box Press Torpedo", "Tobacco aged 4 years", "Corojo wrap"] },
  { src: "/images/blob-e8367a6.png", name: "Compadres Cardinal Perfecto", specs: ["60 x 6 Perfecto", "Tobacco aged 4 years", "Corojo wrap"] },
];

export default function Page() {
  return (
    <>
      <section className="px-6 pb-14 pt-14 lg:px-[84px]">
        <div className="mx-auto max-w-[1112px]">
          <PageHeading>Compadres Cardinal Line</PageHeading>
          <div className="grid gap-x-12 gap-y-16 text-center md:grid-cols-2">
            {ITEMS.map((i) => (
              <article key={i.name}>
                <h2 className="text-[22px] uppercase leading-[27.5px] text-bone">{i.name}</h2>
                <div className="relative mt-[23px] aspect-[4/3] w-full overflow-hidden">
                  <Image src={i.src} alt={i.name} fill sizes="(min-width: 1280px) 532px, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="mt-6 leading-6 text-muted">
                  {i.specs.map((s) => <p key={s} className="uppercase">{s}</p>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <DownloadCard heading="Download OUR FULL PRODUCT LIST" title="Compadres Cigars (pdf)" />
    </>
  );
}
