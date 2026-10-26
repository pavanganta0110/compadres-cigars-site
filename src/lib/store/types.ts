export type InquiryKind = "contact" | "customer" | "order";
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

export type VerificationStatus = "pending" | "approved" | "declined" | "in_review" | "expired";

/** Outcome of a Didit ID check. No ID data is kept, only the result and a server-computed 21+ flag. */
export type AgeVerification = {
  id: string;
  created_at: string;
  updated_at: string;
  didit_session_id: string | null;
  status: VerificationStatus;
  age_ok: boolean;
  used_at: string | null;
};

/** An approved verification can be spent on one application, within this window of being created. */
export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export type PaymentStatus = "pending" | "paid" | "cancelled";

/** A request for payment on an order. Card data is never stored: only the amount and the outcome. */
export type PaymentRequest = {
  id: string;
  created_at: string;
  updated_at: string;
  inquiry_id: string;
  token: string;
  invoice_number: string;
  amount_cents: number;
  description: string | null;
  status: PaymentStatus;
  created_by: string | null;
  paid_at: string | null;
  transaction_id: string | null;
};

export type NewPaymentRequest = Pick<PaymentRequest, "inquiry_id" | "token" | "invoice_number" | "amount_cents" | "description" | "created_by">;

export interface Store {
  readonly kind: "supabase" | "dev-file";
  createPaymentRequest(p: NewPaymentRequest): Promise<PaymentRequest>;
  getPaymentRequestByToken(token: string): Promise<PaymentRequest | null>;
  getPaymentRequestByInvoice(invoice: string): Promise<PaymentRequest | null>;
  listPaymentRequests(inquiryId: string): Promise<PaymentRequest[]>;
  /** Cancels a request that is still pending (a paid one can't be cancelled). */
  cancelPaymentRequest(id: string): Promise<void>;
  /** Marks a request paid. Idempotent: returns false if it was already paid. Also applies to a request cancelled
   *  after the customer had already started paying, because the money was taken. */
  markPaymentPaid(id: string, transactionId: string): Promise<boolean>;
  createVerification(): Promise<AgeVerification>;
  getVerification(id: string): Promise<AgeVerification | null>;
  getVerificationBySession(sessionId: string): Promise<AgeVerification | null>;
  attachVerificationSession(id: string, sessionId: string): Promise<void>;
  /** Records a Didit result. A not-yet-final status never overwrites a final one, and spent rows never change. */
  applyVerificationResult(id: string, status: VerificationStatus, ageOk: boolean): Promise<void>;
  /** Atomically spends an approved, 21+, unused, unexpired verification. Returns false if it can't be spent. */
  claimVerification(id: string): Promise<boolean>;
  /** Un-spends a claim when the application could not be saved, so the customer doesn't pay for a second check. */
  releaseVerification(id: string): Promise<void>;
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
