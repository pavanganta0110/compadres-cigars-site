import type { Metadata } from "next";
import Image from "next/image";
import PageHeading from "@/components/PageHeading";
import { GALLERY_ROWS, type GalleryImage } from "@/lib/site";

export const metadata: Metadata = { title: "Gallery", alternates: { canonical: "/gallery" } };

function Photo({ img, sizes }: { img: GalleryImage; sizes: string }) {
  return (
    <Image
      src={`/images/${img.file}`}
      alt="Compadres Cigars photo"
      width={img.w}
      height={img.h}
      sizes={sizes}
      quality={85}
      className="h-auto w-full"
    />
  );
}

// Rows of three, bottom-aligned, on tablets/desktops; rows of two on phones (as on the original).
const phoneRows = (() => {
  const flat = GALLERY_ROWS.flat();
  const out: GalleryImage[][] = [];
  for (let i = 0; i < flat.length; i += 2) out.push(flat.slice(i, i + 2));
  return out;
})();

export default function Page() {
  return (
    <section className="px-6 pb-14 pt-14 lg:px-[84px] lg:pb-[125px]">
      <div className="mx-auto max-w-[1112px]">
        <PageHeading>Photo Gallery</PageHeading>

        <div className="hidden flex-col gap-3 sm:flex">
          {GALLERY_ROWS.map((row, r) => (
            <div key={r} className="grid grid-cols-3 items-end gap-2">
              {row.map((img) => (
                <Photo key={img.file} img={img} sizes="(min-width: 1280px) 365px, 33vw" />
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:hidden">
          {phoneRows.map((row, r) => (
            <div key={r} className="grid grid-cols-2 items-end gap-2">
              {row.map((img) => (
                <Photo key={img.file} img={img} sizes="50vw" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
