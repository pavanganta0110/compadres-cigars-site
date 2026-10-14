import { getAdmin } from "@/lib/admin-auth";
import { getStore } from "@/lib/store";
import type { InquiryKind, InquiryStatus } from "@/lib/store/types";

// CSV cells that start with = + - @ can run as formulas in Excel/Sheets, so neutralise them.
const cell = (v: unknown) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(request: Request) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const store = getStore();
  if (!store) return new Response("Database not configured", { status: 503 });

  const sp = new URL(request.url).searchParams;
  const status = ["new", "in_progress", "handled", "spam"].includes(sp.get("status") ?? "") ? (sp.get("status") as InquiryStatus) : undefined;
  const kind = ["contact", "customer"].includes(sp.get("kind") ?? "") ? (sp.get("kind") as InquiryKind) : undefined;
  const rows = await store.exportInquiries({ status, kind, q: (sp.get("q") ?? "").slice(0, 80) });

  const head = ["Received", "Type", "Status", "Name", "Company", "Email", "Phone", "Shipping address", "City", "State", "Zip", "Payment method", "Message", "License file", "Notes"];
  const lines = [head.map(cell).join(",")];
  for (const i of rows) {
    const d = i.data;
    const name = i.name || [d.firstName, d.lastName].filter(Boolean).join(" ");
    lines.push([i.created_at, i.kind, i.status, name, i.company, i.email, i.phone, d.address, d.city, d.state, d.zip, d.paymentMethod, i.message, i.license_name, i.notes].map(cell).join(","));
  }
  return new Response("﻿" + lines.join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="compadres-inquiries-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
  });
}
