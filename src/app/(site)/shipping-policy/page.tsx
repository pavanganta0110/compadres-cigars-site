import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/settings";
import { SHIPPING } from "@/lib/policies";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/shipping-policy", { title: "Shipping Policy" });
}

export default function Page() {
  return <PolicyPage policy={SHIPPING} />;
}
