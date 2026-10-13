import Image from "next/image";
import Link from "next/link";

export default function ProductTile({ title, href, image, lines }: { title: string; href: string; image: string; lines: string[] }) {
  return (
    <Link href={href} className="group block text-center">
      <h2 className="mb-4 min-h-14 text-lg uppercase tracking-wide">{title}</h2>
      <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden bg-ink-deep">
        <Image src={image} alt={title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-contain transition group-hover:scale-105" />
      </div>
      <p className="mt-4 text-xs uppercase leading-relaxed tracking-wide text-muted">
        {lines.map((l) => (
          <span key={l} className="block">{l}</span>
        ))}
      </p>
    </Link>
  );
}
