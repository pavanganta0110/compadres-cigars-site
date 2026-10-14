import type { Metadata } from "next";
import { pageMeta } from "@/lib/settings";
import InquiryForm from "@/components/InquiryForm";
import PageHeading from "@/components/PageHeading";
import { getSettings } from "@/lib/settings";
import { SITE } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/contact-us-1", { title: "Contact Us" });
}

const icon = "h-8 w-8 fill-current text-bone transition hover:text-gold";

export default async function Page() {
  const s = await getSettings();
  const phone = s.basic.phone || SITE.phone;
  const others = (["youtube", "tiktok", "x", "linkedin", "pinterest"] as const).filter((k) => s.social[k]);
  return (
    <>
      <section className="px-6 pb-16 pt-14 lg:px-[84px] lg:pb-[79px]">
        <div className="mx-auto max-w-[1112px]">
          <PageHeading>Social Media</PageHeading>
          <div className="flex justify-center gap-6">
            {s.social.facebook && <a href={s.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" className={icon} aria-hidden><path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.7V13h2.7v8h3.1z" /></svg>
            </a>}
            {s.social.instagram && <a href={s.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" className={icon} aria-hidden><path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm0 1.8A4 4 0 0 0 3.8 7.8v8.4a4 4 0 0 0 4 4h8.4a4 4 0 0 0 4-4V7.8a4 4 0 0 0-4-4H7.8zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.2-2.6a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" /></svg>
            </a>}
            {others.map((k) => <a key={k} href={s.social[k]} target="_blank" rel="noopener noreferrer" className="self-center text-sm uppercase text-bone hover:text-gold">{k === "x" ? "X" : k}</a>)}
          </div>
        </div>
      </section>
      <section className="bg-ink-deep px-6 pb-14 pt-14 lg:px-[84px] lg:pb-[140px]">
        <div className="mx-auto max-w-[725px]">
          <h2 className="mb-10 text-center font-display lg:mb-[63px] text-[28px] leading-[1.4] text-gold lg:text-[39px]">Contact Us</h2>
          <InquiryForm />
          <p className="mt-12 text-center uppercase leading-6 text-[#919191] lg:mt-[106px]">
            Compadres Cigars is a licensed tobacco importer for the United State&rsquo;s market. We sell to wholesalers, distributors, and retailers nation wide.
          </p>
          <address className="mt-8 text-center not-italic leading-6 text-muted">
            <strong className="font-normal uppercase text-bone">Compadres Cigars</strong><br />
            {s.basic.address || SITE.address}<br />
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="text-gold">{phone}</a>
            {s.basic.email && <><br /><a href={`mailto:${s.basic.email}`} className="text-gold">{s.basic.email}</a></>}
            {s.basic.hours && <><br />{s.basic.hours}</>}
          </address>
        </div>
      </section>
    </>
  );
}
