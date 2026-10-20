"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/cart";

export default function CartLink() {
  const n = cartCount(useCart());
  return (
    <Link href="/cart" aria-label={`Cart, ${n} ${n === 1 ? "item" : "items"}`} className="ml-2 flex items-center gap-1.5 px-1.5 py-[5px] uppercase leading-6 hover:text-gold lg:ml-4">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /><path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 7H6" />
      </svg>
      <span>Cart{n > 0 && ` (${n})`}</span>
    </Link>
  );
}
