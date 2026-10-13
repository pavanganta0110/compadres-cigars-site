import type { Metadata } from "next";
import Image from "next/image";
import PageHeading from "@/components/PageHeading";
import { GALLERY } from "@/lib/site";

export const metadata: Metadata = { title: "Gallery", alternates: { canonical: "/gallery" } };

export default function Page() {
  return (
    <section className="px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <PageHeading>Photo Gallery</PageHeading>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {GALLERY.map((f, i) => (
            <li key={f} className="relative aspect-square overflow-hidden bg-ink-deep">
              <Image src={`/images/${f}`} alt={`Compadres Cigars photo ${i + 1}`} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition hover:scale-105" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
