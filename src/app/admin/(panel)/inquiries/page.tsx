import Link from "next/link";
import { getStore } from "@/lib/store";
import type { InquiryKind, InquiryStatus } from "@/lib/store/types";
import { Card, Notice, PageTitle, StatusBadge, STATUS_LABEL, btnCls, btnGhost, fmtDate, inputCls } from "../../ui";

const STATUSES = Object.keys(STATUS_LABEL) as InquiryStatus[];
const PAGE = 25;

export default async function Inquiries({ searchParams }: PageProps<"/admin/inquiries">) {
  const sp = (await searchParams) as Record<string, string | undefined>;
  const status = STATUSES.includes(sp.status as InquiryStatus) ? (sp.status as InquiryStatus) : undefined;
  const kind: InquiryKind | undefined = sp.kind === "contact" || sp.kind === "customer" ? sp.kind : undefined;
  const q = (sp.q ?? "").slice(0, 80);
  const page = Math.max(1, Number(sp.page) || 1);

  const store = getStore();
  if (!store) return <><PageTitle title="Inquiries" /><Notice tone="warn">The database isn&apos;t connected yet (see the README setup steps).</Notice></>;

  let rows: Awaited<ReturnType<typeof store.listInquiries>>["rows"] = [], total = 0, error = "";
  try { ({ rows, total } = await store.listInquiries({ status, kind, q, page, pageSize: PAGE })); } catch (e) { error = e instanceof Error ? e.message : "Couldn't load inquiries."; }

  const pages = Math.max(1, Math.ceil(total / PAGE));
  const qs = (p: number) => {
    const u = new URLSearchParams();
    if (status) u.set("status", status);
    if (kind) u.set("kind", kind);
    if (q) u.set("q", q);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return `/admin/inquiries${s ? `?${s}` : ""}`;
  };
  const exportHref = `/api/admin/export?${new URLSearchParams({ ...(status && { status }), ...(kind && { kind }), ...(q && { q }) }).toString()}`;

  return (
    <>
      <PageTitle title="Inquiries">Everything submitted through the Contact and Become a Customer forms.</PageTitle>
      {error && <Notice tone="warn">{error}</Notice>}

      <form className="mb-4 flex flex-wrap items-end gap-3" action="/admin/inquiries">
        <div className="min-w-48 flex-1"><label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="Name, email, company, message…" className={inputCls} /></div>
        <div><label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="kind">Type</label>
          <select id="kind" name="kind" defaultValue={kind ?? ""} className={inputCls}><option value="">All</option><option value="contact">Contact form</option><option value="customer">Customer application</option></select></div>
        <div><label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status ?? ""} className={inputCls}><option value="">All</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></div>
        <button className={btnCls}>Filter</button>
        <a href={exportHref} className={btnGhost}>Export CSV</a>
      </form>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-4 py-3">Received</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">From</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">No inquiries match.</td></tr>}
            {rows.map((i) => (
              <tr key={i.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3"><Link href={`/admin/inquiries/${i.id}`} className="font-medium text-[#0e7c86] underline">{fmtDate(i.created_at)}</Link></td>
                <td className="px-4 py-3">{i.kind === "customer" ? "Customer application" : "Contact"}{i.license_path && <span title="License attached"> 📎</span>}</td>
                <td className="px-4 py-3">{i.company || i.name || "—"}</td>
                <td className="px-4 py-3">{i.email}</td>
                <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>{total} total</span>
        <span className="flex gap-3">
          {page > 1 && <Link className="underline" href={qs(page - 1)}>← Newer</Link>}
          <span>Page {page} of {pages}</span>
          {page < pages && <Link className="underline" href={qs(page + 1)}>Older →</Link>}
        </span>
      </div>
    </>
  );
}
