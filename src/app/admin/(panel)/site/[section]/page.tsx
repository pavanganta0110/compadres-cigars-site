import { notFound } from "next/navigation";
import { SEO_PAGES, SECTIONS, clientFields, defaultLlms, loadSettings, sectionBySlug } from "@/lib/settings";
import { getStore } from "@/lib/store";
import FaviconForm from "../../../FaviconForm";
import LlmsForm from "../../../LlmsForm";
import SeoForm from "../../../SeoForm";
import SettingsForm from "../../../SettingsForm";
import { Card, Notice, PageTitle, fmtDate } from "../../../ui";

const SPECIAL: Record<string, { title: string; blurb: string }> = {
  favicon: { title: "Favicon", blurb: "The small icon in browser tabs and bookmarks." },
  "seo-settings": { title: "SEO Settings", blurb: "How the site appears in Google and when shared on social media." },
  "ai-visibility": { title: "AI Visibility (LLMS.txt)", blurb: "A plain-text guide that helps AI assistants describe your business accurately." },
  history: { title: "Site History", blurb: "Every change made in this dashboard, newest first." },
};

export const instant = false; // admin pages render per request; instant navigation isn't needed

export default async function SitePage({ params }: PageProps<"/admin/site/[section]">) {
  const { section } = await params;
  const spec = sectionBySlug(section);
  const special = SPECIAL[section];
  if (!(spec && spec.group === "site") && !special) notFound();

  const store = getStore();
  const title = spec?.title ?? special.title;
  const blurb = spec?.description ?? special.blurb;
  if (!store) return <><PageTitle title={title}>{blurb}</PageTitle><Notice tone="warn">The database isn&apos;t connected yet (see the README setup steps).</Notice></>;

  const s = await loadSettings();

  if (section === "history") {
    const rows = await store.listHistory(100);
    return (
      <>
        <PageTitle title={title}>{blurb}</PageTitle>
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Who</th><th className="px-4 py-3">Change</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-500">No changes yet.</td></tr>}
              {rows.map((r) => <tr key={r.id}><td className="whitespace-nowrap px-4 py-3">{fmtDate(r.created_at)}</td><td className="px-4 py-3">{r.actor ?? "—"}</td><td className="px-4 py-3">{r.summary ?? r.key}</td></tr>)}
            </tbody>
          </table>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageTitle title={title}>{blurb}</PageTitle>
      <Card>
        {section === "favicon" ? <FaviconForm url={s.favicon.url} />
          : section === "seo-settings" ? <SeoForm seo={s.seo} pages={SEO_PAGES} />
          : section === "ai-visibility" ? <LlmsForm text={s.llms.text} generated={defaultLlms()} />
          : spec && <SettingsForm sectionKey={spec.key} fields={clientFields(spec)} values={(s as unknown as Record<string, Record<string, string>>)[spec.key]} />}
      </Card>
    </>
  );
}

export function generateStaticParams() {
  return [...SECTIONS.filter((x) => x.group === "site").map((x) => ({ section: x.slug })), ...Object.keys(SPECIAL).map((k) => ({ section: k }))];
}
