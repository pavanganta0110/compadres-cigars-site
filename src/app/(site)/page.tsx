import type { Metadata } from "next";
import Hero from "@/components/Hero";

export const metadata: Metadata = { title: { absolute: "Compadres Cigars" }, alternates: { canonical: "/" } };

// Same four slides, order and focal points as the original site (full-size originals).
const SLIDES = [
  { src: "/images/hero/slide-1.jpg", alt: "Smoking a Compadres cigar", position: "50.26% 25.65%" },
  { src: "/images/hero/slide-2.jpg", alt: "Compadres cigar beside a glass and cigar ashtray", position: "50.7% 68.26%" },
  { src: "/images/hero/slide-3.jpg", alt: "Compadres Cardinal box press cigars", position: "11.55% 70%" },
  { src: "/images/hero/slide-4.png", alt: "Compadres Robusto box", position: "47.18% 78.7%" },
];

export default function Home() {
  return (
    <>
      <h1 className="sr-only">Compadres Cigars — premium hand rolled cigars</h1>
      <Hero slides={SLIDES} />
    </>
  );
}
