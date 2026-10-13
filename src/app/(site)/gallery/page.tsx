import type { Metadata } from "next";
import Image from "next/image";
import PageHeading from "@/components/PageHeading";
import { GALLERY_ROWS } from "@/lib/site";

export const metadata: Metadata = { title: "Gallery", alternates: { canonical: "/gallery" } };

export default function Page() {
  return (
    <section className="px-6 pb-14 pt-14 lg:px-[84px] lg:pb-[125px]">
      <div className="mx-auto max-w-[1112px]">
        <PageHeading>Photo Gallery</PageHeading>
        <div className="flex flex-col gap-3">
          {GALLERY_ROWS.map((row, r) => (
            <div key={r} className="grid grid-cols-1 items-end gap-2 sm:grid-cols-3">
              {row.map((img) => (
                <Image
                  key={img.file}
                  src={`/images/${img.file}`}
                  alt="Compadres Cigars photo"
                  width={img.w}
                  height={img.h}
                  sizes="(min-width: 1280px) 365px, (min-width: 640px) 33vw, 100vw"
                  quality={85} className="h-auto w-full"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
