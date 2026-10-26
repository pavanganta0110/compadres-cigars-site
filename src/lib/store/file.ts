import "server-only";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { nowMs } from "@/lib/clock";
import { VERIFICATION_TTL_MS, type AgeVerification, type HistoryRow, type Inquiry, type InquiryFilter, type NewInquiry, type NewPaymentRequest, type PageView, type PaymentRequest, type Stats, type Store } from "./types";

// DEVELOPMENT-ONLY stand-in for Supabase so the dashboard can be built and tested locally.
// index.ts refuses to use this when NODE_ENV === "production".
const ROOT = path.join(process.cwd(), ".dev-data");
const FILE = path.join(ROOT, "db.json");
type DB = {
  inquiries: Inquiry[];
  settings: Record<string, unknown>;
  history: (HistoryRow & { old?: unknown; new?: unknown })[];
  views: (PageView & { day: string })[];
  verifications?: AgeVerification[];
  payments?: PaymentRequest[];
};

function load(): DB {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return { inquiries: [], settings: {}, history: [], views: [] };
  }
}
function save(d: DB) {
  fs.mkdirSync(ROOT, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(d, null, 1));
}
const safeName = (n: string) => n.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "file";
const today = () => new Date(nowMs()).toISOString().slice(0, 10);
const daysAgo = (n: number) => new Date(nowMs() - n * 86400000).toISOString().slice(0, 10);

function filtered(d: DB, f: InquiryFilter) {
  const q = (f.q ?? "").toLowerCase().trim();
  return d.inquiries
    .filter((i) => (!f.status || i.status === f.status) && (!f.kind || i.kind === f.kind))
    .filter((i) => !q || [i.name, i.email, i.company, i.message, i.phone].some((v) => (v ?? "").toLowerCase().includes(q)))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export const fileStore: Store = {
  kind: "dev-file",

  async createPaymentRequest(p: NewPaymentRequest) {
    const d = load();
    const now = new Date().toISOString();
    const row: PaymentRequest = { id: randomUUID(), created_at: now, updated_at: now, status: "pending", paid_at: null, transaction_id: null, ...p };
    (d.payments ??= []).push(row);
    save(d);
    return row;
  },
  async getPaymentRequestByToken(token) { return load().payments?.find((p) => p.token === token) ?? null; },
  async getPaymentRequestByInvoice(invoice) { return load().payments?.find((p) => p.invoice_number === invoice) ?? null; },
  async listPaymentRequests(inquiryId) {
    return (load().payments ?? []).filter((p) => p.inquiry_id === inquiryId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async cancelPaymentRequest(id) {
    const d = load();
    const p = d.payments?.find((x) => x.id === id);
    if (p && p.status === "pending") { p.status = "cancelled"; p.updated_at = new Date().toISOString(); save(d); }
  },
  async markPaymentPaid(id, transactionId) {
    const d = load();
    const p = d.payments?.find((x) => x.id === id);
    if (!p || p.status === "paid") return false;
    p.status = "paid";
    p.paid_at = p.updated_at = new Date().toISOString();
    p.transaction_id = transactionId;
    save(d);
    return true;
  },

  async createVerification() {
    const d = load();
    const now = new Date().toISOString();
    const row: AgeVerification = { id: randomUUID(), created_at: now, updated_at: now, didit_session_id: null, status: "pending", age_ok: false, used_at: null };
    (d.verifications ??= []).push(row);
    save(d);
    return row;
  },
  async getVerification(id) { return load().verifications?.find((v) => v.id === id) ?? null; },
  async getVerificationBySession(sessionId) { return load().verifications?.find((v) => v.didit_session_id === sessionId) ?? null; },
  async attachVerificationSession(id, sessionId) {
    const d = load();
    const v = d.verifications?.find((x) => x.id === id);
    if (v) { v.didit_session_id = sessionId; v.updated_at = new Date().toISOString(); save(d); }
  },
  async applyVerificationResult(id, status, ageOk) {
    const d = load();
    const v = d.verifications?.find((x) => x.id === id);
    if (!v || v.used_at) return;
    if (status === "pending" && v.status !== "pending") return;
    v.status = status;
    v.age_ok = status === "approved" && ageOk;
    v.updated_at = new Date().toISOString();
    save(d);
  },
  async claimVerification(id) {
    const d = load();
    const v = d.verifications?.find((x) => x.id === id);
    if (!v || v.used_at || v.status !== "approved" || !v.age_ok || Date.parse(v.created_at) < Date.now() - VERIFICATION_TTL_MS) return false;
    v.used_at = new Date().toISOString();
    save(d);
    return true;
  },
  async releaseVerification(id) {
    const d = load();
    const v = d.verifications?.find((x) => x.id === id);
    if (v) { v.used_at = null; save(d); }
  },

  async insertInquiry(i: NewInquiry) {
    const d = load();
    const row: Inquiry = { id: randomUUID(), created_at: new Date().toISOString(), status: "new", license_path: null, license_name: null, notes: null, handled_at: null, handled_by: null, ...i };
    d.inquiries.push(row);
    save(d);
    return row.id;
  },
  async attachLicense(id, filename, bytes) {
    const rel = `licenses/${id}/${Date.now()}-${safeName(filename)}`;
    fs.mkdirSync(path.dirname(path.join(ROOT, "files", rel)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, "files", rel), bytes);
    const d = load();
    const r = d.inquiries.find((x) => x.id === id);
    if (r) { r.license_path = rel; r.license_name = filename; save(d); }
  },
  async listInquiries(f) {
    const all = filtered(load(), f);
    const size = f.pageSize ?? 25;
    const from = ((f.page ?? 1) - 1) * size;
    return { rows: all.slice(from, from + size), total: all.length };
  },
  async exportInquiries(f) { return filtered(load(), f).slice(0, 5000); },
  async getInquiry(id) { return load().inquiries.find((i) => i.id === id) ?? null; },
  async updateInquiry(id, patch, actor) {
    const d = load();
    const r = d.inquiries.find((x) => x.id === id);
    if (!r) return;
    if (patch.status) { r.status = patch.status; r.handled_at = patch.status === "handled" ? new Date().toISOString() : null; r.handled_by = patch.status === "handled" ? actor : null; }
    if (patch.notes !== undefined) r.notes = patch.notes.slice(0, 5000);
    save(d);
  },
  async licenseUrl(p) { return `/api/admin/dev-file?p=${encodeURIComponent(p)}`; },
  async getSetting<T>(key: string) { return (load().settings[key] as T) ?? null; },
  async setSetting(key, value, actor, summary) {
    const d = load();
    d.history.unshift({ id: Date.now(), created_at: new Date().toISOString(), actor, key, summary, old: d.settings[key], new: value });
    d.settings[key] = value;
    save(d);
  },
  async listHistory(limit) { return load().history.slice(0, limit).map(({ id, created_at, actor, key, summary }) => ({ id, created_at, actor, key, summary })); },
  async addPageView(v) { const d = load(); d.views.push({ ...v, day: today() }); save(d); },
  async stats() {
    const d = load();
    const within = (n: number) => d.views.filter((v) => v.day >= daysAgo(n - 1));
    const uniq = (rows: typeof d.views) => new Set(rows.map((v) => v.day + v.visitor)).size;
    const v30 = within(30);
    const byDay = new Map<string, Set<string>>();
    v30.forEach((v) => { if (!byDay.has(v.day)) byDay.set(v.day, new Set()); byDay.get(v.day)!.add(v.visitor); });
    const pages = new Map<string, number>();
    v30.forEach((v) => pages.set(v.path, (pages.get(v.path) ?? 0) + 1));
    const since = nowMs() - 30 * 86400000;
    const inq = (kind: string, recent?: boolean) => d.inquiries.filter((i) => i.kind === kind && (!recent || Date.parse(i.created_at) >= since)).length;
    return {
      visitors_30: uniq(v30), visitors_365: uniq(within(365)), views_30: v30.length,
      by_day: [...byDay].sort().map(([day, s]) => ({ day, visitors: s.size })),
      top_pages: [...pages].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([p, views]) => ({ path: p, views })),
      inq_total: inq("contact"), inq_30: inq("contact", true), cust_total: inq("customer"), cust_30: inq("customer", true),
      new_count: d.inquiries.filter((i) => i.status === "new").length,
    } satisfies Stats;
  },
  async putAsset(name, bytes) {
    const rel = `assets/${safeName(name)}`;
    fs.mkdirSync(path.join(ROOT, "files", "assets"), { recursive: true });
    fs.writeFileSync(path.join(ROOT, "files", rel), bytes);
    return `/api/dev-asset?name=${encodeURIComponent(safeName(name))}&v=${Date.now()}`;
  },
};

export const DEV_FILES_ROOT = path.join(ROOT, "files");
