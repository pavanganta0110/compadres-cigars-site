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

## Known differences from the original site

- **Credit card fields removed.** The old Become-a-Customer form collected card numbers/CVV through a third-party widget. Card data should not be collected in a plain web form; customers choosing "Credit Card" are contacted to pay securely.
- **Tobacco license upload** is not rebuilt (needs file storage, e.g. Supabase Storage). The form tells customers they will be contacted for it.
- **Forms need an email provider** (`RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL`) to deliver anything.
- **21+ age gate** is not implemented yet.
- GoDaddy chat widget, reCAPTCHA and the "Desenvolvido por GoDaddy" credit are not carried over.
