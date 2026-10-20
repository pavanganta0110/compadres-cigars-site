"use client";

import { useSyncExternalStore } from "react";
import { MAX_QTY, parseCartLines, type CartLine } from "@/lib/shop";

// Browser-side cart kept in localStorage (no account needed to add to cart). It is only a convenience:
// the server re-validates every line when the order is submitted.
const KEY = "cc_cart_v1";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cache: CartLine[] | null = null;

function load(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = parseCartLines(JSON.parse(raw));
    return parsed.ok ? parsed.lines : EMPTY;
  } catch {
    return EMPTY; // storage blocked or corrupt: behave like an empty cart
  }
}

function snapshot(): CartLine[] {
  if (cache === null) cache = load();
  return cache;
}

function commit(lines: CartLine[]) {
  cache = lines.length ? lines : EMPTY;
  try {
    if (lines.length) window.localStorage.setItem(KEY, JSON.stringify(lines));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: the cart still works for this page view */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null; // another tab changed the cart
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);

export function addToCart(id: string, qty: number) {
  const cur = snapshot();
  const have = cur.find((l) => l.id === id)?.qty ?? 0;
  const next = Math.min(MAX_QTY, have + qty);
  commit(have ? cur.map((l) => (l.id === id ? { ...l, qty: next } : l)) : [...cur, { id, qty: next }]);
}

export function setQty(id: string, qty: number) {
  const q = Math.max(1, Math.min(MAX_QTY, Math.floor(qty) || 1));
  commit(snapshot().map((l) => (l.id === id ? { ...l, qty: q } : l)));
}

export function removeLine(id: string) {
  commit(snapshot().filter((l) => l.id !== id));
}

export function clearCart() {
  commit(EMPTY);
}
