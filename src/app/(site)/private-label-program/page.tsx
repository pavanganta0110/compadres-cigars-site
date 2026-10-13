import type { Metadata } from "next";
import Image from "next/image";
import DownloadCard from "@/components/DownloadCard";
import PageHeading from "@/components/PageHeading";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Private Label Program", alternates: { canonical: "/private-label-program" } };

const STEPS = [
  { src: "/images/whatsapp-image-2023-11-06-at-13.51.50_90554904.jpg", title: "Create your cigar", alt: "Hands processing drying tobacco" },
  { src: "/images/img_20230407_103018.jpg", title: "Design your ring", alt: "Two cigars with blue rings" },
  { src: "/images/img20220617095707.jpg", title: "Customize your box", alt: "Stacks of blue cigar boxes" },
];

export default function Page() {
  return (
    <>
      <section className="px-6 pb-14 pt-14 lg:px-[84px]">
        <div className="mx-auto max-w-[1112px]">
          <PageHeading>Compadres Private Label Program</PageHeading>
          <div className="grid gap-x-12 gap-y-12 text-center md:grid-cols-3">
            {STEPS.map((s, n) => (
              <div key={s.title}>
                <h2 className="text-[22px] uppercase leading-[27.5px] text-bone">{s.title}</h2>
                <div className="relative mt-6 aspect-[2/1] w-full overflow-hidden">
                  <Image src={s.src} alt={s.alt} fill sizes="(min-width: 1280px) 339px, (min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                {n === 1 && (
                  <div className="mt-6 uppercase leading-6 text-muted">
                    <p>Call us for more information</p>
                    <p><a href={SITE.phoneHref}>{SITE.phone}</a></p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <DownloadCard heading="Download OUR FULL PRODUCT LIST" title="Compadres Cigars (pdf)" />
    </>
  );
}
