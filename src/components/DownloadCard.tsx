import { BROCHURE } from "@/lib/site";

export default function DownloadCard({ title = "Compadres Cigars Brochure (pdf)", href = BROCHURE, heading }: { title?: string; href?: string; heading?: string }) {
  return (
    <section className="bg-ink-deep px-6 py-14 lg:px-[84px]">
      <div className="mx-auto max-w-[1112px]">
        {heading && <h2 className="mb-10 text-center font-display text-[28px] leading-[1.4] text-gold lg:text-[39px]">{heading}</h2>}
        <a href={href} download className="mx-auto flex max-w-[700px] items-center justify-between rounded bg-panel px-6 py-4 leading-6 transition hover:bg-white/10">
          <span>{title}</span>
          <span className="text-sm text-muted">↓ Download</span>
        </a>
      </div>
    </section>
  );
}
