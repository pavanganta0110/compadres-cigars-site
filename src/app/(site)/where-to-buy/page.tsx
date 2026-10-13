import type { Metadata } from "next";
import PageHeading from "@/components/PageHeading";

export const metadata: Metadata = { title: "Where to Buy", alternates: { canonical: "/where-to-buy" } };

export default function Page() {
  return (
    <section className="px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <PageHeading>Where to Buy</PageHeading>
        <iframe
          title="Compadres Cigars retailer map"
          src="https://my.atlist.com/map/30507883-80d3-4e42-9463-991b81818e92?share=true"
          allow="geolocation 'self' https://my.atlist.com"
          loading="lazy"
          className="h-[600px] w-full border-0"
        />
      </div>
    </section>
  );
}
