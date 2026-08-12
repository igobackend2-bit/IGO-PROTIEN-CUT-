-- ============================================================================
-- IGO Protein Cuts — Real batch traceability
--
-- WHY
-- The homepage "Trace Your Pack's Journey" lookup (TraceabilitySection.tsx)
-- previously returned the exact same hardcoded "Verified" result for ANY
-- batch ID typed in, including nonsense input. That's not a missing feature,
-- it's an actively misleading one — a customer testing it with a made-up code
-- would still see "Verified ✓". This migration adds a real, website-owned
-- table so the lookup can return true results, or an honest "not found".
--
-- SCOPE
-- New table only (igo_batch_trace). No existing app table (products, orders,
-- etc.) is touched. Follows the same admin-write pattern as igo_leads /
-- igo_site_content from 0004 and 0008 — public can read, only an active row
-- in `admin_users` can write.
-- ============================================================================

create table if not exists public.igo_batch_trace (
  id            uuid primary key default gen_random_uuid(),
  batch_id      text not null unique,          -- e.g. IGO-9421, matched case-insensitively by the app
  product_name  text,                          -- e.g. "Country Chicken (Naattu Kozhi)"
  farm_name     text not null,
  farm_location text not null,
  cut_date      date not null default current_date,
  handler       text not null,                 -- e.g. "Certified Butcher #IGO-041"
  temp_log      text not null,                 -- e.g. "2.1°C - 3.4°C (within 0-4°C range, zero breaks)"
  created_at    timestamptz not null default now()
);

create index if not exists igo_batch_trace_batch_id_idx
  on public.igo_batch_trace (upper(batch_id));

alter table public.igo_batch_trace enable row level security;

-- Anyone can look up a batch — this is the whole point of the feature, and
-- none of these columns are sensitive (no customer/order data).
drop policy if exists "Batch trace is publicly readable" on public.igo_batch_trace;
create policy "Batch trace is publicly readable"
  on public.igo_batch_trace for select using (true);

-- Reuses the same igo_is_active_admin() predicate created in 0008 — one
-- definition of "is an admin" across every website-owned table.
drop policy if exists "Admins manage batch trace" on public.igo_batch_trace;
create policy "Admins manage batch trace"
  on public.igo_batch_trace for all
  using (public.igo_is_active_admin())
  with check (public.igo_is_active_admin());

-- A handful of real-looking sample batches so the page has something to
-- demonstrate immediately. Safe to delete/replace from the admin panel —
-- these are clearly not tied to any real order.
insert into public.igo_batch_trace (batch_id, product_name, farm_name, farm_location, cut_date, handler, temp_log)
values
  ('IGO-9421', 'Country Chicken (Naattu Kozhi)', 'High Meadows Heritage Farm', 'Nilgiris Range, Tamil Nadu', current_date, 'Certified Butcher #IGO-041', '2.1°C - 3.4°C (within 0-4°C range, zero breaks)'),
  ('IGO-9422', 'Premium Goat Mutton - Curry Cut', 'Valasai Heritage Farm', 'Nilgiris Range, Tamil Nadu', current_date, 'Certified Butcher #IGO-018', '1.8°C - 3.1°C (within 0-4°C range, zero breaks)')
on conflict (batch_id) do nothing;
