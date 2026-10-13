import type { Metadata } from "next";
import Image from "next/image";
import DownloadCard from "@/components/DownloadCard";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "Humidor Program", alternates: { canonical: "/humidor-program" } };

export default function Page() {
  return (
    <>
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <PageHeading>Humidor Program</PageHeading>
          <Image src="/images/blob-88db595.png" alt="Display humidor" width={1200} height={900} sizes="(min-width: 768px) 700px, 100vw" className="mx-auto h-auto w-full" />
          <h2 className="mt-8 text-lg uppercase">Display humidors</h2>
          <p className="mt-2 text-sm uppercase leading-loose text-muted">
            We offer humidors for customers at no charge. Call us for more information.
          </p>
        </div>
      </section>
      <DownloadCard heading="Download Our Full Product List" title="Compadres Cigars (pdf)" />
    </>
  );
}
