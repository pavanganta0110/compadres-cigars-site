import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/settings";
import { TERMS } from "@/lib/policies";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/terms-and-conditions", { title: "Terms & Conditions" });
}

export default function Page() {
  return <PolicyPage policy={TERMS} />;
}
