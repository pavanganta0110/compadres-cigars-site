import type { Metadata } from "next";
import { Archivo_Black, Montserrat } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const archivo = Archivo_Black({ variable: "--font-archivo", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s | ${SITE.name}` },
  description: SITE.description,
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    url: "/",
    images: ["/images/suzannefryerphotography_compadres--2.jpg"],
  },
  icons: { icon: "/images/lion-crest-main-logo-bold-black-background.jpg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} ${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
