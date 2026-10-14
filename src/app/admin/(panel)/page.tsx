import Link from "next/link";
import { nowMs } from "@/lib/clock";
import { getStore } from "@/lib/store";
import { Card, Notice, PageTitle, StatusBadge, fmtDate } from "../ui";
import type { Stats } from "@/lib/store/types";

const n = (v: number) => v.toLocaleString("en-US");

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="mt-2 text-sm text-teal-700">{sub}</p>}
    </div>
  );
}

const last30Days = () => Array.from({ length: 30 }, (_, i) => new Date(nowMs() - (29 - i) * 86400000).toISOString().slice(0, 10));

function Chart({ data }: { data: Stats["by_day"] }) {
  // Last 30 days, zero-filled.
  const map = new Map(data.map((d) => [d.day, d.visitors]));
  const days = last30Days();
  const vals = days.map((d) => map.get(d) ?? 0);
  const max = Math.max(1, ...vals);
  return (
    <figure>
      <svg viewBox="0 0 300 80" className="h-28 w-full" role="img" aria-label="Unique visitors per day, last 30 days">
        {vals.map((v, i) => (
          <rect key={i} x={i * 10 + 1} y={78 - (v / max) * 74} width="8" height={Math.max(1, (v / max) * 74)} rx="1.5" fill={v ? "#0e7c86" : "#e2e8f0"}>
            <title>{`${days[i]}: ${v} visitor${v === 1 ? "" : "s"}`}</title>
          </rect>
        ))}
      </svg>
      <figcaption className="mt-1 flex justify-between text-xs text-slate-400"><span>{days[0]}</span><span>{days[29]}</span></figcaption>
    </figure>
  );
}

export default async function Dashboard() {
  const store = getStore();
  if (!store) {
    return (
      <>
        <PageTitle title="Dashboard" />
        <Notice tone="warn">
          <strong>The database isn&apos;t connected yet.</strong> Create the Supabase project, run <code>supabase/migrations/0001_init.sql</code>, and add the
          environment variables listed in the README. Until then, form submissions are only emailed.
        </Notice>
      </>
    );
  }

  let stats: Stats | null = null;
  let recent: Awaited<ReturnType<typeof store.listInquiries>>["rows"] = [];
  let error = "";
  try {
    [stats, recent] = await Promise.all([store.stats(), store.listInquiries({ pageSize: 6 }).then((r) => r.rows)]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Couldn't load data.";
  }

  return (
    <>
      <PageTitle title="Dashboard">What&apos;s happening on compadrescigars.com.</PageTitle>
      {store.kind === "dev-file" && <Notice>Local development: using sample data stored in <code>.dev-data/</code>. Production uses Supabase.</Notice>}
      {error && <Notice tone="warn">Couldn&apos;t load the numbers: {error}</Notice>}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Site Visitors" value={n(stats.visitors_365)} sub={`+${n(stats.visitors_30)} (last 30 days)`} />
            <Stat label="Inquiries" value={n(stats.inq_total)} sub={`+${n(stats.inq_30)} (last 30 days)`} />
            <Stat label="Customer applications" value={n(stats.cust_total)} sub={`+${n(stats.cust_30)} (last 30 days)`} />
            <Stat label="Waiting for you" value={n(stats.new_count)} sub={stats.new_count ? "New, not yet handled" : "All caught up"} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card title="Visitors, last 30 days" className="lg:col-span-2">
              <Chart data={stats.by_day} />
              <p className="mt-3 text-xs text-slate-500">
                Counted by the site itself (no cookies, no IP addresses stored). A visitor is counted once per day. Search-engine bots are excluded.
              </p>
            </Card>
            <Card title="Top pages (30 days)">
              {stats.top_pages.length === 0 ? (
                <p className="text-sm text-slate-500">No page views yet.</p>
              ) : (
                <ol className="space-y-2 text-sm">
                  {stats.top_pages.map((p) => (
                    <li key={p.path} className="flex justify-between gap-3"><span className="truncate">{p.path}</span><span className="text-slate-500">{n(p.views)}</span></li>
                  ))}
                </ol>
              )}
            </Card>
          </div>
        </>
      )}

      <Card title="Latest inquiries" className="mt-6">
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing yet. New Contact and Become-a-Customer submissions will show up here.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((i) => (
              <li key={i.id}>
                <Link href={`/admin/inquiries/${i.id}`} className="flex items-center justify-between gap-4 py-3 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{i.company || i.name || i.email}</p>
                    <p className="truncate text-sm text-slate-500">{i.kind === "customer" ? "Customer application" : "Contact form"} · {fmtDate(i.created_at)}</p>
                  </div>
                  <StatusBadge status={i.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/inquiries" className="mt-3 inline-block text-sm font-medium text-[#0e7c86] underline">View all inquiries</Link>
      </Card>
    </>
  );
}
