import type { Metadata } from "next";
import CatalogViewer from "@/components/CatalogViewer";
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
        <CatalogViewer pages={24} pdf={CATALOG} />
      </div>
    </section>
  );
}
