"use client";

import { useActionState } from "react";
import { saveSection, type SaveState } from "./actions";
import { btnCls, inputCls } from "./ui";

export type ClientField = { name: string; label: string; kind?: string; placeholder?: string; help?: string; max?: number };

export default function SettingsForm({ sectionKey, fields, values }: { sectionKey: string; fields: ClientField[]; values: Record<string, string> }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveSection, {});
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="_section" value={sectionKey} />
      {fields.map((f) => {
        const err = state.fieldErrors?.[f.name];
        const common = { id: f.name, name: f.name, maxLength: f.max, "aria-invalid": err ? true : undefined, "aria-describedby": `${f.name}-help` };
        return (
          <div key={f.name}>
            {f.kind === "checkbox" ? (
              <label className="flex items-center gap-3 text-sm font-medium">
                <input type="checkbox" name={f.name} defaultChecked={values[f.name] === "1"} className="h-4 w-4 accent-[#0e7c86]" /> {f.label}
              </label>
            ) : (
              <>
                <label htmlFor={f.name} className="mb-1 block text-sm font-medium text-slate-700">{f.label}</label>
                {f.kind === "textarea" ? (
                  <textarea {...common} rows={3} defaultValue={values[f.name] ?? ""} className={inputCls} />
                ) : (
                  <input {...common} type={f.kind ?? "text"} defaultValue={values[f.name] ?? ""} placeholder={f.placeholder} className={inputCls} />
                )}
              </>
            )}
            <p id={`${f.name}-help`} className={`mt-1 text-xs ${err ? "text-red-600" : "text-slate-500"}`}>{err ?? f.help ?? ""}</p>
          </div>
        );
      })}
      <div className="flex items-center gap-3">
        <button className={btnCls} disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
        {state.ok && <span role="status" className="text-sm text-teal-700">Saved. The site is updated.</span>}
        {state.error && <span role="alert" className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
