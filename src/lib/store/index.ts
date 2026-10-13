import "server-only";
import type { Store } from "./types";
import { supabaseStore } from "./supabase";
import { fileStore } from "./file";

export function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** The dev stand-in is only ever allowed outside production. */
export function devStoreAllowed(): boolean {
  return process.env.NODE_ENV !== "production" && !supabaseConfigured();
}

/** Returns the data store, or null when nothing is configured (e.g. production before Supabase is set up). */
export function getStore(): Store | null {
  if (supabaseConfigured()) return supabaseStore;
  if (devStoreAllowed()) return fileStore;
  return null;
}
