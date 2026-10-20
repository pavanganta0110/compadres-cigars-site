import type { Metadata } from "next";
import PageHeading from "@/components/PageHeading";
import CheckoutForm from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <section className="px-6 pb-14 pt-14 lg:px-[84px]">
      <div className="mx-auto max-w-[1112px]">
        <PageHeading>Checkout</PageHeading>
        <CheckoutForm />
      </div>
    </section>
  );
}
