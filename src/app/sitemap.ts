import type { MetadataRoute } from "next";
import { NAV, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set<string>(["/catalog"]);
  for (const n of NAV) {
    paths.add(n.href);
    n.children?.forEach((c) => paths.add(c.href));
  }
  return [...paths].map((p) => ({ url: `${SITE.url}${p === "/" ? "" : p}` }));
}
