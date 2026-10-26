import type { NextRequest } from "next/server";
import { authnetConfigured, createHostedPageToken, isPayToken } from "@/lib/authnet";
import { getStore } from "@/lib/store";

// The customer clicked "Pay securely". We ask Authorize.net for a one-time page token (valid 15 minutes) and
// answer with a tiny page that POSTs it to Authorize.net's hosted payment page, where the card is entered.
// Doing this on a POST (not on page load) means link previews and bots never create tokens.
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function html(body: string, status = 200) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Secure payment</title></head><body style="font-family:Georgia,serif;text-align:center;padding:48px 16px">${body}</body></html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest, ctx: RouteContext<"/api/pay/[token]">) {
  const { token } = await ctx.params;
  const store = getStore();
  if (!store || !authnetConfigured() || !isPayToken(token)) return html("<p>Online payment isn't available right now. Please call us at (816) 878-3545.</p>", 503);

  const p = await store.getPaymentRequestByToken(token);
  if (!p) return html("<p>This payment link isn't valid.</p>", 404);
  if (p.status !== "pending") return html(`<p>This payment request is ${p.status === "paid" ? "already paid" : "no longer active"}.</p><p><a href="/pay/${esc(token)}">Back</a></p>`, 409);

  try {
    const origin = process.env.SITE_URL?.replace(/\/+$/, "") || request.nextUrl.origin;
    const inquiry = await store.getInquiry(p.inquiry_id).catch(() => null);
    const page = await createHostedPageToken(p, {
      returnUrl: `${origin}/pay/${token}?returned=1`,
      cancelUrl: `${origin}/pay/${token}`,
      email: inquiry?.email ?? null,
    });
    return html(
      `<p>Taking you to our secure payment page…</p>
       <form method="POST" action="${esc(page.pageUrl)}"><input type="hidden" name="token" value="${esc(page.token)}"><noscript><button type="submit">Continue to secure payment</button></noscript></form>
       <script>document.forms[0].submit()</script>`,
    );
  } catch (e) {
    console.error("pay: could not create hosted payment page", e);
    return html(`<p>We couldn't start the payment. Please try again, or call us at (816) 878-3545.</p><p><a href="/pay/${esc(token)}">Back</a></p>`, 502);
  }
}
