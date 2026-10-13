import type { Metadata } from "next";
import Image from "next/image";
import PageHeading from "@/components/PageHeading";
import { CATALOG } from "@/lib/site";

export const metadata: Metadata = { title: "Catalog", alternates: { canonical: "/catalog" } };

export default function Page() {
  return (
    <section className="px-6 pb-14 pt-14 lg:px-[84px] lg:pb-[112px]">
      <div className="mx-auto max-w-[1112px]">
        <PageHeading>Compadres Catalog</PageHeading>
        <p className="text-center leading-6">
          <a href={CATALOG} download className="text-gold hover:underline">Download PDF</a>
        </p>
        {/* Preview of the catalog's first page; opens the full PDF. */}
        <a href={CATALOG} target="_blank" rel="noopener noreferrer" className="mx-auto mt-[59px] block max-w-[733px]" aria-label="Open the Compadres catalog (PDF)">
          <Image
            src="/images/catalog-preview.jpg"
            alt="Compadres Cigars catalog cover"
            width={1134}
            height={1500}
            sizes="(min-width: 768px) 733px, 100vw"
            className="h-auto w-full"
          />
        </a>
      </div>
    </section>
  );
}
