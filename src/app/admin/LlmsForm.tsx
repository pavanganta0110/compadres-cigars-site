"use client";

import { useActionState } from "react";
import { saveLlms, type SaveState } from "./actions";
import { btnCls, btnGhost, inputCls } from "./ui";

export default function LlmsForm({ text, generated }: { text: string; generated: string }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveLlms, {});
  return (
    <form action={action} className="space-y-4">
      <label htmlFor="text" className="block text-sm font-medium">llms.txt</label>
      <textarea id="text" name="text" rows={18} defaultValue={text || generated} className={`${inputCls} font-mono text-xs`} spellCheck={false} />
      <p className="text-xs text-slate-500">
        Plain text (Markdown) that tells AI assistants what this site is. It is served at <a className="underline" href="/llms.txt" target="_blank">/llms.txt</a>.
        To go back to the automatically generated version, clear the box and save.
      </p>
      <div className="flex items-center gap-3">
        <button className={btnCls} disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
        <a href="/llms.txt" target="_blank" className={btnGhost}>View live file</a>
        {state.ok && <span role="status" className="text-sm text-teal-700">Saved.</span>}
        {state.error && <span role="alert" className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
