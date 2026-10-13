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

- `src/proxy.ts` runs on every request. Without a valid signed cookie (`cc_age_ok`) it redirects to `/age-gate`, including direct hits on pages, PDFs, `/_next/image`, the API and the sitemap. Open: `/age-gate`, `/api/age-verify`, `/robots.txt`, `/images/*` and `/_next/image` for `/images/*` URLs only (Next's image optimizer fetches those internally without the cookie, so gating them breaks every image; they are product photos only).
- The "I AM 21 OR OLDER" button POSTs to `/api/age-verify`, which sets an HMAC-signed, HttpOnly, Secure, SameSite=Lax cookie (`<expiry>.<signature>`). Forged, tampered, malformed and expired cookies are rejected. The post-confirmation redirect only accepts same-site relative paths.
- There is no close button; "I am under 21 — exit" leaves to `AGE_GATE_EXIT_URL`.
- Env: `AGE_GATE_SECRET` (**required in production**; without it the site stays gated and confirming returns 500, by design), `AGE_GATE_TTL_DAYS` (default 30), `AGE_GATE_EXIT_URL`.
- Search engines: verified Googlebot and Bingbot (reverse+forward DNS check, cached) may read public pages and images, but not `/files/` or `/api/`. A spoofed `User-Agent` does not get through. Everyone else is gated.

## Known differences from the original site

- **Credit card fields removed.** The old Become-a-Customer form collected card number/CVV through a third-party widget. Card data must not go through a plain form or email. The Credit Card checkbox stays (customers are contacted to pay securely). To take cards online, use a hosted payment page/link from your processor.
- **Tobacco license upload** works by email attachment (max 4 MB, the same file types as before). Larger files: customers are told to call.
- **Forms need an email provider** (`RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL`) to deliver anything; without them they show a "please call us" message.
- **Age gate has no close (X) button**, by design (merchant-bank requirement). It is shown as a popup over the dimmed home page.
- GoDaddy chat widget, reCAPTCHA and the "Desenvolvido por GoDaddy" credit are not carried over.
