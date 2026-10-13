import { BROCHURE } from "@/lib/site";

export default function DownloadCard({ title = "Compadres Cigars Brochure (pdf)", href = BROCHURE, heading }: { title?: string; href?: string; heading?: string }) {
  return (
    <section className="bg-ink-deep px-4 py-14">
      <div className="mx-auto max-w-2xl">
        {heading && <h2 className="mb-8 text-center font-display text-3xl uppercase text-gold">{heading}</h2>}
        <a href={href} download className="flex items-center justify-between rounded bg-panel px-5 py-4 transition hover:bg-white/10">
          <span>{title}</span>
          <span className="text-sm text-muted">↓ Download</span>
        </a>
      </div>
    </section>
  );
}
