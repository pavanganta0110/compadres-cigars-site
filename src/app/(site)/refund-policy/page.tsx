import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/settings";
import { REFUND } from "@/lib/policies";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/refund-policy", { title: "Refund Policy" });
}

export default function Page() {
  return <PolicyPage policy={REFUND} />;
}
