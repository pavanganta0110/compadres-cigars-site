import Image from "next/image";
import Link from "next/link";

export default function ProductTile({ title, href, image, lines, position = "50% 50%" }: { title: string; href: string; image: string; lines: string[]; position?: string }) {
  return (
    <Link href={href} className="group block text-center">
      <h2 className="flex min-h-[55px] items-start justify-center text-[22px] leading-[27.5px] uppercase text-bone">{title}</h2>
      <div className="relative mt-6 aspect-[2/1] w-full overflow-hidden">
        <Image src={image} alt={title} fill sizes="(min-width: 1280px) 339px, (min-width: 768px) 33vw, 100vw" quality={85} style={{ objectPosition: position }} className="object-cover" />
      </div>
      <div className="mt-6 leading-6 text-muted">
        {lines.map((l) => (
          <p key={l} className="uppercase">{l}</p>
        ))}
      </div>
    </Link>
  );
}
