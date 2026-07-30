-- IGO Protein Cuts — Platform schema (namespaced to avoid colliding with the
-- owner's other app in this same shared Supabase project)
--
-- Run this once in your Supabase project's SQL Editor:
-- https://supabase.com/dashboard/project/aweevhgnbjuxcvnvjeie/sql/new
--
-- Every table below is prefixed "igo_" on purpose. This project's Supabase
-- database is shared with another of the owner's apps — using a distinct
-- prefix guarantees these new tables can never collide with that app's
-- existing table names, columns, or data. Nothing here touches, reads, or
-- modifies any non "igo_" table.
--
-- Covers: orders (replaces the old unprefixed 0001_orders.sql), customers
-- (profile + segmentation: daily buyer / gym / subscription / regular),
-- referrals, subscriptions, combo packs, and wallet/reward point ledgers.

-- Reusable updated_at trigger function (safe to redefine even if it already
-- exists from 0001_orders.sql).
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- igo_customers — profile + segmentation
-- ---------------------------------------------------------------------------
create table if not exists public.igo_customers (
  id text primary key,
  name text,
  email text,
  phone text unique,
  membership_tier text default 'Gold', -- Gold | Platinum | Elite
  customer_segment text default 'regular', -- daily_buyer | gym | subscription | regular
  wallet_balance numeric not null default 0,
  reward_points int not null default 0,
  referral_code text unique,
  referred_by_code text,
  notification_preferences jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists igo_customers_set_updated_at on public.igo_customers;
create trigger igo_customers_set_updated_at
  before update on public.igo_customers
  for each row execute function public.set_updated_at();

alter table public.igo_customers enable row level security;
drop policy if exists "Service role full access" on public.igo_customers;
create policy "Service role full access" on public.igo_customers
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- igo_orders — replaces the bare "orders" table from 0001_orders.sql
-- ---------------------------------------------------------------------------
create table if not exists public.igo_orders (
  id text primary key,
  order_number text not null,
  customer_id text references public.igo_customers(id),
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

drop trigger if exists igo_orders_set_updated_at on public.igo_orders;
create trigger igo_orders_set_updated_at
  before update on public.igo_orders
  for each row execute function public.set_updated_at();

alter table public.igo_orders enable row level security;
drop policy if exists "Service role full access" on public.igo_orders;
create policy "Service role full access" on public.igo_orders
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- igo_referrals — "refer the website, get a code" program
-- ---------------------------------------------------------------------------
create table if not exists public.igo_referrals (
  id text primary key,
  referral_code text not null,
  referrer_customer_id text references public.igo_customers(id),
  referred_customer_id text references public.igo_customers(id),
  status text not null default 'pending', -- pending | completed | rewarded
  reward_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists igo_referrals_set_updated_at on public.igo_referrals;
create trigger igo_referrals_set_updated_at
  before update on public.igo_referrals
  for each row execute function public.set_updated_at();

alter table public.igo_referrals enable row level security;
drop policy if exists "Service role full access" on public.igo_referrals;
create policy "Service role full access" on public.igo_referrals
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- igo_subscriptions — daily buyer / gym / family recurring plans
-- ---------------------------------------------------------------------------
create table if not exists public.igo_subscriptions (
  id text primary key,
  customer_id text references public.igo_customers(id),
  plan_id text,
  plan_title text,
  frequency text, -- Daily | Weekly | Monthly
  next_delivery_date date,
  items_summary text,
  price_per_delivery numeric,
  status text not null default 'Active', -- Active | Paused | Cancelled
  delivery_slot text,
  address_id text,
  deliveries_completed int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists igo_subscriptions_set_updated_at on public.igo_subscriptions;
create trigger igo_subscriptions_set_updated_at
  before update on public.igo_subscriptions
  for each row execute function public.set_updated_at();

alter table public.igo_subscriptions enable row level security;
drop policy if exists "Service role full access" on public.igo_subscriptions;
create policy "Service role full access" on public.igo_subscriptions
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- igo_combos — admin-manageable combo pack definitions
-- ---------------------------------------------------------------------------
create table if not exists public.igo_combos (
  id text primary key,
  title text,
  tagline text,
  badge text,
  original_price numeric,
  combo_price numeric,
  savings text,
  image text,
  items jsonb, -- [{ productId, productName, weightLabel, qty }]
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists igo_combos_set_updated_at on public.igo_combos;
create trigger igo_combos_set_updated_at
  before update on public.igo_combos
  for each row execute function public.set_updated_at();

alter table public.igo_combos enable row level security;
drop policy if exists "Service role full access" on public.igo_combos;
create policy "Service role full access" on public.igo_combos
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- igo_wallet_transactions / igo_reward_transactions — ledgers
-- ---------------------------------------------------------------------------
create table if not exists public.igo_wallet_transactions (
  id text primary key,
  customer_id text references public.igo_customers(id),
  type text not null, -- credit | debit
  amount numeric not null,
  description text,
  status text not null default 'Completed', -- Completed | Pending | Refunded
  created_at timestamptz not null default now()
);

alter table public.igo_wallet_transactions enable row level security;
drop policy if exists "Service role full access" on public.igo_wallet_transactions;
create policy "Service role full access" on public.igo_wallet_transactions
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create table if not exists public.igo_reward_transactions (
  id text primary key,
  customer_id text references public.igo_customers(id),
  type text not null, -- earned | redeemed
  points int not null,
  description text,
  created_at timestamptz not null default now()
);

alter table public.igo_reward_transactions enable row level security;
drop policy if exists "Service role full access" on public.igo_reward_transactions;
create policy "Service role full access" on public.igo_reward_transactions
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_igo_orders_customer_id on public.igo_orders(customer_id);
create index if not exists idx_igo_referrals_code on public.igo_referrals(referral_code);
create index if not exists idx_igo_subscriptions_customer_id on public.igo_subscriptions(customer_id);
create index if not exists idx_igo_wallet_tx_customer_id on public.igo_wallet_transactions(customer_id);
create index if not exists idx_igo_reward_tx_customer_id on public.igo_reward_transactions(customer_id);
