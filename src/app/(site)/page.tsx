import type { Metadata } from "next";
import Hero from "@/components/Hero";
import { HERO_SLIDES } from "@/lib/site";

export const metadata: Metadata = { title: { absolute: "Compadres Cigars" }, alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <h1 className="sr-only">Compadres Cigars — premium hand rolled cigars</h1>
      <Hero slides={HERO_SLIDES} />
    </>
  );
}
