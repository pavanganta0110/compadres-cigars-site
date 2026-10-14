import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { SITE } from "@/lib/site";
import { getStore } from "@/lib/store";

// ---------------------------------------------------------------------------------------------
// Dashboard-editable settings. Each section is one row in `site_settings` (key = section key).
// Everything that ends up in the public HTML is validated against a strict pattern (on save AND
// again at render), so a pasted value can never inject script into the site.
// ---------------------------------------------------------------------------------------------

export type Field = {
  name: string;
  label: string;
  kind?: "text" | "textarea" | "url" | "email" | "tel" | "checkbox";
  placeholder?: string;
  help?: string;
  pattern?: RegExp;
  patternHelp?: string;
  max?: number;
};

export type Section = {
  key: string;
  slug: string;
  group: "site" | "tracking";
  title: string;
  description: string;
  fields: Field[];
};

const ID = (re: RegExp, help: string) => ({ pattern: re, patternHelp: help });

export const SECTIONS: Section[] = [
  {
    key: "basic", slug: "basic-information", group: "site", title: "Basic Information",
    description: "Business details used on the site (top bar phone, contact page) and in search-engine business data.",
    fields: [
      { name: "businessName", label: "Business name", max: 120 },
      { name: "description", label: "Short description", kind: "textarea", max: 300, help: "Used as the default meta description." },
      { name: "phone", label: "Phone", kind: "tel", max: 40 },
      { name: "email", label: "Public email", kind: "email", max: 120 },
      { name: "address", label: "Address", kind: "textarea", max: 300 },
      { name: "hours", label: "Business hours", kind: "textarea", max: 300, help: "Optional, e.g. Mon–Fri 9am–5pm CT." },
    ],
  },
  {
    key: "social", slug: "social-media-links", group: "site", title: "Social Media Links",
    description: "Shown on the Contact page and added to the site's business data. Leave blank to hide a network.",
    fields: ["facebook", "instagram", "youtube", "tiktok", "x", "linkedin", "pinterest"].map((n) => ({
      name: n, label: n === "x" ? "X (Twitter)" : n[0].toUpperCase() + n.slice(1), kind: "url" as const, placeholder: "https://", max: 300,
    })),
  },
  {
    key: "cookieBanner", slug: "cookie-banner", group: "tracking", title: "Cookie Banner",
    description: "When on, analytics and advertising tags below load only after a visitor clicks Accept.",
    fields: [
      { name: "enabled", label: "Show a cookie banner", kind: "checkbox" },
      { name: "message", label: "Banner message", kind: "textarea", max: 300 },
      { name: "accept", label: "Accept button", max: 30 },
      { name: "decline", label: "Decline button", max: 30 },
    ],
  },
  {
    key: "ga", slug: "google-analytics", group: "tracking", title: "Google Analytics",
    description: "Google Analytics 4 measurement ID.",
    fields: [{ name: "id", label: "Measurement ID", placeholder: "G-XXXXXXXXXX", ...ID(/^G-[A-Z0-9]{4,20}$/, "Looks like G-ABC123XYZ9") }],
  },
  {
    key: "pixel", slug: "meta-pixel", group: "tracking", title: "Meta Pixel",
    description: "Facebook / Instagram ads pixel.",
    fields: [{ name: "id", label: "Pixel ID", placeholder: "1234567890123456", ...ID(/^\d{8,20}$/, "Digits only") }],
  },
  {
    key: "facebookTag", slug: "facebook-meta-tag", group: "tracking", title: "Facebook Meta Tag",
    description: "Domain verification for Meta Business. Paste the content value, or the whole meta tag.",
    fields: [{ name: "content", label: "facebook-domain-verification", ...ID(/^[A-Za-z0-9_\-.=]{5,120}$/, "Letters, numbers, - _ . =") }],
  },
  {
    key: "pinterestTag", slug: "pinterest-meta-tag", group: "tracking", title: "Pinterest Meta Tag",
    description: "Domain verification for Pinterest. Paste the content value, or the whole meta tag.",
    fields: [{ name: "content", label: "p:domain_verify", ...ID(/^[A-Za-z0-9_\-.=]{5,120}$/, "Letters, numbers, - _ . =") }],
  },
  {
    key: "searchConsole", slug: "google-search-console", group: "tracking", title: "Google Search Console",
    description: "Site verification. Paste the content value, or the whole meta tag.",
    fields: [{ name: "content", label: "google-site-verification", ...ID(/^[A-Za-z0-9_\-.=]{5,120}$/, "Letters, numbers, - _ . =") }],
  },
  {
    key: "googleTag", slug: "google-tag", group: "tracking", title: "Google Tag",
    description: "A Google tag ID (for example Google Ads conversion tracking).",
    fields: [{ name: "id", label: "Tag ID", placeholder: "AW-XXXXXXXXX", ...ID(/^(G|AW|GT|DC)-[A-Z0-9-]{4,24}$/, "Looks like AW-123456789") }],
  },
  {
    key: "gtm", slug: "google-tag-manager", group: "tracking", title: "Google Tag Manager",
    description: "Container ID.",
    fields: [{ name: "id", label: "Container ID", placeholder: "GTM-XXXXXXX", ...ID(/^GTM-[A-Z0-9]{4,12}$/, "Looks like GTM-ABC123") }],
  },
  {
    key: "adsense", slug: "google-adsense", group: "tracking", title: "Google AdSense",
    description: "Publisher ID.",
    fields: [{ name: "client", label: "Publisher ID", placeholder: "ca-pub-0000000000000000", ...ID(/^ca-pub-\d{10,20}$/, "Looks like ca-pub-1234567890123456") }],
  },
];

/** Fields without the (non-serialisable) regex patterns, safe to pass to client components. */
export const clientFields = (spec: Section) =>
  spec.fields.map(({ name, label, kind, placeholder, help, max }) => ({ name, label, kind, placeholder, help, max }));

export const sectionBySlug = (slug: string) => SECTIONS.find((s) => s.slug === slug);

/** Pages whose title/description can be overridden in SEO Settings. */
export const SEO_PAGES: { path: string; label: string }[] = [
  { path: "/", label: "Home" },
  { path: "/all-products", label: "All Products" },
  { path: "/main-line-cigars", label: "Main Line Cigars" },
  { path: "/cardinal-line", label: "Cardinal Line" },
  { path: "/cigarillos", label: "Cigarillos" },
  { path: "/dominican-blanks", label: "Dominican Blanks" },
  { path: "/private-label-program", label: "Private Label Program" },
  { path: "/humidor-program", label: "Humidor Program" },
  { path: "/gallery", label: "Gallery" },
  { path: "/about-us", label: "About Us" },
  { path: "/contact-us-1", label: "Contact Us" },
  { path: "/where-to-buy", label: "Where to Buy" },
  { path: "/become-a-customer", label: "Become a Customer" },
  { path: "/catalog", label: "Catalog" },
];

export type SeoSettings = {
  defaultTitle: string;
  defaultDescription: string;
  ogImage: string;
  pages: Record<string, { title?: string; description?: string }>;
};

export type Settings = {
  basic: Record<string, string>;
  social: Record<string, string>;
  favicon: { url: string };
  seo: SeoSettings;
  llms: { text: string };
  cookieBanner: Record<string, string>;
  ga: Record<string, string>;
  pixel: Record<string, string>;
  facebookTag: Record<string, string>;
  pinterestTag: Record<string, string>;
  searchConsole: Record<string, string>;
  googleTag: Record<string, string>;
  gtm: Record<string, string>;
  adsense: Record<string, string>;
};

export function defaultLlms(): string {
  return `# ${SITE.name}

> ${SITE.description}

${SITE.name} is a licensed US importer and wholesaler of hand-rolled premium cigars made in Tamboril, Dominican Republic. We sell to licensed wholesalers, distributors and retailers. The website is age-gated (21+).

## Pages
- [Products](${SITE.url}/all-products)
- [About Us](${SITE.url}/about-us)
- [Where to Buy](${SITE.url}/where-to-buy)
- [Become a Customer](${SITE.url}/become-a-customer)
- [Contact Us](${SITE.url}/contact-us-1)
- [Catalog](${SITE.url}/catalog)

## Contact
- Phone: ${SITE.phone}
- Address: ${SITE.address}
`;
}

export function defaults(): Settings {
  return {
    basic: { businessName: SITE.name, description: SITE.description, phone: SITE.phone, email: "", address: SITE.address, hours: "" },
    social: { facebook: SITE.facebook, instagram: SITE.instagram, youtube: "", tiktok: "", x: "", linkedin: "", pinterest: "" },
    favicon: { url: "" },
    seo: { defaultTitle: SITE.name, defaultDescription: SITE.description, ogImage: "/images/suzannefryerphotography_compadres--2.jpg", pages: {} },
    llms: { text: "" },
    cookieBanner: { enabled: "", message: "We use cookies to understand how this site is used and to improve it.", accept: "Accept", decline: "Decline" },
    ga: { id: "" }, pixel: { id: "" }, facebookTag: { content: "" }, pinterestTag: { content: "" },
    searchConsole: { content: "" }, googleTag: { id: "" }, gtm: { id: "" }, adsense: { client: "" },
  };
}

/** Re-checks a stored value against the section's patterns; anything invalid is dropped to "". */
function sanitize(section: string, value: Record<string, string>): Record<string, string> {
  const spec = SECTIONS.find((s) => s.key === section);
  if (!spec) return value;
  const out: Record<string, string> = {};
  for (const f of spec.fields) {
    const v = typeof value?.[f.name] === "string" ? value[f.name] : "";
    out[f.name] = !f.pattern || !v || f.pattern.test(v) ? v : "";
  }
  return out;
}

/** Fresh (uncached) read, used by the dashboard forms. */
export async function loadSettings(): Promise<Settings> {
  const base = defaults();
  const store = getStore();
  if (!store) return base;
  try {
    const keys = Object.keys(base) as (keyof Settings)[];
    const rows = await Promise.all(keys.map((k) => store.getSetting<Record<string, unknown>>(k)));
    const out: Record<string, unknown> = { ...base };
    keys.forEach((k, i) => {
      const v = rows[i];
      if (!v || typeof v !== "object") return;
      if (k === "seo") out.seo = { ...base.seo, ...(v as object), pages: { ...(v as SeoSettings).pages } };
      else if (k === "favicon" || k === "llms") out[k] = { ...(base[k] as object), ...v };
      else out[k] = sanitize(k, { ...(base[k] as Record<string, string>), ...(v as Record<string, string>) });
    });
    return out as Settings;
  } catch (e) {
    console.error("settings: falling back to defaults", e);
    return base;
  }
}

/** All settings, merged over defaults. Cached; saving in the dashboard refreshes it immediately. */
export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");
  return loadSettings();
}

/** Per-page metadata: dashboard SEO overrides win over the page's built-in defaults. */
export async function pageMeta(path: string, fallback: { title: string | { absolute: string }; description?: string }): Promise<Metadata> {
  const s = await getSettings();
  const o = s.seo.pages[path];
  return {
    title: o?.title ? { absolute: o.title } : fallback.title,
    description: o?.description || fallback.description || s.seo.defaultDescription,
    alternates: { canonical: path },
  };
}

/** Accept a pasted full <meta ...> tag or a bare value and return just the content value. */
export function extractMetaContent(input: string): string {
  const m = input.match(/content\s*=\s*["']([^"']+)["']/i);
  return (m ? m[1] : input).trim();
}
