import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import PageHeading from "@/components/PageHeading";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact Us", alternates: { canonical: "/contact-us-1" } };

export default function Page() {
  return (
    <section className="px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        <PageHeading>Contact Us</PageHeading>
        <p className="mb-8 text-center text-sm">
          <a href={SITE.facebook} className="mx-3 uppercase text-gold hover:underline" rel="noopener noreferrer" target="_blank">Facebook</a>
          <a href={SITE.instagram} className="mx-3 uppercase text-gold hover:underline" rel="noopener noreferrer" target="_blank">Instagram</a>
        </p>
        <InquiryForm kind="contact" />
        <p className="mt-12 text-center text-sm uppercase leading-relaxed text-muted">
          Compadres Cigars is a licensed tobacco importer for the United State&rsquo;s market. We sell to wholesalers, distributors, and retailers nation wide.
        </p>
        <address className="mt-8 text-center text-sm not-italic leading-loose">
          <strong className="uppercase">Compadres Cigars</strong><br />
          {SITE.address}<br />
          <a href={SITE.phoneHref} className="text-gold">{SITE.phone}</a>
        </address>
      </div>
    </section>
  );
}
