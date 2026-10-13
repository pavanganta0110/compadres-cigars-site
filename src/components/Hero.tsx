"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = { src: string; alt: string; position: string };

export default function Hero({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="relative h-[420px] w-full overflow-hidden bg-ink sm:h-[600px]">
      {slides.map((s, n) => (
        <Image
          key={s.src}
          src={s.src}
          alt={s.alt}
          fill
          priority={n === 0}
          loading="eager"
          quality={90}
          sizes="100vw"
          style={{ objectPosition: s.position }}
          className={`object-cover transition-opacity duration-1000 ${n === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {/* Flat 25% black overlay, as on the original */}
      <div className="absolute inset-0 bg-black/25" aria-hidden />
      <div className={`absolute inset-x-0 bottom-5 justify-center gap-3 ${slides.length > 1 ? "flex" : "hidden"}`}>
        {slides.map((s, n) => (
          <button
            key={s.src}
            type="button"
            aria-label={`Show slide ${n + 1}`}
            aria-current={n === i}
            onClick={() => setI(n)}
            className={`h-2.5 w-2.5 rounded-full border border-white ${n === i ? "bg-white" : "bg-transparent"}`}
          />
        ))}
      </div>
    </div>
  );
}
