import type { Metadata } from "next";
import { pageMeta } from "@/lib/settings";
import CustomerForm from "@/components/CustomerForm";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/become-a-customer", { title: "Become a Customer" });
}

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
