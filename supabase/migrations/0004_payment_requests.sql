-- Payment requests: an admin confirms an order's price, then sends the customer a link to Authorize.net's
-- hosted payment page. Card numbers never touch this site or database; we store only the request, its
-- amount, and the outcome (status + Authorize.net transaction id).
-- Run in the Supabase SQL editor AFTER 0001, 0002 and 0003.

create table if not exists public.payment_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  inquiry_id      uuid not null references public.inquiries(id) on delete restrict,
  token           text not null unique,            -- unguessable id in the customer's payment link
  invoice_number  text not null unique,            -- sent to Authorize.net (max 20 chars) to match payments back
  amount_cents    integer not null check (amount_cents > 0 and amount_cents <= 5000000),
  description     text,
  status          text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  created_by      text,
  paid_at         timestamptz,
  transaction_id  text                              -- Authorize.net transaction id once paid
);
create index if not exists payment_requests_inquiry_idx on public.payment_requests (inquiry_id, created_at desc);

alter table public.payment_requests enable row level security;
-- (intentionally no policies: deny-all for anon/authenticated; service_role bypasses RLS)

-- Newer Supabase projects don't auto-grant table privileges to service_role for tables created in SQL.
grant all on table public.payment_requests to service_role;
