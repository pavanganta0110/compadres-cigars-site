"use client";

import Image from "next/image";
import { useState } from "react";

// One-page-at-a-time viewer for the catalog PDF (pages pre-rendered to /images/catalog/pNN.jpg).
export default function CatalogViewer({ pages, pdf }: { pages: number; pdf: string }) {
  const [page, setPage] = useState(1);
  const src = (n: number) => `/images/catalog/p${String(n).padStart(2, "0")}.jpg`;
  const btn = "px-3 py-1 text-gold transition hover:underline disabled:cursor-default disabled:opacity-40 disabled:hover:no-underline";

  return (
    <div className="mx-auto mt-[59px] max-w-[733px]">
      <a href={pdf} target="_blank" rel="noopener noreferrer" aria-label="Open the Compadres catalog (PDF)">
        <div className="relative aspect-[733/973] w-full bg-black">
          <Image
            key={page}
            src={src(page)}
            alt={`Compadres catalog, page ${page} of ${pages}`}
            fill
            priority={page === 1}
            quality={90}
            sizes="(min-width: 768px) 733px, 100vw"
            className="object-contain"
          />
        </div>
      </a>
      {/* Warm the next page so "Next" feels instant. */}
      {page < pages && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src(page + 1)} alt="" width={1} height={1} className="hidden" />
      )}
      <nav aria-label="Catalog pages" className="mt-6 flex items-center justify-center gap-2 leading-6 text-gold">
        <button type="button" className={btn} disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          ‹ Previous
        </button>
        <span aria-hidden>|</span>
        <span aria-live="polite">{page}/{pages}</span>
        <span aria-hidden>|</span>
        <button type="button" className={btn} disabled={page === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
          Next ›
        </button>
      </nav>
    </div>
  );
}
