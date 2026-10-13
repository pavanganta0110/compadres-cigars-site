import { deliverInquiry, parseInquiry, type InquiryKind } from "@/lib/inquiry";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (typeof body.website === "string" && body.website) return Response.json({ ok: true });

  const kind: InquiryKind = body.kind === "customer" ? "customer" : "contact";
  const parsed = parseInquiry(kind, body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const sent = await deliverInquiry(kind, parsed.data).catch(() => false);
  if (!sent) {
    return Response.json(
      { error: "We couldn't send your message right now. Please call us at (816) 878-3545." },
      { status: 503 },
    );
  }
  return Response.json({ ok: true });
}
