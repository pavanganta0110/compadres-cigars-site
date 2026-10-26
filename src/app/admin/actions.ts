"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { adminEmails, requestOrigin, requireAdmin, supabaseAuthClient } from "@/lib/admin-auth";
import { authnetConfigured, newInvoiceNumber, newPayToken, parseAmountToCents } from "@/lib/authnet";
import { SECTIONS, SEO_PAGES, extractMetaContent, type SeoSettings } from "@/lib/settings";
import { getStore, supabaseConfigured } from "@/lib/store";
import type { InquiryStatus } from "@/lib/store/types";

export type LoginState = { message?: string };
export type SaveState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");

// ---- sign in / out ---------------------------------------------------------------------------
export async function sendLoginLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = str(formData, "email").trim().toLowerCase();
  if (!EMAIL.test(email)) return { message: "Please enter a valid email address." };
  // Same answer whether or not the address is allowed, so the form can't be used to probe the list.
  if (supabaseConfigured() && adminEmails().includes(email)) {
    const sb = await supabaseAuthClient();
    const origin = await requestOrigin();
    await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/callback`, shouldCreateUser: true } });
  }
  return { message: "If that email is on the admin list, a sign-in link is on its way. It expires in an hour." };
}

export async function signOut() {
  if (supabaseConfigured()) await (await supabaseAuthClient()).auth.signOut();
  redirect("/admin/login");
}

// ---- settings --------------------------------------------------------------------------------
export async function saveSection(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const admin = await requireAdmin();
  const store = getStore();
  if (!store) return { error: "The database isn't connected yet." };

  const spec = SECTIONS.find((s) => s.key === str(fd, "_section"));
  if (!spec) return { error: "Unknown section." };

  const value: Record<string, string> = {};
  const fieldErrors: Record<string, string> = {};
  for (const f of spec.fields) {
    let v = str(fd, f.name).trim();
    if (f.kind === "checkbox") v = fd.get(f.name) ? "1" : "";
    if (v && spec.key.match(/^(facebookTag|pinterestTag|searchConsole)$/)) v = extractMetaContent(v);
    if (f.max && v.length > f.max) fieldErrors[f.name] = `Keep this under ${f.max} characters.`;
    if (v && f.kind === "url") {
      try {
        if (new URL(v).protocol !== "https:") throw new Error();
      } catch {
        fieldErrors[f.name] = "Enter a full https:// link.";
      }
    }
    if (v && f.kind === "email" && !EMAIL.test(v)) fieldErrors[f.name] = "Enter a valid email address.";
    if (v && f.pattern && !f.pattern.test(v)) fieldErrors[f.name] = f.patternHelp ?? "That value isn't valid.";
    value[f.name] = v;
  }
  if (Object.keys(fieldErrors).length) return { error: "Please fix the highlighted fields.", fieldErrors };

  await store.setSetting(spec.key, value, admin.email, `Saved “${spec.title}”`);
  updateTag("settings");
  return { ok: true };
}

export async function saveSeo(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const admin = await requireAdmin();
  const store = getStore();
  if (!store) return { error: "The database isn't connected yet." };

  const seo: SeoSettings = {
    defaultTitle: str(fd, "defaultTitle").trim().slice(0, 70),
    defaultDescription: str(fd, "defaultDescription").trim().slice(0, 200),
    ogImage: str(fd, "ogImage").trim().slice(0, 300),
    pages: {},
  };
  if (seo.ogImage && !/^(\/|https:\/\/)/.test(seo.ogImage)) return { error: "The social image must start with / or https://.", fieldErrors: { ogImage: "Use a path like /images/x.jpg or an https:// link." } };
  for (const p of SEO_PAGES) {
    const title = str(fd, `title:${p.path}`).trim().slice(0, 70);
    const description = str(fd, `desc:${p.path}`).trim().slice(0, 200);
    if (title || description) seo.pages[p.path] = { ...(title && { title }), ...(description && { description }) };
  }
  await store.setSetting("seo", seo, admin.email, "Saved “SEO Settings”");
  updateTag("settings");
  return { ok: true };
}

export async function saveLlms(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const admin = await requireAdmin();
  const store = getStore();
  if (!store) return { error: "The database isn't connected yet." };
  const text = str(fd, "text").replace(/\r\n/g, "\n").slice(0, 20000);
  await store.setSetting("llms", { text }, admin.email, text.trim() ? "Saved “AI Visibility (llms.txt)”" : "Reset llms.txt to the generated default");
  updateTag("settings");
  return { ok: true };
}

const ICON_TYPES: Record<string, string> = { "image/png": "png", "image/x-icon": "ico", "image/vnd.microsoft.icon": "ico", "image/jpeg": "jpg" };

export async function saveFavicon(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const admin = await requireAdmin();
  const store = getStore();
  if (!store) return { error: "The database isn't connected yet." };

  if (fd.get("remove")) {
    await store.setSetting("favicon", { url: "" }, admin.email, "Removed favicon");
    updateTag("settings");
    return { ok: true };
  }
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image first." };
  const ext = ICON_TYPES[file.type];
  if (!ext) return { error: "Use a PNG, ICO or JPG image." };
  if (file.size > 512 * 1024) return { error: "That image is over 512 KB." };
  const url = await store.putAsset(`favicon.${ext}`, Buffer.from(await file.arrayBuffer()), file.type);
  await store.setSetting("favicon", { url }, admin.email, "Updated favicon");
  updateTag("settings");
  return { ok: true };
}

// ---- inquiries -------------------------------------------------------------------------------
const STATUSES: InquiryStatus[] = ["new", "in_progress", "handled", "spam"];

export async function setInquiryStatus(fd: FormData) {
  const admin = await requireAdmin();
  const store = getStore();
  const status = str(fd, "status") as InquiryStatus;
  if (!store || !STATUSES.includes(status)) return;
  await store.updateInquiry(str(fd, "id"), { status }, admin.email);
  revalidatePath("/admin", "layout"); // refresh the list, detail page and the sidebar "new" count
}

export async function saveInquiryNotes(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const admin = await requireAdmin();
  const store = getStore();
  if (!store) return { error: "The database isn't connected yet." };
  await store.updateInquiry(str(fd, "id"), { notes: str(fd, "notes") }, admin.email);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

// ---- payment requests ------------------------------------------------------------------------------
// The amount is set ONLY here, by a signed-in admin, after confirming the order with the customer. The
// customer can never change it: their payment link carries only an unguessable token.
export async function createPaymentRequest(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const admin = await requireAdmin();
  const store = getStore();
  if (!store) return { error: "The database isn't connected yet." };
  if (!authnetConfigured()) return { error: "Payments aren't set up yet (Authorize.net keys missing)." };

  const cents = parseAmountToCents(str(fd, "amount").replace(/^\$/, ""));
  if (cents === null) return { error: "Enter an amount like 250 or 249.50 (up to $50,000)." };
  const inquiry = await store.getInquiry(str(fd, "inquiryId"));
  if (!inquiry || inquiry.kind !== "order") return { error: "Payments can only be requested for orders." };

  await store.createPaymentRequest({
    inquiry_id: inquiry.id,
    token: newPayToken(),
    invoice_number: newInvoiceNumber(),
    amount_cents: cents,
    description: str(fd, "description").trim().slice(0, 200) || "Compadres Cigars order",
    created_by: admin.email,
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function cancelPaymentRequest(fd: FormData) {
  await requireAdmin();
  const store = getStore();
  if (!store) return;
  await store.cancelPaymentRequest(str(fd, "id"));
  revalidatePath("/admin", "layout");
}
