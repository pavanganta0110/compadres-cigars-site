import type { Metadata } from "next";
import Image from "next/image";
import DownloadCard from "@/components/DownloadCard";
import PageHeading from "@/components/PageHeading";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Private Label Program", alternates: { canonical: "/private-label-program" } };

const STEPS = [
  { src: "/images/whatsapp-image-2023-11-06-at-13.51.50_90554904.jpg", title: "Create your cigar" },
  { src: "/images/img_20230407_103018.jpg", title: "Design your ring" },
  { src: "/images/img20220617095707.jpg", title: "Customize your box" },
];

export default function Page() {
  return (
    <>
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <PageHeading>Compadres Private Label Program</PageHeading>
          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map((s) => (
              <figure key={s.title} className="text-center">
                <div className="relative aspect-square overflow-hidden bg-ink-deep">
                  <Image src={s.src} alt={s.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <figcaption className="mt-4 text-lg uppercase">{s.title}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-12 text-center uppercase">
            Call us for more information<br />
            <a href={SITE.phoneHref} className="text-gold">{SITE.phone}</a>
          </p>
        </div>
      </section>
      <DownloadCard heading="Download Our Full Product List" title="Compadres Cigars (pdf)" />
    </>
  );
}
