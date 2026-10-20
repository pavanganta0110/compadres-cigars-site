import type { Metadata } from "next";
import PageHeading from "@/components/PageHeading";
import CartView from "./CartView";

export const metadata: Metadata = { title: "Cart", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <section className="px-6 pb-14 pt-14 lg:px-[84px]">
      <div className="mx-auto max-w-[1112px]">
        <PageHeading>Your Cart</PageHeading>
        <CartView />
      </div>
    </section>
  );
}
