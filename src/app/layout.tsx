import type { Metadata } from "next";
import { Archivo_Black, Montserrat } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { SITE } from "@/lib/site";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const archivo = Archivo_Black({ variable: "--font-archivo", subsets: ["latin"], weight: "400" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.seo.defaultTitle || SITE.name;
  const description = s.seo.defaultDescription || SITE.description;
  return {
    metadataBase: new URL(SITE.url),
    title: { default: title, template: `%s | ${title}` },
    description,
    authors: [{ name: SITE.name }],
    openGraph: { type: "website", siteName: s.basic.businessName || SITE.name, title, description, url: "/", images: [s.seo.ogImage || "/images/suzannefryerphotography_compadres--2.jpg"] },
    icons: s.favicon.url
      ? { icon: s.favicon.url, apple: s.favicon.url }
      : { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.png", type: "image/png", sizes: "512x512" }], apple: "/apple-touch-icon.png" },
    ...(s.searchConsole.content && { verification: { google: s.searchConsole.content } }),
    other: {
      ...(s.facebookTag.content && { "facebook-domain-verification": s.facebookTag.content }),
      ...(s.pinterestTag.content && { "p:domain_verify": s.pinterestTag.content }),
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} ${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
