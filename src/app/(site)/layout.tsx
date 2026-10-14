import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Tracking from "@/components/Tracking";
import { getSettings } from "@/lib/settings";
import { SITE } from "@/lib/site";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  const t = s.cookieBanner;
  const sameAs = Object.values(s.social).filter(Boolean);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.basic.businessName || SITE.name,
    url: SITE.url,
    description: s.basic.description || SITE.description,
    telephone: s.basic.phone || SITE.phone,
    address: s.basic.address || SITE.address,
    ...(s.basic.email && { email: s.basic.email }),
    ...(sameAs.length && { sameAs }),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Header phone={s.basic.phone || SITE.phone} />
      <main className="flex-1">{children}</main>
      <Footer />
      <Tracking
        cfg={{
          banner: { enabled: t.enabled === "1", message: t.message, accept: t.accept || "Accept", decline: t.decline || "Decline" },
          ga: s.ga.id, googleTag: s.googleTag.id, gtm: s.gtm.id, pixel: s.pixel.id, adsense: s.adsense.client,
        }}
      />
    </>
  );
}
