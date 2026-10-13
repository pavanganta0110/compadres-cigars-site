import type { Metadata } from "next";
import Image from "next/image";
import DownloadCard from "@/components/DownloadCard";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "Dominican Blanks", alternates: { canonical: "/dominican-blanks" } };

export default function Page() {
  return (
    <>
      <section className="px-6 pb-14 pt-14 lg:px-[84px]">
        <div className="mx-auto max-w-[1112px]">
          <PageHeading>Dominican Blanks</PageHeading>
          <div className="mx-auto max-w-[725px] text-center">
            <h2 className="text-[22px] uppercase leading-[27.5px] text-bone">Compadres Dominican Blanks</h2>
            <div className="relative mt-[23px] aspect-[2/1] w-full overflow-hidden">
              <Image src="/images/img_20220407_121811.jpg" alt="Compadres Dominican Blanks" fill sizes="(min-width: 768px) 725px, 100vw" className="object-cover" />
            </div>
            <div className="mt-6 leading-6 text-muted">
              <p>HAND ROLLED SHORT FILL CIGARS</p>
              <p>60 X 6 &nbsp;GRAN CORONA</p>
              <p>52 X 6 &nbsp;TORO</p>
              <p>50 X 5 &nbsp;ROBUSTO</p>
              <p>ALL AVAILABLE IN BUNDLES OF 25 CIGARS</p>
            </div>
          </div>
        </div>
      </section>
      <DownloadCard heading="Download OUR FULL PRODUCT LIST" title="Compadres Cigars (pdf)" />
    </>
  );
}
