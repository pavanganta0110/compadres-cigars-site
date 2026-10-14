import type { Metadata } from "next";
import { pageMeta } from "@/lib/settings";
import Hero from "@/components/Hero";
import { HERO_SLIDES } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/", { title: { absolute: "Compadres Cigars" } });
}

export default function Home() {
  return (
    <>
      <h1 className="sr-only">Compadres Cigars — premium hand rolled cigars</h1>
      <Hero slides={HERO_SLIDES} />
    </>
  );
}
