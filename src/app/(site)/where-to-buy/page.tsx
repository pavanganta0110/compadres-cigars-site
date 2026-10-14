import type { Metadata } from "next";
import { pageMeta } from "@/lib/settings";
import { SITE } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/where-to-buy", { title: "Where to Buy" });
}

export default function Page() {
  return (
    <section className="px-6 pb-14 pt-14 lg:px-[84px]">
      <h1 className="sr-only">Where to Buy {SITE.name}</h1>
      <div className="mx-auto max-w-[1112px]">
        <iframe
          title="Compadres Cigars retailer map"
          src="https://my.atlist.com/map/30507883-80d3-4e42-9463-991b81818e92?share=true"
          allow="geolocation 'self' https://my.atlist.com"
          loading="lazy"
          className="h-[379px] w-full border-0"
        />
      </div>
    </section>
  );
}
