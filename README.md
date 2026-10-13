# Compadres Cigars

Rebuild of https://compadrescigars.com (GoDaddy Website Builder) as a Next.js 16 app (TypeScript, Tailwind CSS 4, App Router).

## Develop

```bash
npm install
cp .env.example .env.local   # optional; only needed to deliver form emails
npm run dev                  # http://localhost:3000
npm run lint && npx tsc --noEmit && npm run build
```

## Structure

- `src/app/*` — one route per original page; URLs are unchanged (`/contact-us-1`, `/all-products`, …). `/home` → `/` and `/contact-us` → `/contact-us-1` redirect permanently.
- `src/lib/site.ts` — navigation, contact details and product data (edit content here).
- `src/app/api/inquiry` — shared handler for the Contact and Become-a-Customer forms (validation + honeypot; emails via Resend when configured).
- `public/images`, `public/files` — assets and PDFs downloaded from the original site.

## 21+ age gate

- `src/proxy.ts` runs on every request. Without a valid signed cookie (`cc_age_ok`) it redirects to `/age-gate`, including direct hits on internal pages, PDFs, images, `/_next/image`, the API and the sitemap. Only `/age-gate`, `/api/age-verify`, `/robots.txt` and the gate logo are open.
- The "I AM 21 OR OLDER" button POSTs to `/api/age-verify`, which sets an HMAC-signed, HttpOnly, Secure, SameSite=Lax cookie (`<expiry>.<signature>`). Forged, tampered, malformed and expired cookies are rejected. The post-confirmation redirect only accepts same-site relative paths.
- There is no close button; "I am under 21 — exit" leaves to `AGE_GATE_EXIT_URL`.
- Env: `AGE_GATE_SECRET` (**required in production**; without it the site stays gated and confirming returns 500, by design), `AGE_GATE_TTL_DAYS` (default 30), `AGE_GATE_EXIT_URL`.
- Search engines can't crawl gated pages (only `robots.txt` is open). Self-attestation is not identity verification — confirm with your merchant bank/processor and counsel whether it satisfies their requirement (some tobacco/age-restricted sales require ID or age verification at purchase/shipping, and state licensing rules apply).

## Known differences from the original site

- **Credit card fields removed.** The old Become-a-Customer form collected card numbers/CVV through a third-party widget. Card data should not be collected in a plain web form; customers choosing "Credit Card" are contacted to pay securely.
- **Tobacco license upload** is not rebuilt (needs file storage, e.g. Supabase Storage). The form tells customers they will be contacted for it.
- **Forms need an email provider** (`RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL`) to deliver anything.
- GoDaddy chat widget, reCAPTCHA and the "Desenvolvido por GoDaddy" credit are not carried over.
