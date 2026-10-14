import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import { setInquiryStatus } from "../../../actions";
import { Card, PageTitle, STATUS_LABEL, StatusBadge, btnGhost, fmtDate } from "../../../ui";
import NotesForm from "./NotesForm";

export const metadata: Metadata = { title: "Inquiry", robots: { index: false, follow: false } };

const LABELS: Record<string, string> = {
  firstName: "First name", lastName: "Last name", company: "Company", address: "Shipping address", city: "City", state: "State",
  zip: "Zip", email: "Email", phone: "Phone", message: "Message", paymentMethod: "Payment method", name: "Name",
};

export const instant = false; // admin pages render per request; instant navigation isn't needed

export default async function InquiryPage({ params }: PageProps<"/admin/inquiries/[id]">) {
  const { id } = await params;
  const store = getStore();
  if (!store) notFound();
  const i = await store.getInquiry(id);
  if (!i) notFound();
  const licenseHref = i.license_path ? await store.licenseUrl(i.license_path) : null;

  return (
    <>
      <Link href="/admin/inquiries" className="mb-3 inline-block text-sm text-slate-500 underline">← All inquiries</Link>
      <PageTitle title={i.company || i.name || i.email}>
        {i.kind === "customer" ? "Customer application" : "Contact form"} · received {fmtDate(i.created_at)}
      </PageTitle>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Details">
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {Object.entries(i.data).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className={k === "message" ? "sm:col-span-2" : ""}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{LABELS[k] ?? k}</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
                  {k === "email" ? <a className="text-[#0e7c86] underline" href={`mailto:${v}`}>{v}</a> : k === "phone" ? <a className="text-[#0e7c86] underline" href={`tel:${v}`}>{v}</a> : v}
                </dd>
              </div>
            ))}
          </dl>
          {i.license_path && (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <p className="font-medium">Tobacco license</p>
              {licenseHref ? <a href={licenseHref} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[#0e7c86] underline">{i.license_name ?? "Download file"}</a> : <p className="text-slate-500">Link unavailable.</p>}
              <p className="mt-1 text-xs text-slate-500">This link expires in 5 minutes; reload the page for a new one.</p>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Status">
            <p className="mb-3"><StatusBadge status={i.status} />{i.handled_by && <span className="ml-2 text-xs text-slate-500">by {i.handled_by}</span>}</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).filter((s) => s !== i.status).map((s) => (
                <form key={s} action={setInquiryStatus}>
                  <input type="hidden" name="id" value={i.id} /><input type="hidden" name="status" value={s} />
                  <button className={btnGhost}>Mark {STATUS_LABEL[s].toLowerCase()}</button>
                </form>
              ))}
            </div>
          </Card>
          <Card title="Internal notes"><NotesForm id={i.id} initial={i.notes ?? ""} /></Card>
        </div>
      </div>
    </>
  );
}

// One placeholder so Next can prerender the page shell; real ids are rendered on demand.
export function generateStaticParams() {
  return [{ id: "00000000-0000-0000-0000-000000000000" }];
}
