"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV, NAV_WIDE, SITE, type NavItem } from "@/lib/site";

// The original highlights only direct matches; "Products" is a menu and never highlights.
function isActive(pathname: string, item: NavItem) {
  if (item.label === "Products") return false;
  if (item.children) return item.children.some((c) => c.href === pathname);
  return item.href === pathname;
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<string | null>(null);

  return (
    <header className="relative z-40">
      <div className="bg-gold-bar py-1 text-center text-base leading-6 text-white">
        <p>CALL US FOR MORE INFORMATION</p>
        <a href={SITE.phoneHref}>{SITE.phone}</a>
      </div>
      <div className="relative bg-ink">
        <nav aria-label="Main" className="mx-auto flex items-center justify-between px-4 py-4 lg:justify-center lg:py-[21px]">
          <span className="text-sm font-semibold uppercase tracking-widest text-gold lg:hidden">
            Compadres Cigars
          </span>
          <button
            type="button"
            className="p-2 lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>

          <ul className="hidden items-center gap-[27px] lg:flex xl:hidden">
            {NAV.map((item) => (
              <li key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className={`block border-b-2 px-1.5 py-[5px] uppercase leading-6 transition-colors hover:text-gold ${
                    isActive(pathname, item) ? "border-gold font-bold text-gold" : "border-transparent"
                  }`}
                >
                  {item.label}
                  {item.children && <span aria-hidden className="ml-1 text-xs">⌄</span>}
                </Link>
                {item.children && (
                  <ul className="invisible absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 bg-ink-deep py-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className="block px-5 py-2 text-sm uppercase hover:text-gold">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <ul className="hidden items-center gap-[27px] xl:flex">
            {NAV_WIDE.map((item) => (
              <li key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className={`block border-b-2 px-1.5 py-[5px] uppercase leading-6 transition-colors hover:text-gold ${
                    isActive(pathname, item) ? "border-gold font-bold text-gold" : "border-transparent"
                  }`}
                >
                  {item.label}
                  {item.children && <span aria-hidden className="ml-1 text-xs">⌄</span>}
                </Link>
                {item.children && (
                  <ul className="invisible absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 bg-ink-deep py-2 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className="block px-5 py-2 text-sm uppercase hover:text-gold">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {open && (
          <ul className="border-t border-white/10 bg-ink px-4 pb-4 lg:hidden">
            {NAV.map((item) => (
              <li key={item.label} className="border-b border-white/5">
                {item.children ? (
                  <>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-3 text-left uppercase"
                      aria-expanded={sub === item.label}
                      onClick={() => setSub(sub === item.label ? null : item.label)}
                    >
                      {item.label}
                      <span aria-hidden>{sub === item.label ? "−" : "+"}</span>
                    </button>
                    {sub === item.label && (
                      <ul className="pb-2 pl-4">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} onClick={() => setOpen(false)} className="block py-2 text-sm uppercase text-muted hover:text-gold">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block py-3 uppercase ${isActive(pathname, item) ? "text-gold" : ""}`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
