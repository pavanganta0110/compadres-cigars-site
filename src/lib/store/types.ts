export type InquiryKind = "contact" | "customer";
export type InquiryStatus = "new" | "in_progress" | "handled" | "spam";

export type Inquiry = {
  id: string;
  created_at: string;
  kind: InquiryKind;
  status: InquiryStatus;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  data: Record<string, string>;
  license_path: string | null;
  license_name: string | null;
  notes: string | null;
  handled_at: string | null;
  handled_by: string | null;
};

export type NewInquiry = Pick<Inquiry, "kind" | "name" | "email" | "phone" | "company" | "message" | "data">;

export type InquiryFilter = { status?: InquiryStatus; kind?: InquiryKind; q?: string; page?: number; pageSize?: number };

export type HistoryRow = { id: number; created_at: string; actor: string | null; key: string; summary: string | null };

export type PageView = { path: string; referrer_host: string | null; device: string; country: string | null; visitor: string };

export type Stats = {
  visitors_30: number;
  visitors_365: number;
  views_30: number;
  by_day: { day: string; visitors: number }[];
  top_pages: { path: string; views: number }[];
  inq_total: number;
  inq_30: number;
  cust_total: number;
  cust_30: number;
  new_count: number;
};

export interface Store {
  readonly kind: "supabase" | "dev-file";
  insertInquiry(i: NewInquiry): Promise<string>;
  attachLicense(id: string, filename: string, bytes: Buffer, contentType: string): Promise<void>;
  listInquiries(f: InquiryFilter): Promise<{ rows: Inquiry[]; total: number }>;
  exportInquiries(f: Omit<InquiryFilter, "page" | "pageSize">): Promise<Inquiry[]>;
  getInquiry(id: string): Promise<Inquiry | null>;
  updateInquiry(id: string, patch: { status?: InquiryStatus; notes?: string }, actor: string): Promise<void>;
  licenseUrl(path: string): Promise<string | null>;
  getSetting<T>(key: string): Promise<T | null>;
  setSetting(key: string, value: unknown, actor: string, summary: string): Promise<void>;
  listHistory(limit: number): Promise<HistoryRow[]>;
  addPageView(v: PageView): Promise<void>;
  stats(): Promise<Stats>;
  putAsset(name: string, bytes: Buffer, contentType: string): Promise<string>;
}
