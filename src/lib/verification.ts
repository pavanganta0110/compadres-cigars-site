import "server-only";
import { fetchDecision } from "@/lib/didit";
import type { AgeVerification, Store } from "@/lib/store/types";

/** What the browser is told. The raw Didit status never leaves the server. */
export type VerificationState = "pending" | "review" | "verified" | "failed" | "used";

export function stateOf(v: AgeVerification): VerificationState {
  if (v.used_at) return "used";
  if (v.status === "approved") return v.age_ok ? "verified" : "failed"; // approved ID, but under 21 (or no readable DOB)
  if (v.status === "in_review") return "review";
  if (v.status === "declined" || v.status === "expired") return "failed";
  return "pending";
}

/** Pulls the authoritative result from Didit and records it. Safe to call repeatedly. */
export async function syncVerification(store: Store, v: AgeVerification): Promise<AgeVerification> {
  if (!v.didit_session_id || v.used_at) return v;
  const d = await fetchDecision(v.didit_session_id);
  await store.applyVerificationResult(v.id, d.status, d.ageOk);
  return (await store.getVerification(v.id)) ?? v;
}
