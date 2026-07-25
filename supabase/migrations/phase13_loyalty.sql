-- ============================================================================
-- Phase 13 (Loyalty) migration
-- Reward points, cashback, achievements and referral bonuses are all
-- awarded by real server-side triggers off real events (order delivered,
-- review written, referral's first order) — nothing here fabricates
-- activity. Membership tier and "current points" are computed from the
-- real reward_transactions ledger rather than stored/duplicated.
-- ============================================================================

-- ─── profiles: referral linkage ─────────────────────────────────────────────
alter table public.profiles
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references public.profiles (id);

-- Backfill + default a stable referral code per user (same 8-char scheme
-- already shown to users since Phase 10, now actually stored so it can be
-- looked up at signup time).
update public.profiles
set referral_code = 'PC' || upper(left(replace(id::text, '-', ''), 8))
where referral_code is null;

create unique index if not exists profiles_referral_code_key on public.profiles (referral_code);

create or replace function public.set_default_referral_code()
returns trigger as $$
begin
  if new.referral_code is null then
    new.referral_code := 'PC' || upper(left(replace(new.id::text, '-', ''), 8));
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_default_referral_code on public.profiles;
create trigger trg_set_default_referral_code
  before insert on public.profiles
  for each row execute function public.set_default_referral_code();

-- Safe lookup for signup — resolves a referral code to a user id without
-- exposing any other profile data via a broad SELECT policy.
create or replace function public.resolve_referral_code(code text)
returns uuid
language sql
security definer
stable
as $$
  select id from public.profiles where referral_code = upper(trim(code));
$$;

-- ─── reward_transactions ────────────────────────────────────────────────────
create table if not exists public.reward_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('order', 'referral', 'promotion', 'bonus')),
  points integer not null,
  description text,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists reward_transactions_user_id_idx on public.reward_transactions (user_id);

alter table public.reward_transactions enable row level security;

drop policy if exists "Users can view their own reward transactions" on public.reward_transactions;
create policy "Users can view their own reward transactions"
  on public.reward_transactions for select
  using (auth.uid() = user_id);

-- ─── wallet_transactions ─────────────────────────────────────────────────────
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('cashback', 'reward_credit', 'referral_bonus', 'debit', 'other')),
  amount numeric not null,
  status text not null default 'credited' check (status in ('pending', 'credited')),
  description text,
  created_at timestamptz not null default now()
);

create index if not exists wallet_transactions_user_id_idx on public.wallet_transactions (user_id);

alter table public.wallet_transactions enable row level security;

drop policy if exists "Users can view their own wallet transactions" on public.wallet_transactions;
create policy "Users can view their own wallet transactions"
  on public.wallet_transactions for select
  using (auth.uid() = user_id);

-- ─── achievements (catalog) + user_achievements (unlocked) ────────────────
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text not null,
  icon text not null default 'star'
);

alter table public.achievements enable row level security;

drop policy if exists "Achievements are publicly readable" on public.achievements;
create policy "Achievements are publicly readable"
  on public.achievements for select
  using (true);

insert into public.achievements (code, title, description, icon)
values
  ('first_order', 'First Order', 'Placed your first order with us', 'shopping_bag'),
  ('five_orders', '5 Orders', 'Completed 5 delivered orders', 'local_shipping'),
  ('ten_orders', '10 Orders', 'Completed 10 delivered orders', 'military_tech'),
  ('first_review', 'First Review', 'Wrote your first product review', 'rate_review'),
  ('top_reviewer', 'Top Reviewer', 'Wrote 5 product reviews', 'star'),
  ('referral_champion', 'Referral Champion', 'Successfully referred 3 friends', 'groups')
on conflict (code) do nothing;

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

drop policy if exists "Users can view their own achievements" on public.user_achievements;
create policy "Users can view their own achievements"
  on public.user_achievements for select
  using (auth.uid() = user_id);

-- Awards an achievement exactly once, no-op if already unlocked.
create or replace function public.unlock_achievement(p_user_id uuid, p_code text)
returns void
language plpgsql
security definer
as $$
declare
  v_achievement_id uuid;
begin
  select id into v_achievement_id from public.achievements where code = p_code;
  if v_achievement_id is null then
    return;
  end if;
  insert into public.user_achievements (user_id, achievement_id)
  values (p_user_id, v_achievement_id)
  on conflict (user_id, achievement_id) do nothing;
end;
$$;

-- ─── Award points/cashback/achievements when an order is delivered ────────
create or replace function public.award_loyalty_on_delivery()
returns trigger as $$
declare
  v_points integer;
  v_cashback numeric;
  v_short_id text;
  v_delivered_count integer;
  v_referrer_id uuid;
  v_referrer_prior_orders integer;
  v_referral_count integer;
begin
  if new.status <> 'Delivered' or old.status is not distinct from 'Delivered' then
    return new;
  end if;

  v_short_id := upper(left(replace(new.id::text, '-', ''), 8));
  v_points := greatest(floor(new.total_price / 10)::integer, 1);
  v_cashback := round(new.total_price * 0.02, 2);

  insert into public.reward_transactions (user_id, type, points, description, expires_at)
  values (new.user_id, 'order', v_points, 'Earned from order #' || v_short_id, now() + interval '1 year');

  insert into public.wallet_transactions (user_id, type, amount, status, description)
  values (new.user_id, 'cashback', v_cashback, 'credited', 'Cashback from order #' || v_short_id);

  -- Order-count achievements.
  select count(*) into v_delivered_count from public.orders where user_id = new.user_id and status = 'Delivered';
  if v_delivered_count >= 1 then perform public.unlock_achievement(new.user_id, 'first_order'); end if;
  if v_delivered_count >= 5 then perform public.unlock_achievement(new.user_id, 'five_orders'); end if;
  if v_delivered_count >= 10 then perform public.unlock_achievement(new.user_id, 'ten_orders'); end if;

  -- Referral bonus: if this user was referred and this is their FIRST
  -- delivered order, reward whoever referred them.
  if v_delivered_count = 1 then
    select referred_by into v_referrer_id from public.profiles where id = new.user_id;
    if v_referrer_id is not null then
      insert into public.reward_transactions (user_id, type, points, description, expires_at)
      values (v_referrer_id, 'referral', 100, 'Referral bonus — your friend placed their first order', now() + interval '1 year');

      insert into public.wallet_transactions (user_id, type, amount, status, description)
      values (v_referrer_id, 'referral_bonus', 50, 'credited', 'Referral bonus — your friend placed their first order');

      select count(*) into v_referral_count from public.reward_transactions where user_id = v_referrer_id and type = 'referral';
      if v_referral_count >= 3 then perform public.unlock_achievement(v_referrer_id, 'referral_champion'); end if;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_award_loyalty_on_delivery on public.orders;
create trigger trg_award_loyalty_on_delivery
  after update on public.orders
  for each row execute function public.award_loyalty_on_delivery();

-- ─── Review-count achievements ──────────────────────────────────────────────
create or replace function public.award_loyalty_on_review()
returns trigger as $$
declare
  v_review_count integer;
begin
  select count(*) into v_review_count from public.product_reviews where user_id = new.user_id;
  if v_review_count >= 1 then perform public.unlock_achievement(new.user_id, 'first_review'); end if;
  if v_review_count >= 5 then perform public.unlock_achievement(new.user_id, 'top_reviewer'); end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_award_loyalty_on_review on public.product_reviews;
create trigger trg_award_loyalty_on_review
  after insert on public.product_reviews
  for each row execute function public.award_loyalty_on_review();
