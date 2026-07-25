-- ============================================================================
-- Phase 12 (Reviews) migration — corrected
-- `product_reviews` already existed on the backend (created earlier via the
-- Supabase table editor) with: id bigint, product_id uuid, user_id uuid,
-- user_name text, rating int, comment text, created_at timestamptz. This
-- extends that real table rather than assuming a fresh uuid-keyed one.
-- ============================================================================

alter table public.product_reviews
  add column if not exists order_id uuid references public.orders (id) on delete set null,
  add column if not exists title text,
  add column if not exists photos text[] not null default array[]::text[],
  add column if not exists verified_purchase boolean not null default false,
  add column if not exists helpful_count int not null default 0,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists product_reviews_product_id_idx on public.product_reviews (product_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'product_reviews_product_id_user_id_key'
  ) then
    alter table public.product_reviews add constraint product_reviews_product_id_user_id_key unique (product_id, user_id);
  end if;
end $$;

alter table public.product_reviews enable row level security;

drop policy if exists "Reviews are publicly readable" on public.product_reviews;
create policy "Reviews are publicly readable"
  on public.product_reviews for select
  using (true);

drop policy if exists "Users can write their own review" on public.product_reviews;
create policy "Users can write their own review"
  on public.product_reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own review" on public.product_reviews;
create policy "Users can update their own review"
  on public.product_reviews for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own review" on public.product_reviews;
create policy "Users can delete their own review"
  on public.product_reviews for delete
  using (auth.uid() = user_id);

-- Server-side enforcement of "only verified purchasers can review" — the
-- app also gates the Write Review entry point client-side, but this is
-- what actually guarantees it (and why verified_purchase can be trusted to
-- always be true for any row that exists).
create or replace function public.enforce_verified_purchase_review()
returns trigger as $$
begin
  if new.order_id is null or not exists (
    select 1 from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.id = new.order_id
      and o.user_id = new.user_id
      and oi.product_id = new.product_id
  ) then
    raise exception 'You can only review products you have purchased.';
  end if;
  new.verified_purchase := true;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_enforce_verified_purchase_review on public.product_reviews;
create trigger trg_enforce_verified_purchase_review
  before insert on public.product_reviews
  for each row execute function public.enforce_verified_purchase_review();

create or replace function public.set_review_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  -- Ownership/provenance fields are immutable after the fact.
  new.user_id := old.user_id;
  new.product_id := old.product_id;
  new.order_id := old.order_id;
  new.verified_purchase := old.verified_purchase;
  new.helpful_count := old.helpful_count;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_review_updated_at on public.product_reviews;
create trigger trg_review_updated_at
  before update on public.product_reviews
  for each row execute function public.set_review_updated_at();

-- ─── review_helpful ─────────────────────────────────────────────────────────
-- review_id is bigint to match product_reviews.id's real type.
create table if not exists public.review_helpful (
  id uuid primary key default gen_random_uuid(),
  review_id bigint not null references public.product_reviews (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (review_id, user_id)
);

alter table public.review_helpful enable row level security;

drop policy if exists "Helpful votes are publicly readable" on public.review_helpful;
create policy "Helpful votes are publicly readable"
  on public.review_helpful for select
  using (true);

drop policy if exists "Users can mark a review helpful" on public.review_helpful;
create policy "Users can mark a review helpful"
  on public.review_helpful for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their helpful vote" on public.review_helpful;
create policy "Users can remove their helpful vote"
  on public.review_helpful for delete
  using (auth.uid() = user_id);

create or replace function public.adjust_review_helpful_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.product_reviews set helpful_count = helpful_count + 1 where id = new.review_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.product_reviews set helpful_count = greatest(helpful_count - 1, 0) where id = old.review_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_review_helpful_insert on public.review_helpful;
create trigger trg_review_helpful_insert
  after insert on public.review_helpful
  for each row execute function public.adjust_review_helpful_count();

drop trigger if exists trg_review_helpful_delete on public.review_helpful;
create trigger trg_review_helpful_delete
  after delete on public.review_helpful
  for each row execute function public.adjust_review_helpful_count();

-- ─── review_replies ─────────────────────────────────────────────────────────
-- Read-only for customers by design — no INSERT policy for regular users.
-- There's no admin panel yet, so seller replies are added directly in
-- Supabase (or a future edge function/admin tool) rather than fabricated.
create table if not exists public.review_replies (
  id uuid primary key default gen_random_uuid(),
  review_id bigint not null references public.product_reviews (id) on delete cascade,
  reply text not null,
  replied_by text not null default 'Protein Cuts Team',
  created_at timestamptz not null default now()
);

alter table public.review_replies enable row level security;

drop policy if exists "Replies are publicly readable" on public.review_replies;
create policy "Replies are publicly readable"
  on public.review_replies for select
  using (true);

-- ─── review-photos storage ──────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

drop policy if exists "Review photos are publicly readable" on storage.objects;
create policy "Review photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'review-photos');

drop policy if exists "Users can upload their own review photos" on storage.objects;
create policy "Users can upload their own review photos"
  on storage.objects for insert
  with check (bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their own review photos" on storage.objects;
create policy "Users can update their own review photos"
  on storage.objects for update
  using (bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own review photos" on storage.objects;
create policy "Users can delete their own review photos"
  on storage.objects for delete
  using (bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text);
