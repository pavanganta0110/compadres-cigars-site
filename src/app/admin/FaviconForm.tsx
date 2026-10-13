"use client";

import { useActionState } from "react";
import { saveFavicon, type SaveState } from "./actions";
import { btnCls, btnGhost } from "./ui";

export default function FaviconForm({ url }: { url: string }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveFavicon, {});
  return (
    <form action={action} className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url ? <img src={url} alt="Current favicon" width={32} height={32} /> : <span className="text-xs text-slate-400">Default</span>}
        </div>
        <p className="text-sm text-slate-600">{url ? "Your uploaded favicon is live." : "Using the default Compadres crest."}</p>
      </div>
      <div>
        <label htmlFor="file" className="mb-1 block text-sm font-medium">Upload a new favicon</label>
        <input id="file" name="file" type="file" accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/jpeg" className="block text-sm" />
        <p className="mt-1 text-xs text-slate-500">PNG, ICO or JPG, square, at least 64×64, up to 512 KB. Browsers may take a while to show a new icon.</p>
      </div>
      <div className="flex items-center gap-3">
        <button className={btnCls} disabled={pending}>{pending ? "Uploading…" : "Upload"}</button>
        {url && <button name="remove" value="1" formNoValidate className={btnGhost}>Remove</button>}
        {state.ok && <span role="status" className="text-sm text-teal-700">Saved.</span>}
        {state.error && <span role="alert" className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
