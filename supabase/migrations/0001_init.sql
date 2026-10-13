-- Compadres Cigars: inquiries inbox, site settings, change history, first-party page views.
-- Run in the Supabase SQL editor (or `supabase db push`) on the NEW Compadres project.
--
-- Security model: every table has Row Level Security ENABLED with NO policies, so the public
-- (anon) and signed-in (authenticated) keys can read/write nothing. Only the server, using the
-- secret service-role key (never sent to browsers), touches these tables.

create extension if not exists pgcrypto;

create table if not exists public.inquiries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  kind          text not null check (kind in ('contact', 'customer')),
  status        text not null default 'new' check (status in ('new', 'in_progress', 'handled', 'spam')),
  name          text,
  email         text not null,
  phone         text,
  company       text,
  message       text,
  data          jsonb not null default '{}'::jsonb,   -- every submitted field
  license_path  text,                                 -- object path in the private "licenses" bucket
  license_name  text,
  notes         text,
  handled_at    timestamptz,
  handled_by    text
);
create index if not exists inquiries_created_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx  on public.inquiries (status);
create index if not exists inquiries_kind_idx    on public.inquiries (kind);

create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

create table if not exists public.settings_history (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  actor      text,
  key        text not null,
  summary    text,
  old_value  jsonb,
  new_value  jsonb
);
create index if not exists settings_history_created_idx on public.settings_history (created_at desc);

-- First-party, cookie-less page views. No IP address is stored; "visitor" is a daily-rotating hash.
create table if not exists public.page_views (
  id            bigserial primary key,
  created_at    timestamptz not null default now(),
  day           date not null default ((now() at time zone 'utc')::date),
  path          text not null,
  referrer_host text,
  device        text,
  country       text,
  visitor       text not null
);
create index if not exists page_views_day_idx  on public.page_views (day);
create index if not exists page_views_path_idx on public.page_views (path);

alter table public.inquiries        enable row level security;
alter table public.site_settings    enable row level security;
alter table public.settings_history enable row level security;
alter table public.page_views       enable row level security;
-- (intentionally no policies: deny-all for anon/authenticated; service_role bypasses RLS)

-- Numbers for the dashboard overview, computed in the database.
create or replace function public.dashboard_stats()
returns jsonb language sql stable security invoker as $$
  select jsonb_build_object(
    'visitors_30',  (select count(distinct day::text || visitor) from public.page_views where day >= current_date - 29),
    'visitors_365', (select count(distinct day::text || visitor) from public.page_views where day >= current_date - 364),
    'views_30',     (select count(*) from public.page_views where day >= current_date - 29),
    'by_day', coalesce((select jsonb_agg(jsonb_build_object('day', d, 'visitors', v) order by d)
                        from (select day as d, count(distinct visitor) as v from public.page_views
                              where day >= current_date - 29 group by day) x), '[]'::jsonb),
    'top_pages', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'views', c))
                           from (select path, count(*) as c from public.page_views
                                 where day >= current_date - 29 group by path order by c desc limit 8) y), '[]'::jsonb),
    'inq_total',  (select count(*) from public.inquiries where kind = 'contact'),
    'inq_30',     (select count(*) from public.inquiries where kind = 'contact'  and created_at >= now() - interval '30 days'),
    'cust_total', (select count(*) from public.inquiries where kind = 'customer'),
    'cust_30',    (select count(*) from public.inquiries where kind = 'customer' and created_at >= now() - interval '30 days'),
    'new_count',  (select count(*) from public.inquiries where status = 'new')
  );
$$;
revoke all on function public.dashboard_stats() from public, anon, authenticated;
grant execute on function public.dashboard_stats() to service_role;

-- Storage buckets: licenses are PRIVATE (signed links only); site-assets (favicon, etc.) are public-read.
insert into storage.buckets (id, name, public) values ('licenses', 'licenses', false)
  on conflict (id) do update set public = false;
insert into storage.buckets (id, name, public) values ('site-assets', 'site-assets', true)
  on conflict (id) do update set public = true;
