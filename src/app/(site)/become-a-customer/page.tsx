import type { Metadata } from "next";
import CustomerForm from "@/components/CustomerForm";

export const metadata: Metadata = { title: "Become a Customer", alternates: { canonical: "/become-a-customer" } };

export default function Page() {
  return (
    <section className="bg-white px-6 pb-14 pt-14 lg:px-[84px]">
      <h1 className="sr-only">Become a Customer</h1>
      <div className="mx-auto max-w-[1112px]">
        <CustomerForm />
      </div>
    </section>
  );
}
