export type InquiryKind = "contact" | "customer";

export const FIELDS: Record<InquiryKind, string[]> = {
  contact: ["name", "email", "message"],
  customer: ["firstName", "lastName", "company", "address", "city", "state", "zip", "email", "phone", "message", "paymentMethod"],
};

const REQUIRED: Record<InquiryKind, string[]> = {
  contact: ["email", "message"],
  customer: ["firstName", "lastName", "company", "address", "city", "state", "zip", "email", "phone"],
};

const MAX = 4000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseInquiry(kind: InquiryKind, body: unknown): { ok: true; data: Record<string, string> } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." };
  const raw = body as Record<string, unknown>;
  const data: Record<string, string> = {};
  for (const f of FIELDS[kind]) {
    const v = raw[f];
    data[f] = typeof v === "string" ? v.trim().slice(0, MAX) : "";
  }
  for (const f of REQUIRED[kind]) {
    if (!data[f]) return { ok: false, error: "Please fill in all required fields." };
  }
  if (!EMAIL.test(data.email)) return { ok: false, error: "Please enter a valid email address." };
  return { ok: true, data };
}

export type Attachment = { filename: string; content: string }; // content is base64

export async function deliverInquiry(kind: InquiryKind, data: Record<string, string>, attachment?: Attachment): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL;
  if (!key || !to || !from) return false;

  const lines = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()),
      reply_to: data.email,
      subject: kind === "customer" ? "New customer application — Compadres Cigars" : "New website inquiry — Compadres Cigars",
      text: lines,
      ...(attachment ? { attachments: [attachment] } : {}),
    }),
  });
  return res.ok;
}

// Tobacco-license upload. Kept small: Vercel functions accept ~4.5 MB request bodies.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ALLOWED_EXT = ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "odt", "ppt", "pptx", "pps", "ppsx", "html"];

export function checkUpload(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.includes(ext)) return "That file type isn't allowed. Please use a photo, PDF or Office document.";
  if (file.size > MAX_UPLOAD_BYTES) return "That file is over 4 MB. Please send a smaller copy, or call us at (816) 878-3545.";
  return null;
}
