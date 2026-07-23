-- ============================================================================
-- Phase 10 (Profile) migration
-- Run once against the Protein Cuts Supabase project. Extends the existing
-- `profiles` table only — no new tables, per the "avoid unnecessary tables"
-- brief. Wallet/Referral/Rewards intentionally have no history tables since
-- there's no real transaction/referral backend yet; those screens show
-- honest empty states rather than fabricated data.
-- ============================================================================

alter table public.profiles
  add column if not exists profile_image_url text,
  add column if not exists date_of_birth date,
  add column if not exists gender text,
  add column if not exists notify_order_updates boolean not null default true,
  add column if not exists notify_promotions boolean not null default true,
  add column if not exists notify_offers boolean not null default true,
  add column if not exists notify_stock_alerts boolean not null default true,
  add column if not exists wallet_balance numeric not null default 0;

-- ─── Avatar storage ─────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Users may only write inside a folder named after their own uid
-- (path convention: <user_id>/avatar.<ext>), avatars are publicly readable.
drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
