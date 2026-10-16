import { isUuid } from "@/lib/didit";
import { getStore } from "@/lib/store";
import { stateOf, syncVerification } from "@/lib/verification";

// The form polls this while the customer completes the Didit check in another tab. The id is an
// unguessable UUID created on our server; the answer is only ever the simplified state, never ID data.
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  const store = getStore();
  if (!store || !isUuid(id)) return Response.json({ state: "failed" }, { status: 404 });

  let row = await store.getVerification(id);
  if (!row) return Response.json({ state: "failed" }, { status: 404 });

  // The signed webhook is the primary path; this also asks Didit directly while the result is still open,
  // so a delayed or missing webhook can't leave the customer waiting.
  if (row.status === "pending" || row.status === "in_review") {
    row = await syncVerification(store, row).catch((e) => {
      console.error("verify/status: Didit sync failed", e);
      return row!;
    });
  }
  return Response.json({ state: stateOf(row) }, { headers: { "Cache-Control": "no-store" } });
}
