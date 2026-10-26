"use client";

import Link from "next/link";
import { formatUsd } from "@/lib/money";
import { cartCount, removeLine, setQty, useCart } from "@/lib/cart";
import { MAX_QTY, priceLines } from "@/lib/shop";

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

  const t = priceLines(lines);
  return (
    <div className="mx-auto max-w-[800px]">
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {t.lines.map((l) => (
          <li key={l.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div className="min-w-0 flex-1">
              <p className="uppercase text-bone">{l.name}</p>
              <p className="text-sm text-muted">{l.spec} · {formatUsd(l.unitCents)} per {l.unit}</p>
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
            <p className="w-24 text-right text-bone">{formatUsd(l.lineCents)}</p>
            <button type="button" onClick={() => removeLine(l.id)} className="text-sm uppercase text-muted underline hover:text-gold">Remove</button>
          </li>
        ))}
      </ul>

      <dl className="ml-auto mt-6 max-w-[320px] space-y-2 text-muted">
        <div className="flex justify-between"><dt>Subtotal ({cartCount(lines)} {cartCount(lines) === 1 ? "unit" : "units"})</dt><dd className="text-bone">{formatUsd(t.subtotalCents)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd className="text-bone">{formatUsd(t.shippingCents)}</dd></div>
        <div className="flex justify-between border-t border-white/10 pt-2 text-lg"><dt>Total</dt><dd className="text-bone">{formatUsd(t.totalCents)}</dd></div>
      </dl>

      <div className="mt-8 flex justify-end">
        <Link href="/checkout" className="rounded bg-gold px-8 py-3 font-bold uppercase tracking-wide text-white hover:brightness-110">Checkout</Link>
      </div>
      <p className="mt-6 text-sm leading-6 text-muted">
        Prices are in US dollars and exclude sales, excise or other taxes. You pay securely by card at checkout. See our{" "}
        <Link href="/shipping-policy" className="underline">Shipping Policy</Link> and <Link href="/refund-policy" className="underline">Refund Policy</Link>.
      </p>
    </div>
  );
}
