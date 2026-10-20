import { MAIN_LINE } from "@/lib/site";

// What can go in the cart. There are no prices yet: an order is a REQUEST for quantities, and Compadres
// confirms pricing and arranges payment afterward. The server validates every cart line against this list,
// so nothing the browser sends (names, ids, quantities) is trusted.
//
// Units are the selling unit shown to customers. Edit them here if a product is sold differently.
export type ShopItem = { id: string; name: string; spec: string; unit: string; group: string };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const mainLineId = (name: string) => `main-${slug(name)}`;

export const SHOP_ITEMS: ShopItem[] = [
  ...MAIN_LINE.map((c) => ({ id: mainLineId(c.name), name: `Main Line ${c.name}`, spec: c.size, unit: "box", group: "Main Line" })),
  { id: "cardinal-box-press", name: "Cardinal Box Press", spec: "60 x 6.75 Box Press Torpedo, Corojo wrap", unit: "box", group: "Cardinal Line" },
  { id: "cardinal-perfecto", name: "Cardinal Perfecto", spec: "60 x 6 Perfecto, Corojo wrap", unit: "box", group: "Cardinal Line" },
  ...["Cognac", "Cherry", "Vanilla", "Chocolate", "Espresso", "Variety"].map((f) => ({
    id: `cigarillos-${slug(f)}`,
    name: `Cigarillos, ${f}`,
    spec: "Hand rolled, 10 per wooden tray",
    unit: "tray of 10",
    group: "Cigarillos & Flavored Cigars",
  })),
  { id: "cognac-robusto", name: "Cognac Robusto", spec: "50 x 5", unit: "bundle of 25", group: "Cigarillos & Flavored Cigars" },
  { id: "blanks-gran-corona", name: "Dominican Blanks, Gran Corona", spec: "60 x 6, hand rolled short fill", unit: "bundle of 25", group: "Dominican Blanks" },
  { id: "blanks-toro", name: "Dominican Blanks, Toro", spec: "52 x 6, hand rolled short fill", unit: "bundle of 25", group: "Dominican Blanks" },
  { id: "blanks-robusto", name: "Dominican Blanks, Robusto", spec: "50 x 5, hand rolled short fill", unit: "bundle of 25", group: "Dominican Blanks" },
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

/** Human-readable order lines for the admin inbox and emails. */
export function describeLines(lines: CartLine[]): string {
  return lines
    .map((l) => {
      const i = BY_ID.get(l.id)!;
      return `${l.qty} x ${i.name} (${i.spec}), per ${i.unit}`;
    })
    .join("\n");
}
