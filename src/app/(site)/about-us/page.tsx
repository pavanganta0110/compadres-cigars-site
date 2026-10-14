import type { Metadata } from "next";
import { pageMeta } from "@/lib/settings";
import PageHeading from "@/components/PageHeading";

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta("/about-us", { title: "About Us" });
}

export default function Page() {
  return (
    <section className="px-6 pb-14 pt-14 lg:px-[84px] lg:pb-[152px]">
      <div className="mx-auto max-w-[1112px] text-center leading-6 text-muted">
        <PageHeading mixed>About Us</PageHeading>
        <p>
          Compadres Cigars are hand made in Tamboril, Dominican Republic - the world capital of cigars. Each cigar is made with hand selected tobacco free of chemicals and dyes, carefully inspected for the finest result. Enjoy the experience!
        </p>
        <p className="mt-6">Our History</p>
        <p className="mt-6">Comprades Cigars is a division of GEO Foods. Spencer Woodard, founder of GEO Foods, has been in the agricultural industry for last 15 years. Much of his business has involved imports and exports primarily from Latin America. In doing so, he established relationships in the Dominican Republic, as well as other Latin American countries.</p>
        <p>GEO Foods established an office in the Dominican Republic, in 2019, and sent Jose Suarez as our <em>man-on-the ground</em> to oversee manufacturing and logistics. Jose, who is a Cuban National from Havana, Cuba, lived in the United States for over 30 years before moving to the Dominican Republic. Jose is also a lifetime cigar aficionado. In 2019, Jose met Frances Santana, who is a Dominican National from Tamboril. Together, they came up with specialty blends using top quality tobacco and thus the Compadres Cigar line was created.</p>
        <p>After the blends, shapes, and sizes of the cigar line were established, Spencer and Jose conducted systematic and methodological market tests across a broad range of veteran cigar smokers. After 2 years of development, Compadres Cigars now has a full line of premium cigars.</p>
        <p>Given that Geo Foods presence is well established in the Dominican, the Compadres&rsquo; brand is overseen from production to importing and distribution. Not only do our customers enjoy a fine cigar, they can be confident that the Compadres brand is indeed, an endeavor to provide the best cigar possible to our customers.</p>
        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-[22px] leading-[27.5px] text-bone">PRODUCTION</h2>
            <p>Compadres Cigars are made from the finest tobacco grown around the world. From the tobacco fields to the finished product, each step is closely monitored and completely done by hand. We pride ourselves in ensuring quality and consistency.</p>
          </div>
          <div>
            <h2 className="mb-6 text-[22px] leading-[27.5px] text-bone">DISTRIBUTION</h2>
            <p>Compadres Cigars are imported directly from the Dominican Republic to the United States. Our offices are in Kansas City, MO and Santiago, Dominican Republic. We can ship directly to any US tobacco business. Please contact us for more information.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
