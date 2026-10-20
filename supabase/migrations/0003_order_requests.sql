-- Order requests from the cart/checkout are stored as inquiries of kind 'order'.
-- Run in the Supabase SQL editor AFTER 0001 and 0002.

alter table public.inquiries drop constraint if exists inquiries_kind_check;
alter table public.inquiries
  add constraint inquiries_kind_check check (kind in ('contact', 'customer', 'order'));
