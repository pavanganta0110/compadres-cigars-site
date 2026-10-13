import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";

export const metadata: Metadata = { title: "Become a Customer", alternates: { canonical: "/become-a-customer" } };

export default function Page() {
  return (
    <section className="px-6 pb-14 pt-14 lg:px-[84px]">
      <h1 className="sr-only">Become a Customer</h1>
      <div className="mx-auto max-w-[1112px]">
        <p className="mb-10 text-center leading-6 text-muted">
          Compadres Cigars is a licensed US importer supplying tobacco products to businesses with proper tobacco licensing within their respective state.
        </p>
        <div className="mx-auto max-w-[725px]">
          <p className="mb-6 leading-6 text-muted">Please provide the following information.</p>
          <InquiryForm kind="customer" />
          <p className="mt-6 text-center text-xs text-muted">We will contact you to collect a copy of your tobacco license.</p>
        </div>
      </div>
    </section>
  );
}
