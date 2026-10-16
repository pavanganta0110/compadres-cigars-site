import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { VERIFICATION_TTL_MS, type AgeVerification, type HistoryRow, type Inquiry, type InquiryFilter, type NewInquiry, type PageView, type Stats, type Store, type VerificationStatus } from "./types";

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

const safeName = (n: string) => n.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "file";
// PostgREST .or() filters break on these characters.
const cleanQ = (q: string) => q.replace(/[,()%*\\:]/g, " ").trim().slice(0, 80);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(q: any, f: InquiryFilter): any {
  if (f.status) q = q.eq("status", f.status);
  if (f.kind) q = q.eq("kind", f.kind);
  const s = f.q ? cleanQ(f.q) : "";
  if (s) q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,company.ilike.%${s}%,message.ilike.%${s}%,phone.ilike.%${s}%`);
  return q;
}

export const supabaseStore: Store = {
  kind: "supabase",

  async createVerification() {
    const { data, error } = await db().from("age_verifications").insert({}).select("*").single();
    if (error) throw error;
    return data as AgeVerification;
  },

  async getVerification(id) {
    const { data, error } = await db().from("age_verifications").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as AgeVerification) ?? null;
  },

  async getVerificationBySession(sessionId) {
    const { data, error } = await db().from("age_verifications").select("*").eq("didit_session_id", sessionId).maybeSingle();
    if (error) throw error;
    return (data as AgeVerification) ?? null;
  },

  async attachVerificationSession(id, sessionId) {
    const { error } = await db().from("age_verifications").update({ didit_session_id: sessionId, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  },

  async applyVerificationResult(id, status: VerificationStatus, ageOk) {
    let q = db().from("age_verifications").update({ status, age_ok: status === "approved" && ageOk, updated_at: new Date().toISOString() }).eq("id", id).is("used_at", null);
    // Never let an in-progress update (e.g. a late, out-of-order webhook) overwrite a result we already have.
    if (status === "pending") q = q.eq("status", "pending");
    const { error } = await q;
    if (error) throw error;
  },

  async claimVerification(id) {
    const cutoff = new Date(Date.now() - VERIFICATION_TTL_MS).toISOString();
    const { data, error } = await db()
      .from("age_verifications")
      .update({ used_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "approved")
      .eq("age_ok", true)
      .is("used_at", null)
      .gte("created_at", cutoff)
      .select("id");
    if (error) throw error;
    return (data ?? []).length === 1;
  },

  async releaseVerification(id) {
    const { error } = await db().from("age_verifications").update({ used_at: null }).eq("id", id);
    if (error) throw error;
  },

  async insertInquiry(i: NewInquiry) {
    const { data, error } = await db().from("inquiries").insert(i).select("id").single();
    if (error) throw error;
    return data.id as string;
  },

  async attachLicense(id, filename, bytes, contentType) {
    const path = `${id}/${Date.now()}-${safeName(filename)}`;
    const up = await db().storage.from("licenses").upload(path, bytes, { contentType, upsert: false });
    if (up.error) throw up.error;
    const { error } = await db().from("inquiries").update({ license_path: path, license_name: filename.slice(0, 200) }).eq("id", id);
    if (error) throw error;
  },

  async listInquiries(f) {
    const pageSize = f.pageSize ?? 25;
    const from = ((f.page ?? 1) - 1) * pageSize;
    const q = applyFilters(db().from("inquiries").select("*", { count: "exact" }), f)
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);
    const { data, count, error } = await q;
    if (error) throw error;
    return { rows: (data ?? []) as Inquiry[], total: count ?? 0 };
  },

  async exportInquiries(f) {
    const { data, error } = await applyFilters(db().from("inquiries").select("*"), f).order("created_at", { ascending: false }).limit(5000);
    if (error) throw error;
    return (data ?? []) as Inquiry[];
  },

  async getInquiry(id) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const { data, error } = await db().from("inquiries").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Inquiry) ?? null;
  },

  async updateInquiry(id, patch, actor) {
    const upd: Record<string, unknown> = {};
    if (patch.status) {
      upd.status = patch.status;
      upd.handled_at = patch.status === "handled" ? new Date().toISOString() : null;
      upd.handled_by = patch.status === "handled" ? actor : null;
    }
    if (patch.notes !== undefined) upd.notes = patch.notes.slice(0, 5000);
    const { error } = await db().from("inquiries").update(upd).eq("id", id);
    if (error) throw error;
  },

  async licenseUrl(path) {
    const { data, error } = await db().storage.from("licenses").createSignedUrl(path, 300);
    return error ? null : data.signedUrl;
  },

  async getSetting<T>(key: string) {
    const { data, error } = await db().from("site_settings").select("value").eq("key", key).maybeSingle();
    if (error) throw error;
    return (data?.value as T) ?? null;
  },

  async setSetting(key, value, actor, summary) {
    const old = await this.getSetting(key);
    const up = await db().from("site_settings").upsert({ key, value, updated_at: new Date().toISOString(), updated_by: actor });
    if (up.error) throw up.error;
    const h = await db().from("settings_history").insert({ actor, key, summary, old_value: old, new_value: value });
    if (h.error) throw h.error;
  },

  async listHistory(limit) {
    const { data, error } = await db().from("settings_history").select("id,created_at,actor,key,summary").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data ?? []) as HistoryRow[];
  },

  async addPageView(v: PageView) {
    const { error } = await db().from("page_views").insert(v);
    if (error) throw error;
  },

  async stats() {
    const { data, error } = await db().rpc("dashboard_stats");
    if (error) throw error;
    return data as Stats;
  },

  async putAsset(name, bytes, contentType) {
    const path = safeName(name);
    const up = await db().storage.from("site-assets").upload(path, bytes, { contentType, upsert: true });
    if (up.error) throw up.error;
    return `${db().storage.from("site-assets").getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
  },
};
