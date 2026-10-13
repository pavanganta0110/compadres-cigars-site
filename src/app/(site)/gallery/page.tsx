import type { Metadata } from "next";
import Image from "next/image";
import PageHeading from "@/components/PageHeading";
import { GALLERY_ROWS, type GalleryImage } from "@/lib/site";

export const metadata: Metadata = { title: "Gallery", alternates: { canonical: "/gallery" } };

// Masonry like the original: N columns, tops aligned, each photo goes into the currently shortest column.
function masonry(images: GalleryImage[], cols: number) {
  const out: { items: GalleryImage[]; h: number }[] = Array.from({ length: cols }, () => ({ items: [], h: 0 }));
  for (const img of images) {
    const c = out.reduce((a, b) => (b.h < a.h ? b : a));
    c.items.push(img);
    c.h += img.h / img.w;
  }
  return out.map((c) => c.items);
}

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

export default function Page() {
  const all = GALLERY_ROWS.flat();
  const desktop = masonry(all, 3);
  const phone = masonry(all, 2);
  return (
    <section className="px-6 pb-14 pt-14 lg:px-[84px] lg:pb-[125px]">
      <div className="mx-auto max-w-[1112px]">
        <PageHeading>Photo Gallery</PageHeading>

        <div className="hidden gap-2 sm:grid sm:grid-cols-3">
          {desktop.map((col, i) => (
            <div key={i} className="flex flex-col gap-2">
              {col.map((img) => <Photo key={img.file} img={img} sizes="(min-width: 1280px) 365px, 33vw" />)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:hidden">
          {phone.map((col, i) => (
            <div key={i} className="flex flex-col gap-2">
              {col.map((img) => <Photo key={img.file} img={img} sizes="50vw" />)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
