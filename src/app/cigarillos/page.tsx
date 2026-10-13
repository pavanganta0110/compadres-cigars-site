import type { Metadata } from "next";
import Image from "next/image";
import DownloadCard from "@/components/DownloadCard";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "Cigarillos", alternates: { canonical: "/cigarillos" } };

export default function Page() {
  return (
    <>
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <PageHeading>Compadres Cigarillos &amp; Flavored Cigars</PageHeading>
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="text-center">
              <Image src="/images/cigarillos.png" alt="Compadres Cigarillos" width={508} height={358} className="mx-auto h-auto w-full max-w-md" />
              <h2 className="mt-6 text-lg uppercase">Compadres Cigarillos</h2>
              <p className="mt-2 text-sm uppercase leading-loose text-muted">
                Hand rolled cigarillos<br />10 cigarillos per wooden tray
              </p>
              <ul className="mt-4 text-sm uppercase leading-loose">
                {["Cognac", "Cherry", "Vanilla", "Chocolate", "Espresso", "Variety"].map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
            <div className="text-center">
              <Image src="/images/blob-52c26e1.png" alt="Compadres Cognac Robusto" width={900} height={700} sizes="(min-width: 768px) 450px, 100vw" className="mx-auto h-auto w-full max-w-md" />
              <h2 className="mt-6 text-lg uppercase">Compadres Cognac Robusto</h2>
              <p className="mt-2 text-sm uppercase leading-loose text-muted">
                50 x 5<br />Bundles of 25 cigars
              </p>
            </div>
          </div>
        </div>
      </section>
      <DownloadCard heading="Download Our Full Product List" title="Compadres Cigars (pdf)" />
    </>
  );
}
