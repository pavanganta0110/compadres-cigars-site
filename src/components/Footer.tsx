import Link from "next/link";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/shipping-policy", label: "Shipping Policy" },
];

export default function Footer() {
  return (
    <footer className="mt-auto flex min-h-[175px] items-center bg-ink px-6 py-12 text-sm text-footer lg:px-[84px]">
      <div className="mx-auto w-full max-w-[1112px] space-y-6">
        <nav aria-label="Policies" className="flex flex-wrap gap-x-6 gap-y-2 uppercase">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-gold hover:underline">{l.label}</Link>
          ))}
        </nav>
        <p>{SITE.warning}</p>
        <p>© Compadres Cigars. All rights reserved.</p>
      </div>
    </footer>
  );
}
