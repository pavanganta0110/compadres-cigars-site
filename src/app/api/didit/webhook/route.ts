import { isUuid, verifyWebhook } from "@/lib/didit";
import { getStore } from "@/lib/store";
import { syncVerification } from "@/lib/verification";

// Didit calls this when a verification changes status. It is open to the public internet (Didit has no
// age cookie), so the HMAC signature is the only thing that makes a request trustworthy. We also never
// act on the payload's status directly: after the signature checks out we ask Didit for the decision.
export async function POST(request: Request) {
  const raw = await request.text(); // exact bytes; do not re-serialize before verifying
  const body = verifyWebhook(raw, request.headers);
  if (!body) return new Response("Invalid signature", { status: 401 });

  const store = getStore();
  if (!store) return new Response("Store unavailable", { status: 503 }); // Didit retries 5xx

  const sessionId = body.session_id;
  if (!isUuid(sessionId)) return new Response("ok"); // not a session event (e.g. user/transaction events)
  if (body.workflow_id && process.env.DIDIT_WORKFLOW_ID && body.workflow_id !== process.env.DIDIT_WORKFLOW_ID) {
    return new Response("ok"); // some other workflow on the same Didit application
  }

  const row = (isUuid(body.vendor_data) ? await store.getVerification(body.vendor_data) : null) ?? (await store.getVerificationBySession(sessionId));
  if (!row || row.didit_session_id !== sessionId) return new Response("ok"); // unknown or mismatched session: nothing to do

  try {
    await syncVerification(store, row);
  } catch (e) {
    console.error("didit webhook: sync failed", e);
    return new Response("Temporary failure", { status: 500 }); // Didit retries
  }
  return new Response("ok");
}
