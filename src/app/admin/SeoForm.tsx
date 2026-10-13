"use client";

import { useActionState } from "react";
import { saveSeo, type SaveState } from "./actions";
import { btnCls, inputCls } from "./ui";
import type { SeoSettings } from "@/lib/settings";

export default function SeoForm({ seo, pages }: { seo: SeoSettings; pages: { path: string; label: string }[] }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveSeo, {});
  return (
    <form action={action} className="space-y-8">
      <div className="space-y-4">
        <div><label className="mb-1 block text-sm font-medium" htmlFor="defaultTitle">Site title</label>
          <input id="defaultTitle" name="defaultTitle" defaultValue={seo.defaultTitle} maxLength={70} className={inputCls} />
          <p className="mt-1 text-xs text-slate-500">Used in browser tabs and as the suffix on page titles. Up to 70 characters.</p></div>
        <div><label className="mb-1 block text-sm font-medium" htmlFor="defaultDescription">Default description</label>
          <textarea id="defaultDescription" name="defaultDescription" rows={3} defaultValue={seo.defaultDescription} maxLength={200} className={inputCls} />
          <p className="mt-1 text-xs text-slate-500">What search results show when a page has no description of its own. Up to 200 characters.</p></div>
        <div><label className="mb-1 block text-sm font-medium" htmlFor="ogImage">Social share image</label>
          <input id="ogImage" name="ogImage" defaultValue={seo.ogImage} className={inputCls} />
          <p className={`mt-1 text-xs ${state.fieldErrors?.ogImage ? "text-red-600" : "text-slate-500"}`}>{state.fieldErrors?.ogImage ?? "Shown when the site is shared on Facebook, iMessage, etc. A path like /images/photo.jpg or an https:// link."}</p></div>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold">Per-page overrides</h3>
        <p className="mb-4 text-xs text-slate-500">Leave blank to keep each page&apos;s built-in title and description.</p>
        <div className="space-y-4">
          {pages.map((p) => (
            <fieldset key={p.path} className="rounded-lg border border-slate-200 p-4">
              <legend className="px-1 text-sm font-medium">{p.label} <span className="font-normal text-slate-400">{p.path}</span></legend>
              <input name={`title:${p.path}`} aria-label={`${p.label} title`} placeholder="Page title" maxLength={70} defaultValue={seo.pages[p.path]?.title ?? ""} className={`${inputCls} mb-2`} />
              <textarea name={`desc:${p.path}`} aria-label={`${p.label} description`} placeholder="Page description" rows={2} maxLength={200} defaultValue={seo.pages[p.path]?.description ?? ""} className={inputCls} />
            </fieldset>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className={btnCls} disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
        {state.ok && <span role="status" className="text-sm text-teal-700">Saved. The site is updated.</span>}
        {state.error && <span role="alert" className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
