-- ============================================================================
-- Phase 9 (Wishlist) migration
-- Run once against the Protein Cuts Supabase project. The app already
-- degrades gracefully if this hasn't run yet (wishlist reads/writes just
-- fail closed), so it's safe to apply at any time.
-- ============================================================================

-- ─── wishlist_items ─────────────────────────────────────────────────────────
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists wishlist_items_user_id_idx on public.wishlist_items (user_id);

alter table public.wishlist_items enable row level security;

drop policy if exists "Users can view their own wishlist" on public.wishlist_items;
create policy "Users can view their own wishlist"
  on public.wishlist_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add to their own wishlist" on public.wishlist_items;
create policy "Users can add to their own wishlist"
  on public.wishlist_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove from their own wishlist" on public.wishlist_items;
create policy "Users can remove from their own wishlist"
  on public.wishlist_items for delete
  using (auth.uid() = user_id);

-- ─── stock_alerts ───────────────────────────────────────────────────────────
create table if not exists public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists stock_alerts_user_id_idx on public.stock_alerts (user_id);

alter table public.stock_alerts enable row level security;

drop policy if exists "Users can view their own stock alerts" on public.stock_alerts;
create policy "Users can view their own stock alerts"
  on public.stock_alerts for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own stock alerts" on public.stock_alerts;
create policy "Users can create their own stock alerts"
  on public.stock_alerts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own stock alerts" on public.stock_alerts;
create policy "Users can remove their own stock alerts"
  on public.stock_alerts for delete
  using (auth.uid() = user_id);
