-- ============================================================================
-- Phase 15 (Offers/Promotions) migration
--
-- `coupons` is extended (it may already exist from earlier ad-hoc use —
-- guarded with add-column-if-not-exists like the Phase 12 lesson). `offers`
-- is new: campaign/discovery content (flash sales, festival banners,
-- featured offers) shown on Home, distinct from a user-typed coupon code.
-- An offer can optionally reference a coupon_code so "browse a flash sale"
-- and "redeem a code at checkout" share one validation path
-- (CouponRepository.validate) rather than two pricing engines.
--
-- Seeded rows below are real, functional example campaigns (the kind a
-- business would configure) — not fabricated user activity. No fake
-- reviews/orders/notifications are created by this migration.
-- ============================================================================

-- ─── coupons: extend for the new discount/condition types ─────────────────
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null default 'flat' check (discount_type in ('flat', 'percent', 'free_delivery', 'cashback')),
  discount_value numeric not null default 0,
  min_order_value numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.coupons
  add column if not exists expires_at timestamptz,
  add column if not exists usage_limit int,
  add column if not exists one_time_use boolean not null default false,
  add column if not exists first_order_only boolean not null default false,
  add column if not exists product_id uuid references public.products (id) on delete set null,
  add column if not exists category text,
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- discount_type check may predate 'cashback' — recreate to be sure.
alter table public.coupons drop constraint if exists coupons_discount_type_check;
alter table public.coupons add constraint coupons_discount_type_check
  check (discount_type in ('flat', 'percent', 'free_delivery', 'cashback'));

alter table public.coupons enable row level security;

drop policy if exists "Coupons are publicly readable" on public.coupons;
create policy "Coupons are publicly readable"
  on public.coupons for select
  using (true);

-- ─── offers ─────────────────────────────────────────────────────────────────
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('flash_sale', 'festival', 'featured')),
  title text not null,
  description text,
  discount_type text not null check (discount_type in ('flat', 'percent', 'free_delivery', 'cashback')),
  discount_value numeric not null default 0,
  start_date timestamptz not null,
  end_date timestamptz not null,
  priority int not null default 0,
  active boolean not null default true,
  banner_image_url text,
  coupon_code text references public.coupons (code) on delete set null,
  min_order_value numeric,
  product_id uuid references public.products (id) on delete set null,
  category text,
  total_quantity int,
  remaining_quantity int,
  created_at timestamptz not null default now()
);

create index if not exists offers_active_window_idx on public.offers (active, start_date, end_date);

alter table public.offers enable row level security;

drop policy if exists "Offers are publicly readable" on public.offers;
create policy "Offers are publicly readable"
  on public.offers for select
  using (true);

-- ─── combo_packs / combo_pack_items ─────────────────────────────────────────
create table if not exists public.combo_packs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  discount numeric not null default 0,
  bundle_type text not null default 'fixed' check (bundle_type in ('fixed', 'mix_match')),
  pick_count int,
  banner_image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.combo_packs enable row level security;

drop policy if exists "Combo packs are publicly readable" on public.combo_packs;
create policy "Combo packs are publicly readable"
  on public.combo_packs for select
  using (true);

create table if not exists public.combo_pack_items (
  id uuid primary key default gen_random_uuid(),
  combo_pack_id uuid not null references public.combo_packs (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity int not null default 1
);

create index if not exists combo_pack_items_combo_pack_id_idx on public.combo_pack_items (combo_pack_id);

alter table public.combo_pack_items enable row level security;

drop policy if exists "Combo pack items are publicly readable" on public.combo_pack_items;
create policy "Combo pack items are publicly readable"
  on public.combo_pack_items for select
  using (true);

-- ─── Flash sale stock: decrement + auto-expire on order ────────────────────
-- Reuses the existing orders.coupon_code column (no new order-side schema)
-- to link a placed order back to the flash-sale offer it redeemed.
create or replace function public.decrement_flash_sale_stock()
returns trigger as $$
declare
  v_offer record;
begin
  if new.coupon_code is null then
    return new;
  end if;
  select * into v_offer from public.offers
    where coupon_code = new.coupon_code and type = 'flash_sale' and active = true
    limit 1;
  if v_offer.id is null or v_offer.remaining_quantity is null then
    return new;
  end if;
  update public.offers
    set remaining_quantity = greatest(remaining_quantity - 1, 0),
        active = (remaining_quantity - 1) > 0
    where id = v_offer.id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_decrement_flash_sale_stock on public.orders;
create trigger trg_decrement_flash_sale_stock
  after insert on public.orders
  for each row execute function public.decrement_flash_sale_stock();

-- ─── Extra cashback-type coupon credit on delivery ─────────────────────────
-- Extends the existing Phase 13 loyalty-on-delivery flow rather than
-- duplicating it: if the delivered order redeemed a cashback-type coupon,
-- credit that amount to the wallet on top of the standard 2% cashback.
create or replace function public.award_coupon_cashback_on_delivery()
returns trigger as $$
declare
  v_coupon record;
  v_amount numeric;
begin
  if new.status <> 'Delivered' or old.status is not distinct from 'Delivered' or new.coupon_code is null then
    return new;
  end if;
  select * into v_coupon from public.coupons where code = new.coupon_code and discount_type = 'cashback';
  if v_coupon.id is null then
    return new;
  end if;
  v_amount := case
    when v_coupon.discount_value <= 100 then round(new.total_price * (v_coupon.discount_value / 100), 2)
    else v_coupon.discount_value
  end;
  if v_amount > 0 then
    insert into public.wallet_transactions (user_id, type, amount, status, description)
    values (new.user_id, 'cashback', v_amount, 'credited', 'Cashback from coupon ' || new.coupon_code);
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_award_coupon_cashback on public.orders;
create trigger trg_award_coupon_cashback
  after update on public.orders
  for each row execute function public.award_coupon_cashback_on_delivery();

-- ─── Seed: real, functional example campaigns ──────────────────────────────
insert into public.coupons (code, description, discount_type, discount_value, min_order_value, is_active)
values ('FLASH24', 'Flash Sale — 25% off, today only', 'percent', 25, 0, true)
on conflict (code) do nothing;

insert into public.offers (type, title, description, discount_type, discount_value, start_date, end_date, priority, active, coupon_code, total_quantity, remaining_quantity)
select 'flash_sale', '⚡ Flash Sale', 'Flat 25% off — limited stock, today only', 'percent', 25,
       now(), now() + interval '1 day', 100, true, 'FLASH24', 50, 50
where not exists (select 1 from public.offers where type = 'flash_sale' and active = true);

insert into public.offers (type, title, description, discount_type, discount_value, start_date, end_date, priority, active, banner_image_url)
select 'festival', 'New Year Sale 🎉', 'Ring in the new year with fresh cuts on us', 'percent', 15,
       now(), now() + interval '14 days', 50, true, null
where not exists (select 1 from public.offers where type = 'festival' and title = 'New Year Sale 🎉');
