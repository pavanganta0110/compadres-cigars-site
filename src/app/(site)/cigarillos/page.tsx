import type { Metadata } from "next";
import { pageMeta } from "@/lib/settings";
import Image from "next/image";
import DownloadCard from "@/components/DownloadCard";
import AddToCart from "@/components/AddToCart";
import PageHeading from "@/components/PageHeading";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/cigarillos", { title: "Cigarillos" });
}

const ITEMS = [
  {
    src: "/images/blob-3c1a27b.png", alt: "Compadres Cigarillos", name: "Compadres Cigarillos",
    lines: ["Hand rolled cigarillos", "10 cigarillos per wooden tray", "Cognac", "Cherry", "Vanilla", "Chocolate", "Espresso", "Variety"],
    options: ["Cognac", "Cherry", "Vanilla", "Chocolate", "Espresso", "Variety"].map((f) => ({ id: `cigarillos-${f.toLowerCase()}`, label: f })),
    unit: "tray of 10",
  },
  {
    src: "/images/blob-52c26e1.png", alt: "Compadres Cognac Robusto", name: "Compadres Cognac Robusto",
    lines: ["50 x 5", "Bundles of 25 cigars"],
    options: [{ id: "cognac-robusto", label: "Cognac Robusto" }],
    unit: "bundle of 25",
  },
];

export default function Page() {
  return (
    <>
      <section className="px-6 pb-14 pt-14 lg:px-[84px]">
        <div className="mx-auto max-w-[1112px]">
          <PageHeading>Compadres Cigarillos &amp; Flavored Cigars</PageHeading>
          <div className="grid gap-x-12 gap-y-16 text-center md:grid-cols-2">
            {ITEMS.map((i) => (
              <article key={i.name}>
                <h2 className="text-[22px] uppercase leading-[27.5px] text-bone">{i.name}</h2>
                <div className="relative mt-[23px] aspect-[2/1] w-full overflow-hidden">
                  <Image src={i.src} alt={i.alt} fill sizes="(min-width: 1280px) 532px, (min-width: 768px) 50vw, 100vw" quality={85} className="object-cover" />
                </div>
                <div className="mt-6 leading-6 text-muted">
                  {i.lines.map((l) => <p key={l} className="uppercase">{l}</p>)}
                </div>
                <AddToCart options={i.options} unit={i.unit} />
              </article>
            ))}
          </div>
        </div>
      </section>
      <DownloadCard heading="Download OUR FULL PRODUCT LIST" title="Compadres Cigars (pdf)" />
    </>
  );
}
