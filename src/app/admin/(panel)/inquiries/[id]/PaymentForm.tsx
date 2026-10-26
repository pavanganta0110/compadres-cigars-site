"use client";

import { useActionState } from "react";
import { createPaymentRequest, type SaveState } from "../../../actions";
import { btnCls, inputCls } from "../../../ui";

export default function PaymentForm({ inquiryId }: { inquiryId: string }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(createPaymentRequest, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="inquiryId" value={inquiryId} />
      <div>
        <label htmlFor="amount" className="mb-1 block text-xs font-medium text-slate-600">Amount to charge (USD)</label>
        <input id="amount" name="amount" inputMode="decimal" required placeholder="250.00" className={inputCls} autoComplete="off" />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-xs font-medium text-slate-600">Description (shown to the customer)</label>
        <input id="description" name="description" maxLength={200} defaultValue="Compadres Cigars order" className={inputCls} />
      </div>
      <button className={btnCls} disabled={pending}>{pending ? "Creating…" : "Create payment link"}</button>
      {state.ok && <span role="status" className="ml-3 text-sm text-teal-700">Created</span>}
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
