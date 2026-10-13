import type { Metadata } from "next";
import DownloadCard from "@/components/DownloadCard";
import PageHeading from "@/components/PageHeading";
import { CATALOG } from "@/lib/site";

export const metadata: Metadata = { title: "Catalog", alternates: { canonical: "/catalog" } };

export default function Page() {
  return (
    <section className="px-4 py-14 sm:py-20">
      <PageHeading>Compadres Catalog</PageHeading>
      <DownloadCard title="Compadres Digital Catalog (pdf)" href={CATALOG} />
    </section>
  );
}
