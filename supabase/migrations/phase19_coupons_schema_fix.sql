-- ============================================================================
-- Phase 19 (Admin Dashboard) — coupons schema fix
--
-- phase15_offers.sql's `create table if not exists public.coupons (id uuid
-- primary key default gen_random_uuid(), ..., created_at timestamptz ...)`
-- was a no-op against a live `coupons` table that already existed from
-- earlier ad-hoc use (its actual primary key is `code`, with no `id` or
-- `created_at` column at all) — the migration's own comment flags this
-- exact risk ("it may already exist from earlier ad-hoc use"). admin-coupons
-- (update/disable/expire/delete/listCoupons ordering) assumes both columns
-- exist, so every one of those actions fails.
--
-- Additive only: `code` remains the primary key untouched (so the existing
-- `offers.coupon_code -> coupons(code)` FK and checkout's CouponRepository
-- keep working exactly as before) — `id` is added as a second, unique
-- identifier purely for the admin API to key off.
-- ============================================================================

alter table public.coupons
  add column if not exists id uuid not null default gen_random_uuid(),
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'coupons_id_key'
  ) then
    alter table public.coupons add constraint coupons_id_key unique (id);
  end if;
end $$;
