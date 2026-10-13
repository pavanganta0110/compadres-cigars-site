import type { Metadata } from "next";
import Hero from "@/components/Hero";

export const metadata: Metadata = { title: { absolute: "Compadres Cigars" }, alternates: { canonical: "/" } };

const SLIDES = [
  { src: "/images/suzannefryerphotography_compadres--2.jpg", alt: "Smoking a Compadres cigar" },
  { src: "/images/suzannefryerphotography_compadres-7194.jpg", alt: "Compadres cigars lifestyle" },
  { src: "/images/cover.jpg", alt: "Compadres Cigars" },
  { src: "/images/robusto-box.png", alt: "Compadres Robusto box" },
];

export default function Home() {
  return (
    <>
      <h1 className="sr-only">Compadres Cigars — premium hand rolled cigars</h1>
      <Hero slides={SLIDES} />
    </>
  );
}
