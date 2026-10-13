import { BROCHURE } from "@/lib/site";

export default function DownloadCard({ title = "Compadres Cigars Brochure (pdf)", href = BROCHURE, heading }: { title?: string; href?: string; heading?: string }) {
  return (
    <section className="bg-ink-deep px-6 py-14 lg:px-[84px]">
      <div className="mx-auto max-w-[1112px]">
        {heading && <h2 className="mb-10 text-center font-display text-[28px] leading-[1.4] text-gold lg:text-[39px]">{heading}</h2>}
        <a href={href} download className="mx-auto flex max-w-[725px] items-center justify-between bg-panel px-6 py-4 leading-6 transition hover:bg-white/10">
          <span>{title}</span>
          <span className="flex items-center gap-2 text-sm text-gold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M12 3v12m0 0l-5-5m5 5l5-5M4 20h16" /></svg>
            Download
          </span>
        </a>
      </div>
    </section>
  );
}
