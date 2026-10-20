"use client";

import Link from "next/link";
import { cartCount, removeLine, setQty, useCart } from "@/lib/cart";
import { MAX_QTY, itemById } from "@/lib/shop";

export default function CartView() {
  const lines = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[560px] text-center">
        <p className="text-muted">Your cart is empty.</p>
        <Link href="/all-products" className="mt-6 inline-block rounded bg-gold px-6 py-3 font-bold uppercase tracking-wide text-white hover:brightness-110">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[800px]">
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {lines.map((l) => {
          const item = itemById(l.id);
          if (!item) return null;
          return (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div className="min-w-0 flex-1">
                <p className="uppercase text-bone">{item.name}</p>
                <p className="text-sm text-muted">{item.spec} · sold per {item.unit}</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                Qty
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_QTY}
                  value={l.qty}
                  onChange={(e) => setQty(l.id, Number(e.target.value))}
                  className="h-10 w-20 rounded border border-white/30 bg-ink px-2 text-center text-bone"
                />
              </label>
              <button type="button" onClick={() => removeLine(l.id)} className="text-sm uppercase text-muted underline hover:text-gold">Remove</button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted">{cartCount(lines)} {cartCount(lines) === 1 ? "unit" : "units"} in your cart</p>
        <Link href="/checkout" className="rounded bg-gold px-8 py-3 font-bold uppercase tracking-wide text-white hover:brightness-110">Checkout</Link>
      </div>
      <p className="mt-6 text-sm leading-6 text-muted">
        Prices are confirmed by Compadres Cigars when we accept your order. No payment is taken on this website. See our{" "}
        <Link href="/shipping-policy" className="underline">Shipping Policy</Link> and <Link href="/refund-policy" className="underline">Refund Policy</Link>.
      </p>
    </div>
  );
}
