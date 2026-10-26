// Money is always whole cents (never floating point). Safe to import from server and client code.
export const centsToAmount = (cents: number): string => `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
export const formatUsd = (cents: number): string => `$${Math.floor(cents / 100).toLocaleString("en-US")}.${String(cents % 100).padStart(2, "0")}`;
