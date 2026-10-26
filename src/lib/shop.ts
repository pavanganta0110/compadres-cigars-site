import { formatUsd } from "@/lib/money";
import { MAIN_LINE } from "@/lib/site";

// What can go in the cart, and what it costs. The server prices every order from THIS file, so nothing the
// browser sends (names, ids, quantities, prices) is trusted: the browser only ever sends product ids and
// quantities.
//
// !!! PLACEHOLDER PRICES !!!  Every price and the shipping charge below are made-up placeholders, to be
// replaced with the real price list. While PRICES_ARE_PLACEHOLDERS is true the site will NOT take live card
// payments (see src/app/api/order/route.ts): sandbox testing only. After replacing the prices, set it to false.
export const PRICES_ARE_PLACEHOLDERS = true;

/** Flat shipping per order (placeholder). Sales/excise taxes are not added online. */
export const SHIPPING_CENTS = 1500;

// Units are the selling unit shown to customers. Edit them here if a product is sold differently.
export type ShopItem = { id: string; name: string; spec: string; unit: string; group: string; priceCents: number };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const mainLineId = (name: string) => `main-${slug(name)}`;

const MAIN_LINE_PRICES: Record<string, number> = {
  Robusto: 12900,
  Belicoso: 13500,
  "Maduro Torpedo": 13900,
  "Double Maduro Toro": 14500,
  "Gran Corona": 14900,
};

export const SHOP_ITEMS: ShopItem[] = [
  ...MAIN_LINE.map((c) => ({ id: mainLineId(c.name), name: `Main Line ${c.name}`, spec: c.size, unit: "box", group: "Main Line", priceCents: MAIN_LINE_PRICES[c.name] ?? 14000 })),
  { id: "cardinal-box-press", name: "Cardinal Box Press", spec: "60 x 6.75 Box Press Torpedo, Corojo wrap", unit: "box", group: "Cardinal Line", priceCents: 18900 },
  { id: "cardinal-perfecto", name: "Cardinal Perfecto", spec: "60 x 6 Perfecto, Corojo wrap", unit: "box", group: "Cardinal Line", priceCents: 17900 },
  ...["Cognac", "Cherry", "Vanilla", "Chocolate", "Espresso", "Variety"].map((f) => ({
    id: `cigarillos-${slug(f)}`,
    name: `Cigarillos, ${f}`,
    spec: "Hand rolled, 10 per wooden tray",
    unit: "tray of 10",
    group: "Cigarillos & Flavored Cigars",
    priceCents: f === "Variety" ? 2600 : 2400,
  })),
  { id: "cognac-robusto", name: "Cognac Robusto", spec: "50 x 5", unit: "bundle of 25", group: "Cigarillos & Flavored Cigars", priceCents: 9900 },
  { id: "blanks-gran-corona", name: "Dominican Blanks, Gran Corona", spec: "60 x 6, hand rolled short fill", unit: "bundle of 25", group: "Dominican Blanks", priceCents: 8900 },
  { id: "blanks-toro", name: "Dominican Blanks, Toro", spec: "52 x 6, hand rolled short fill", unit: "bundle of 25", group: "Dominican Blanks", priceCents: 7900 },
  { id: "blanks-robusto", name: "Dominican Blanks, Robusto", spec: "50 x 5, hand rolled short fill", unit: "bundle of 25", group: "Dominican Blanks", priceCents: 6900 },
];

const BY_ID = new Map(SHOP_ITEMS.map((i) => [i.id, i]));
export const itemById = (id: string): ShopItem | undefined => BY_ID.get(id);

export const MAX_QTY = 500;
export const MAX_LINES = 40;

export type CartLine = { id: string; qty: number };

/** Validates untrusted cart data (from the browser or localStorage). Unknown ids and bad quantities are errors. */
export function parseCartLines(input: unknown): { ok: true; lines: CartLine[] } | { ok: false; error: string } {
  if (!Array.isArray(input) || input.length === 0) return { ok: false, error: "Your cart is empty." };
  if (input.length > MAX_LINES) return { ok: false, error: "Too many different products in one order. Please call us." };
  const merged = new Map<string, number>();
  for (const raw of input) {
    const { id, qty } = (raw ?? {}) as { id?: unknown; qty?: unknown };
    if (typeof id !== "string" || !BY_ID.has(id)) return { ok: false, error: "A product in your cart is no longer available. Please review your cart." };
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return { ok: false, error: `Quantities must be whole numbers from 1 to ${MAX_QTY}.` };
    merged.set(id, Math.min(MAX_QTY, (merged.get(id) ?? 0) + qty));
  }
  return { ok: true, lines: [...merged].map(([id, qty]) => ({ id, qty })) };
}

export type PricedLine = { id: string; qty: number; name: string; spec: string; unit: string; unitCents: number; lineCents: number };
export type Totals = { lines: PricedLine[]; subtotalCents: number; shippingCents: number; totalCents: number };

/** Prices a (validated) cart from the catalog above. Whole cents throughout. */
export function priceLines(lines: CartLine[]): Totals {
  const priced: PricedLine[] = [];
  for (const l of lines) {
    const i = BY_ID.get(l.id);
    if (!i) continue; // callers validate with parseCartLines first
    priced.push({ id: l.id, qty: l.qty, name: i.name, spec: i.spec, unit: i.unit, unitCents: i.priceCents, lineCents: i.priceCents * l.qty });
  }
  const subtotalCents = priced.reduce((n, l) => n + l.lineCents, 0);
  const shippingCents = priced.length ? SHIPPING_CENTS : 0;
  return { lines: priced, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

/** Human-readable order lines for the admin inbox and emails. */
export function describeLines(lines: CartLine[]): string {
  const t = priceLines(lines);
  const rows = t.lines.map((l) => `${l.qty} x ${l.name} (${l.spec}) @ ${formatUsd(l.unitCents)} per ${l.unit} = ${formatUsd(l.lineCents)}`);
  rows.push(`Subtotal ${formatUsd(t.subtotalCents)}, shipping ${formatUsd(t.shippingCents)}, TOTAL ${formatUsd(t.totalCents)}`);
  return rows.join("\n");
}
