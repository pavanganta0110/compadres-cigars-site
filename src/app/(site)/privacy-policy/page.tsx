import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { pageMeta } from "@/lib/settings";
import { PRIVACY } from "@/lib/policies";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/privacy-policy", { title: "Privacy Policy" });
}

export default function Page() {
  return <PolicyPage policy={PRIVACY} />;
}
