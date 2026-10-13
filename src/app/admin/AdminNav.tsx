"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavGroup = { heading?: string; items: { href: string; label: string; badge?: number }[] };

export default function AdminNav({ groups }: { groups: NavGroup[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="space-y-6">
      {groups.map((g, i) => (
        <div key={i}>
          {g.heading && <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{g.heading}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = it.href === "/admin" ? path === "/admin" : path === it.href || path.startsWith(it.href + "/");
              return (
                <li key={it.href}>
                  <Link href={it.href} aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${active ? "bg-[#dcefef] font-medium text-slate-900" : "text-slate-600 hover:bg-slate-100"}`}>
                    {it.label}
                    {!!it.badge && <span className="rounded-full bg-[#0e7c86] px-2 py-0.5 text-xs font-semibold text-white">{it.badge}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
