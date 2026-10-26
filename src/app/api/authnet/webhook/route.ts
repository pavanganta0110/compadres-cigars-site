import { getTransactionDetails, verifyWebhookSignature } from "@/lib/authnet";
import { getStore } from "@/lib/store";

// Authorize.net calls this when a payment event happens. It is open to the public internet (the proxy lets it
// through without the 21+ cookie), so the HMAC signature is the only thing that makes a request trustworthy.
// Even then we never act on the payload's numbers: we ask Authorize.net for the transaction and require that
// it is an approved, captured payment for exactly the amount we asked for, on an invoice we issued.

// Events that mean "money was captured". (fraud.approved = a held transaction was later approved.)
const PAID_EVENTS = new Set(["net.authorize.payment.authcapture.created", "net.authorize.payment.fraud.approved"]);

export async function POST(request: Request) {
  const raw = await request.text(); // exact bytes: the signature covers them
  if (!verifyWebhookSignature(raw, request.headers.get("x-anet-signature"))) return new Response("Invalid signature", { status: 401 });

  let event: { eventType?: unknown; payload?: { id?: unknown; entityName?: unknown } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (typeof event.eventType !== "string" || !PAID_EVENTS.has(event.eventType)) return new Response("ok"); // not a payment we track

  const transId = String(event.payload?.id ?? "");
  if (!/^\d{1,20}$/.test(transId)) return new Response("ok");

  const store = getStore();
  if (!store) return new Response("Store unavailable", { status: 503 }); // Authorize.net retries non-200

  try {
    const t = await getTransactionDetails(transId);
    if (!t.approved) {
      console.warn(`authnet webhook: transaction ${transId} not an approved capture (status ${t.status})`);
      return new Response("ok");
    }
    const p = t.invoiceNumber ? await store.getPaymentRequestByInvoice(t.invoiceNumber) : null;
    if (!p) {
      console.warn(`authnet webhook: transaction ${transId} has no matching payment request (invoice ${t.invoiceNumber ?? "none"})`);
      return new Response("ok");
    }
    if (t.amountCents !== p.amount_cents) {
      // Approved, but not the amount we asked for. Don't mark paid; a person needs to look at this.
      console.error(`authnet webhook: AMOUNT MISMATCH on ${p.invoice_number}: expected ${p.amount_cents} cents, got ${t.amountCents}. Transaction ${transId}.`);
      return new Response("ok");
    }
    const first = await store.markPaymentPaid(p.id, transId);
    if (!first) console.warn(`authnet webhook: ${p.invoice_number} was already paid; transaction ${transId} may be a duplicate payment. Check Authorize.net.`);
    else if (p.status === "cancelled") console.warn(`authnet webhook: ${p.invoice_number} was cancelled but the customer paid (transaction ${transId}); marked paid.`);
  } catch (e) {
    console.error("authnet webhook: processing failed", e);
    return new Response("Temporary failure", { status: 500 }); // Authorize.net retries
  }
  return new Response("ok");
}
