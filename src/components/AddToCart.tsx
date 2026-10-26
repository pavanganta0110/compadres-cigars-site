"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { formatUsd } from "@/lib/money";
import { MAX_QTY, itemById } from "@/lib/shop";

// "Add to cart" for one product, or a choice of variants (flavors, sizes) when several ids are given.
export default function AddToCart({ options, unit }: { options: { id: string; label: string }[]; unit: string }) {
  const [id, setId] = useState(options[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const field = "h-11 rounded border border-white/30 bg-ink px-3 text-bone";
  const price = itemById(id)?.priceCents;

  return (
    <div className="mx-auto mt-6 flex max-w-[520px] flex-wrap items-center justify-center gap-3 normal-case">
      {price !== undefined && <p className="w-full text-center text-lg text-gold">{formatUsd(price)} <span className="text-sm text-muted">per {unit}</span></p>}
      {options.length > 1 && (
        <select aria-label="Choose a variety" value={id} onChange={(e) => { setId(e.target.value); setAdded(false); }} className={field}>
          {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      )}
      <label className="flex items-center gap-2 text-sm text-muted">
        Qty ({unit})
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_QTY}
          value={qty}
          onChange={(e) => { setQty(Math.max(1, Math.min(MAX_QTY, Math.floor(Number(e.target.value)) || 1))); setAdded(false); }}
          className={`${field} w-20 text-center`}
        />
      </label>
      <button
        type="button"
        onClick={() => { addToCart(id, qty); setAdded(true); }}
        className="h-11 rounded bg-gold px-5 font-bold uppercase tracking-wide text-white transition hover:brightness-110"
      >
        Add to cart
      </button>
      {added && (
        <p role="status" className="w-full text-sm text-gold">
          Added to your cart. <Link href="/cart" className="underline">View cart</Link>
        </p>
      )}
    </div>
  );
}
