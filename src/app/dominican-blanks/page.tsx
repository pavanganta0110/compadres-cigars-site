import type { Metadata } from "next";
import Image from "next/image";
import DownloadCard from "@/components/DownloadCard";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "Dominican Blanks", alternates: { canonical: "/dominican-blanks" } };

export default function Page() {
  return (
    <>
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <PageHeading>Compadres Dominican Blanks</PageHeading>
          <Image src="/images/img_20220407_121811.jpg" alt="Compadres Dominican Blanks" width={1200} height={900} sizes="(min-width: 768px) 700px, 100vw" className="mx-auto h-auto w-full" />
          <h2 className="mt-8 text-lg uppercase">Hand rolled short fill cigars</h2>
          <ul className="mt-4 space-y-1 text-sm uppercase leading-loose text-muted">
            <li>60 x 6 Gran Corona</li>
            <li>52 x 6 Toro</li>
            <li>50 x 5 Robusto</li>
          </ul>
          <p className="mt-6 text-sm uppercase">All available in bundles of 25 cigars</p>
        </div>
      </section>
      <DownloadCard heading="Download Our Full Product List" title="Compadres Cigars (pdf)" />
    </>
  );
}
