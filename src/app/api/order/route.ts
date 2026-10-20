import { isUuid } from "@/lib/didit";
import { checkUpload, deliverInquiry, parseInquiry, type Attachment } from "@/lib/inquiry";
import { describeLines, parseCartLines } from "@/lib/shop";
import { getStore } from "@/lib/store";

// Order REQUEST from the cart. No payment is taken: Compadres confirms pricing and payment afterward.
// Everything the browser sends is re-validated here: the cart lines against the product list, and the
// 21+ ID check against our own verification record.
export async function POST(request: Request) {
  const body: Record<string, unknown> = {};
  let file: File | null = null;
  try {
    const form = await request.formData();
    for (const [k, v] of form.entries()) {
      if (typeof v === "string") body[k] = v;
      else if (k === "license" && v.size > 0) file = v;
    }
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (typeof body.website === "string" && body.website) return Response.json({ ok: true });

  const parsed = parseInquiry("order", body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(typeof body.items === "string" ? body.items : "null");
  } catch {
    return Response.json({ error: "Your cart could not be read. Please review it and try again." }, { status: 400 });
  }
  const cart = parseCartLines(rawItems);
  if (!cart.ok) return Response.json({ error: cart.error }, { status: 400 });

  if (body.acceptTerms !== "yes") {
    return Response.json({ error: "Please agree to the Terms & Conditions and policies to submit your order." }, { status: 400 });
  }

  let attachment: Attachment | undefined;
  if (file) {
    const problem = checkUpload(file);
    if (problem) return Response.json({ error: problem }, { status: 400 });
    attachment = { filename: file.name, content: Buffer.from(await file.arrayBuffer()).toString("base64") };
  }

  // The 21+ ID check is enforced here: approved, 21+, unused and under 24 hours old. Spent once.
  const store = getStore();
  const vid = body.verificationId;
  if (!store || !isUuid(vid) || !(await store.claimVerification(vid).catch(() => false))) {
    return Response.json({ error: "Please complete ID verification (21+) before submitting your order." }, { status: 403 });
  }
  const release = () => store.releaseVerification(vid).catch(() => {});

  const d = parsed.data;
  d.items = describeLines(cart.lines);
  d.ageVerified = "Yes (Didit ID check, 21+)";
  d.verificationId = vid;
  d.acceptedTerms = "Yes (Terms & Conditions, Privacy, Refund and Shipping policies)";

  let saved = false;
  try {
    const id = await store.insertInquiry({
      kind: "order",
      name: [d.firstName, d.lastName].filter(Boolean).join(" ") || null,
      email: d.email,
      phone: d.phone || null,
      company: d.company || null,
      message: d.message || null,
      data: d,
    });
    saved = true;
    if (file) await store.attachLicense(id, file.name, Buffer.from(await file.arrayBuffer()), file.type || "application/octet-stream").catch((e) => console.error("order: license upload failed", e));
  } catch (e) {
    console.error("order: could not save", e);
  }
  const emailed = await deliverInquiry("order", d, attachment).catch(() => false);
  if (!saved && !emailed) {
    await release(); // the customer can retry without a second ID check
    return Response.json({ error: "We couldn't submit your order right now. Please call us at (816) 878-3545." }, { status: 503 });
  }
  return Response.json({ ok: true });
}
