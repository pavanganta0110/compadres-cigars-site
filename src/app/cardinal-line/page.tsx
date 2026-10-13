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
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <PageHeading>Compadres Cardinal Line</PageHeading>
          <div className="grid gap-12 md:grid-cols-2">
            {ITEMS.map((i) => (
              <article key={i.name} className="text-center">
                <Image src={i.src} alt={i.name} width={900} height={900} sizes="(min-width: 768px) 450px, 100vw" className="mx-auto h-auto w-full" />
                <h2 className="mt-6 text-lg uppercase">{i.name}</h2>
                <p className="mt-2 text-sm uppercase leading-loose text-muted">
                  {i.specs.map((s) => <span key={s} className="block">{s}</span>)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <DownloadCard heading="Download Our Full Product List" title="Compadres Cigars (pdf)" />
    </>
  );
}
