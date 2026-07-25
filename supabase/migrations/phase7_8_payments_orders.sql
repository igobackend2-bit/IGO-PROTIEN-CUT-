-- ============================================================================
-- Phase 7 (Payment Extensions) + Phase 8 (Order Management) migration
-- Run this once against the Protein Cuts Supabase project.
-- All app code already degrades gracefully if this hasn't been run yet
-- (falls back to baseline order shape, no payment history, etc.), so it is
-- safe to apply at any time without a deploy-order dependency.
-- ============================================================================

-- ─── payments ───────────────────────────────────────────────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  transaction_id text,
  amount numeric not null,
  payment_method text not null,
  status text not null default 'Pending'
    check (status in ('Pending', 'Processing', 'Success', 'Failed', 'Cancelled', 'Refunded')),
  gateway_reference text,
  refund_status text check (refund_status in ('Requested', 'Completed')),
  refund_reason text,
  refund_amount numeric,
  refund_requested_at timestamptz,
  refund_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_order_id_idx on public.payments (order_id);
create index if not exists payments_user_id_idx on public.payments (user_id);

alter table public.payments enable row level security;

drop policy if exists "Users can view their own payments" on public.payments;
create policy "Users can view their own payments"
  on public.payments for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own payments" on public.payments;
create policy "Users can insert their own payments"
  on public.payments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own payments" on public.payments;
create policy "Users can update their own payments"
  on public.payments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- keep updated_at current on every row change
create or replace function public.set_payments_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_payments_updated_at();

-- ─── order_ratings ──────────────────────────────────────────────────────────
create table if not exists public.order_ratings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (order_id, user_id)
);

alter table public.order_ratings enable row level security;

drop policy if exists "Users can view their own ratings" on public.order_ratings;
create policy "Users can view their own ratings"
  on public.order_ratings for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own ratings" on public.order_ratings;
create policy "Users can insert their own ratings"
  on public.order_ratings for insert
  with check (auth.uid() = user_id);

-- ─── delivery_partners ──────────────────────────────────────────────────────
create table if not exists public.delivery_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  vehicle_number text,
  rating numeric default 5.0,
  created_at timestamptz not null default now()
);

alter table public.delivery_partners enable row level security;

drop policy if exists "Delivery partners are publicly readable" on public.delivery_partners;
create policy "Delivery partners are publicly readable"
  on public.delivery_partners for select
  using (true);

-- ─── orders: new optional columns ──────────────────────────────────────────
alter table public.orders
  add column if not exists delivery_partner_id uuid references public.delivery_partners (id),
  add column if not exists delivery_otp text,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancel_reason text;

-- ─── order_items: missing product_id foreign key ───────────────────────────
-- Without this, PostgREST can't resolve the nested `products (...)` embed
-- inside `order_items` (error PGRST200), so every order query — My Orders,
-- Order Detail, Tracking, Realtime — silently returns no items/orders.
-- cart_items.product_id already has this FK (that's why Cart embeds work);
-- order_items never got one.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'order_items_product_id_fkey'
  ) then
    alter table public.order_items
      add constraint order_items_product_id_fkey
      foreign key (product_id) references public.products (id);
  end if;
end $$;

-- ─── Realtime ───────────────────────────────────────────────────────────────
-- Enables live order tracking (OrderTrackingScreen / orderStreamProvider).
-- Safe to re-run: guarded against "already a member" errors.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;
