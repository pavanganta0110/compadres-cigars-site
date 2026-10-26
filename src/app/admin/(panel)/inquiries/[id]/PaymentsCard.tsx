import { requestOrigin } from "@/lib/admin-auth";
import { authnetConfigured, authnetMode, formatUsd } from "@/lib/authnet";
import { getStore } from "@/lib/store";
import { cancelPaymentRequest } from "../../../actions";
import { Card, btnGhost, fmtDate, inputCls } from "../../../ui";
import PaymentForm from "./PaymentForm";

const TONE: Record<string, string> = { pending: "bg-amber-100 text-amber-800", paid: "bg-teal-100 text-teal-800", cancelled: "bg-slate-100 text-slate-600" };

// Payments for one order: confirm the price with the customer, create a payment link, send it to them
// (email or text), and watch it flip to Paid when Authorize.net's webhook confirms the card payment.
export default async function PaymentsCard({ inquiryId }: { inquiryId: string }) {
  const store = getStore();
  if (!store) return null;
  const payments = await store.listPaymentRequests(inquiryId);
  const origin = process.env.SITE_URL?.replace(/\/+$/, "") || (await requestOrigin());
  const mode = authnetMode();

  return (
    <Card title="Payment">
      {!authnetConfigured() ? (
        <p className="text-sm text-slate-500">Payments aren&apos;t set up yet. Add the Authorize.net keys in Vercel to turn this on.</p>
      ) : (
        <>
          {mode === "sandbox" && <p className="mb-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-900">Test mode: payments here use the Authorize.net sandbox and move no real money.</p>}
          <PaymentForm inquiryId={inquiryId} />
        </>
      )}

      {payments.length > 0 && (
        <ul className="mt-5 space-y-4 border-t border-slate-200 pt-4">
          {payments.map((p) => (
            <li key={p.id} className="text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{formatUsd(p.amount_cents)}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[p.status] ?? ""}`}>{p.status === "paid" ? "Paid" : p.status === "cancelled" ? "Cancelled" : "Awaiting payment"}</span>
              </div>
              <p className="text-xs text-slate-500">{p.description} · {fmtDate(p.created_at)}{p.created_by ? ` · ${p.created_by}` : ""}</p>
              {p.status === "paid" && <p className="text-xs text-slate-500">Paid {p.paid_at ? fmtDate(p.paid_at) : ""}{p.transaction_id ? ` · Authorize.net transaction ${p.transaction_id}` : ""}</p>}
              {p.status === "pending" && (
                <div className="mt-2 space-y-2">
                  <input readOnly value={`${origin}/pay/${p.token}`} aria-label="Payment link to send to the customer" className={inputCls} />
                  <form action={cancelPaymentRequest}><input type="hidden" name="id" value={p.id} /><button className={btnGhost}>Cancel this request</button></form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
