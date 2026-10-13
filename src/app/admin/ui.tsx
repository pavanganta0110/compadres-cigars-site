import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0e7c86] focus:ring-2 focus:ring-[#0e7c86]/20";
export const btnCls = "rounded bg-[#0e7c86] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60";
export const btnGhost = "rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";

export function PageTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {children && <p className="mt-1 max-w-2xl text-sm text-slate-500">{children}</p>}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && <h2 className="mb-4 text-base font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn"; children: ReactNode }) {
  const t = tone === "warn" ? "border-amber-300 bg-amber-50 text-amber-900" : "border-sky-200 bg-sky-50 text-sky-900";
  return <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${t}`}>{children}</div>;
}

export const STATUS_LABEL: Record<string, string> = { new: "New", in_progress: "In progress", handled: "Handled", spam: "Spam" };
const STATUS_TONE: Record<string, string> = {
  new: "bg-teal-100 text-teal-800", in_progress: "bg-amber-100 text-amber-800", handled: "bg-slate-100 text-slate-600", spam: "bg-red-100 text-red-700",
};
export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[status] ?? ""}`}>{STATUS_LABEL[status] ?? status}</span>;
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
