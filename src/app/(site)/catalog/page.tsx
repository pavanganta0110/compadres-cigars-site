import type { Metadata } from "next";
import { pageMeta } from "@/lib/settings";
import CatalogViewer from "@/components/CatalogViewer";
import PageHeading from "@/components/PageHeading";
import { CATALOG } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/catalog", { title: "Catalog" });
}

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
