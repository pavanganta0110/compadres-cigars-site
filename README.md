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

## ID verification (Didit) on "Become a Customer"

Browsing needs only the 21+ gate above. **Applying to become a customer additionally requires a Didit ID check** (merchant-bank requirement).

- Flow: the form's "Verify my age" button POSTs `/api/verify/start`, which creates a Didit session server-side (`POST /v3/session/`, key in `DIDIT_API_KEY`, `vendor_data` = our verification id) and returns Didit's hosted URL, opened in a new tab. The form polls `/api/verify/status`.
- Result: Didit calls `/api/didit/webhook` (open to the internet; the proxy lets it through). It is accepted only with a valid `X-Signature-V2` (or `X-Signature`) HMAC and a timestamp within 5 minutes, using `DIDIT_WEBHOOK_SECRET`. Even then the status is **re-fetched from Didit** (`GET /v3/session/{id}/decision/`), and 21+ is computed by us from the ID's date of birth (`src/lib/didit.ts`). `/api/verify/status` also asks Didit directly, so a delayed webhook doesn't block anyone.
- Enforcement is on the server: `/api/inquiry` rejects a `customer` submission (403) unless it carries a `verificationId` that is approved, 21+, unused and under 24 hours old. Each verification is spent once (atomic claim) and released again if the application can't be saved.
- Stored: only the outcome in `age_verifications` (migration `0002`). No ID images, numbers or dates of birth.
- Setup: create a workflow in the Didit Console (ID verification only; no liveness or face match, so it does not prove the person holding the ID is its owner), add the webhook destination `https://<domain>/api/didit/webhook`, set `DIDIT_API_KEY`, `DIDIT_WORKFLOW_ID`, `DIDIT_WEBHOOK_SECRET`, `SITE_URL`, then run `0002_age_verifications.sql`. Without these, applications are refused by design.

## Known differences from the original site

- **Credit card fields removed.** The old Become-a-Customer form collected card number/CVV through a third-party widget. Card data must not go through a plain form or email. The Credit Card checkbox stays (customers are contacted to pay securely). To take cards online, use a hosted payment page/link from your processor.
- **Tobacco license upload** works by email attachment (max 4 MB, the same file types as before). Larger files: customers are told to call.
- **Forms need an email provider** (`RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL`) to deliver anything; without them they show a "please call us" message.
- **Age gate has no close (X) button**, by design (merchant-bank requirement). It is shown as a popup over the dimmed home page.
- GoDaddy chat widget, reCAPTCHA and the "Desenvolvido por GoDaddy" credit are not carried over.

## Admin dashboard (`/admin`)

Inquiry inbox, site settings and tracking tags, modelled on GoDaddy's dashboard.

- **Dashboard:** visitors (the site's own cookie-less counter, no IPs stored), inquiries, customer applications, top pages.
- **Inquiries:** every Contact / Become-a-Customer submission is saved (with the license file in a private bucket), with status, notes, search and CSV export. Emails still go out too if Resend is configured.
- **Site Profile:** basic info, social links, favicon upload, SEO titles/descriptions per page, `llms.txt` editor, change history.
- **Analytics & Tracking:** cookie banner, Google Analytics, Meta Pixel, Facebook/Pinterest/Search Console verification tags, Google Tag, Tag Manager, AdSense. IDs are validated; when the cookie banner is on, tags load only after a visitor clicks Accept.

### One-time setup
1. Create a **new** Supabase project (not any other business's). In **SQL Editor**, run `supabase/migrations/0001_init.sql`. All tables have Row Level Security on with no policies, so browsers can read/write nothing; only the server (service-role key) can.
2. In Supabase **Authentication -> URL Configuration**, set Site URL to your site and add `https://<your-domain>/auth/callback` (and the `*.vercel.app` preview URL if you use it) to **Redirect URLs**.
3. In Vercel, add the variables from `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`) for Production and Preview, then redeploy.
4. Visit `/admin`, enter an email from `ADMIN_EMAILS`, and click the emailed link.

Without these variables the dashboard shows "database not connected" and nothing is stored (forms still email). The `.dev-data/` stand-in store only works with `npm run dev` and is refused in production.
