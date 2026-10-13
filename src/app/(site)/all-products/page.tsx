import type { Metadata } from "next";
import DownloadCard from "@/components/DownloadCard";
import PageHeading from "@/components/PageHeading";
import ProductTile from "@/components/ProductTile";

export const metadata: Metadata = { title: { absolute: "Compadres Cigars - online" }, alternates: { canonical: "/all-products" } };

const TILES = [
  { title: "Compadres Main Line", href: "/main-line-cigars", image: "/images/blob-2c0c5f8.png", lines: ["Our main line of premium cigars", "Hand rolled"] },
  { title: "Compadres Cardinal Line", href: "/cardinal-line", image: "/images/blob-09adc1b.png", lines: ["Compadres Cardinal Line", "The finest tobacco aged to perfection"] },
  { title: "Compadres Cigarillos & Flavored Cigars", href: "/cigarillos", image: "/images/blob-3c1a27b.png", lines: ["Cigarillos & flavored cigars", "Hand rolled"] },
  { title: "Compadres Dominican Blanks", href: "/dominican-blanks", image: "/images/compadres-cigars-60-x-6-crop.jpg", lines: ["Dominican Blanks", "Hand rolled short fill"] },
  { title: "Compadres Private Label", href: "/private-label-program", image: "/images/whatsapp-image-2023-11-06-at-13.38.05_9b6786cc.jpg", lines: ["Private label program", "Custom rings, boxes, and cigars"] },
  { title: "Compadres Humidor Program", href: "/humidor-program", image: "/images/blob-4684b34.png", lines: ["Humidor program"] },
];

export default function Page() {
  return (
    <>
      <section className="px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <PageHeading>Compadres Cigars</PageHeading>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {TILES.map((t) => <ProductTile key={t.href} {...t} />)}
          </div>
        </div>
      </section>
      <DownloadCard heading="Cigar Importer" />
    </>
  );
}
