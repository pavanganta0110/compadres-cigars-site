import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "Become a Customer", alternates: { canonical: "/become-a-customer" } };

export default function Page() {
  return (
    <section className="px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <PageHeading>Become a Customer</PageHeading>
        <p className="mb-8 text-center text-sm leading-relaxed">
          Compadres Cigars is a licensed US importer supplying tobacco products to businesses with proper tobacco licensing within their respective state. Please provide the following information.
        </p>
        <InquiryForm kind="customer" />
        <p className="mt-6 text-center text-xs text-muted">
          We will contact you to collect a copy of your tobacco license.
        </p>
      </div>
    </section>
  );
}
