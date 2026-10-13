import type { Metadata } from "next";
import Image from "next/image";
import DownloadCard from "@/components/DownloadCard";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "Humidor Program", alternates: { canonical: "/humidor-program" } };

export default function Page() {
  return (
    <>
      <section className="px-6 pb-14 pt-14 lg:px-[84px]">
        <div className="mx-auto max-w-[1112px]">
          <PageHeading>Humidor Program</PageHeading>
          <div className="grid items-center gap-x-12 gap-y-8 md:grid-cols-3">
            <div className="relative aspect-[339/465] w-full overflow-hidden">
              <Image src="/images/blob-88db595.png" alt="Display humidor" fill sizes="(min-width: 1280px) 339px, (min-width: 768px) 33vw, 100vw" quality={85} className="object-cover" />
            </div>
            <div className="md:col-span-2">
              <h2 className="text-[22px] uppercase leading-[27.5px] text-bone">Display Humidors</h2>
              <p className="mt-6 leading-6 text-muted">WE OFFER HUMIDORS FOR CUSTOMERS AT NO CHARGE. CALL US FOR MORE INFORMATION.</p>
            </div>
          </div>
        </div>
      </section>
      <DownloadCard heading="Download OUR FULL PRODUCT LIST" title="Compadres Cigars (pdf)" />
    </>
  );
}
