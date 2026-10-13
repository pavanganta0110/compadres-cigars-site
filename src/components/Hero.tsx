"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Hero({ slides }: { slides: { src: string; alt: string }[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <div className="relative h-[60vh] min-h-80 w-full overflow-hidden bg-ink-deep sm:h-[75vh]">
      {slides.map((s, n) => (
        <Image
          key={s.src}
          src={s.src}
          alt={s.alt}
          fill
          priority={n === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ${n === i ? "opacity-70" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-x-0 bottom-5 flex justify-center gap-3">
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
