-- ============================================================================
-- Phase 14 (Subscriptions) migration
--
-- Order generation intentionally happens client-side via the existing
-- OrderService (see SubscriptionRepositoryImpl.processDueSubscriptions),
-- NOT a server cron job — the app has no backend process, so "automatic"
-- order creation can only run when the app is actually open. This is
-- checked once per session from Home. Because it goes through the same
-- OrderService.createOrder() insert used by Checkout, the existing Phase 11
-- order-notification and Phase 13 loyalty/cashback triggers fire for
-- subscription-generated orders exactly as they do for manual ones — no
-- duplicate notification or reward logic needed for that part.
-- ============================================================================

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  address_id uuid references public.addresses (id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  variant_id text,
  schedule_type text not null check (schedule_type in ('daily', 'weekly', 'monthly', 'custom')),
  weekdays int[],
  interval int not null default 1 check (interval > 0),
  next_delivery date not null,
  delivery_slot text,
  payment_method text not null default 'Cash on Delivery',
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_next_delivery_idx on public.subscriptions (next_delivery) where status = 'active';

alter table public.subscriptions enable row level security;

drop policy if exists "Users can view their own subscriptions" on public.subscriptions;
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own subscriptions" on public.subscriptions;
create policy "Users can create their own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own subscriptions" on public.subscriptions;
create policy "Users can update their own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own subscriptions" on public.subscriptions;
create policy "Users can delete their own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

create or replace function public.set_subscription_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_subscription_updated_at on public.subscriptions;
create trigger trg_subscription_updated_at
  before update on public.subscriptions
  for each row execute function public.set_subscription_updated_at();

-- ─── subscription_history ───────────────────────────────────────────────────
create table if not exists public.subscription_history (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists subscription_history_subscription_id_idx on public.subscription_history (subscription_id);

alter table public.subscription_history enable row level security;

drop policy if exists "Users can view history for their own subscriptions" on public.subscription_history;
create policy "Users can view history for their own subscriptions"
  on public.subscription_history for select
  using (exists (select 1 from public.subscriptions s where s.id = subscription_id and s.user_id = auth.uid()));

drop policy if exists "Users can log history for their own subscriptions" on public.subscription_history;
create policy "Users can log history for their own subscriptions"
  on public.subscription_history for insert
  with check (exists (select 1 from public.subscriptions s where s.id = subscription_id and s.user_id = auth.uid()));

-- ─── notifications: add a 'subscription' type ──────────────────────────────
-- Reuses the existing Phase 11 notification pipeline rather than building a
-- second one — just extends the type vocabulary and lets the app insert
-- these directly from subscription action methods (pause/resume/skip/
-- cancel/create are all client-initiated with a known outcome, unlike the
-- order/stock events that needed a server trigger to observe).
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in (
    'order_update', 'delivery_update', 'wishlist_stock_alert', 'offer',
    'coupon', 'flash_sale', 'referral_reward', 'general_announcement',
    'subscription'
  ));
