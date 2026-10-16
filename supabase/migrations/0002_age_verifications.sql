-- Didit ID-verification results for "Become a Customer" applications.
-- Run in the Supabase SQL editor (or `supabase db push`) AFTER 0001_init.sql.
--
-- Only the outcome is stored (status + a server-computed "21 or older" flag). No ID images, document
-- numbers or dates of birth are kept here; Didit holds those under its own retention settings.
-- Same security model as 0001: RLS on with NO policies, so only the server (service role) can touch it.

create table if not exists public.age_verifications (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  didit_session_id  text unique,
  status            text not null default 'pending'
                    check (status in ('pending', 'approved', 'declined', 'in_review', 'expired')),
  age_ok            boolean not null default false,   -- true only when the ID shows 21+ (computed on our server)
  used_at           timestamptz                       -- set when the verification is spent on an application
);
create index if not exists age_verifications_created_idx on public.age_verifications (created_at desc);

alter table public.age_verifications enable row level security;
-- (intentionally no policies: deny-all for anon/authenticated; service_role bypasses RLS)
