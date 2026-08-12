-- IGO Protein Cuts — Orders table
-- SUPERSEDED: this project's Supabase database is shared with another one of
-- the owner's apps. To guarantee zero collision with that app's tables/data,
-- this site now uses the namespaced "igo_" tables created in
-- 0002_igo_platform_schema.sql (igo_orders, igo_customers, igo_referrals,
-- igo_subscriptions, igo_combos, etc.) instead of this bare "orders" table.
--
-- Do NOT run this file. It is kept only for history. If you already ran it
-- previously, the bare `public.orders` table it created is unused by the app
-- (server.ts now writes to `public.igo_orders`) and can be left as-is or
-- dropped — it will not affect this site or the other app.
--
-- Original notes below:
-- Run this once in your Supabase project's SQL Editor:
-- https://supabase.com/dashboard/project/aweevhgnbjuxcvnvjeie/sql/new
--
-- This is the durable system-of-record for orders. The app still keeps a fast
-- localStorage copy for the UI, and mirrors every order + status change here
-- in the background via the server (using the service_role key, never exposed
-- to the browser).

create table if not exists public.orders (
  id text primary key,
  order_number text not null,
  created_at timestamptz not null default now(),
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address jsonb,
  items jsonb,
  subtotal numeric,
  discount_amount numeric,
  delivery_fee numeric,
  tax numeric,
  total_amount numeric,
  payment_method text,
  payment_status text,
  status text,
  delivery_slot text,
  tracking_step int,
  delivery_partner_name text,
  driver_details jsonb,
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Row Level Security: the app doesn't use Supabase Auth yet (login uses a
-- custom server-side OTP flow), so only the service_role key (server-only,
-- never shipped to the browser) can read/write. No anon/public access.
alter table public.orders enable row level security;

drop policy if exists "Service role full access" on public.orders;
create policy "Service role full access"
  on public.orders
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
