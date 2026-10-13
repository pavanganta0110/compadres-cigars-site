import type { Metadata } from "next";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { SECTIONS } from "@/lib/settings";
import { getStore } from "@/lib/store";
import { signOut } from "../actions";
import AdminNav, { type NavGroup } from "../AdminNav";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

async function Shell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const store = getStore();
  let newCount = 0;
  try { newCount = store ? (await store.stats()).new_count : 0; } catch { /* dashboard page shows the error */ }

  const groups: NavGroup[] = [
    { items: [{ href: "/admin", label: "Dashboard" }, { href: "/admin/inquiries", label: "Inquiries", badge: newCount }] },
    {
      heading: "Site Profile",
      items: [
        { href: "/admin/site/basic-information", label: "Basic Information" },
        { href: "/admin/site/social-media-links", label: "Social Media Links" },
        { href: "/admin/site/favicon", label: "Favicon" },
        { href: "/admin/site/seo-settings", label: "SEO Settings" },
        { href: "/admin/site/ai-visibility", label: "AI Visibility (LLMS.txt)" },
        { href: "/admin/site/history", label: "Site History" },
      ],
    },
    {
      heading: "Analytics & Tracking",
      items: SECTIONS.filter((s) => s.group === "tracking").map((s) => ({ href: `/admin/tracking/${s.slug}`, label: s.title })),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f6f7f9] text-slate-900">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white p-4 md:flex">
        <p className="mb-6 px-3 text-lg font-semibold">Compadres Cigars</p>
        <AdminNav groups={groups} />
        <div className="mt-auto border-t border-slate-200 pt-4 text-xs text-slate-500">
          <p className="mb-2 truncate px-3">{admin.email}</p>
          <form action={signOut}><button className="px-3 text-slate-600 underline hover:text-slate-900">Sign out</button></form>
          <a href="/" className="mt-2 block px-3 text-slate-600 underline hover:text-slate-900">View website</a>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <span className="font-semibold">Compadres Cigars</span>
          <details className="relative">
            <summary className="cursor-pointer list-none rounded border border-slate-300 px-3 py-1 text-sm">Menu</summary>
            <div className="absolute right-0 z-20 mt-2 max-h-[80vh] w-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
              <AdminNav groups={groups} />
              <form action={signOut} className="mt-3 border-t pt-3"><button className="text-sm underline">Sign out</button></form>
            </div>
          </details>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-10 text-slate-500">Loading…</div>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
