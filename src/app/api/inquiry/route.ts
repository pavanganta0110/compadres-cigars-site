import { checkUpload, deliverInquiry, parseInquiry, type Attachment, type InquiryKind } from "@/lib/inquiry";

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  let file: File | null = null;

  try {
    if ((request.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      const form = await request.formData();
      for (const [k, v] of form.entries()) {
        if (typeof v === "string") body[k] = typeof body[k] === "string" ? `${body[k]}, ${v}` : v;
        else if (k === "license" && v.size > 0) file = v;
      }
    } else {
      body = await request.json();
    }
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (typeof body.website === "string" && body.website) return Response.json({ ok: true });

  const kind: InquiryKind = body.kind === "customer" ? "customer" : "contact";
  const parsed = parseInquiry(kind, body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  let attachment: Attachment | undefined;
  if (file) {
    const problem = checkUpload(file);
    if (problem) return Response.json({ error: problem }, { status: 400 });
    attachment = { filename: file.name, content: Buffer.from(await file.arrayBuffer()).toString("base64") };
  }

  const sent = await deliverInquiry(kind, parsed.data, attachment).catch(() => false);
  if (!sent) {
    return Response.json(
      { error: "We couldn't send your message right now. Please call us at (816) 878-3545." },
      { status: 503 },
    );
  }
  return Response.json({ ok: true });
}
