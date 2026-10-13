"use client";

import { useActionState } from "react";
import { saveInquiryNotes, type SaveState } from "../../../actions";
import { btnCls, inputCls } from "../../../ui";

export default function NotesForm({ id, initial }: { id: string; initial: string }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveInquiryNotes, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <textarea name="notes" defaultValue={initial} rows={5} maxLength={5000} className={inputCls} placeholder="Only visible in this dashboard." />
      <button className={btnCls} disabled={pending}>{pending ? "Saving…" : "Save notes"}</button>
      {state.ok && <span role="status" className="ml-3 text-sm text-teal-700">Saved</span>}
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
