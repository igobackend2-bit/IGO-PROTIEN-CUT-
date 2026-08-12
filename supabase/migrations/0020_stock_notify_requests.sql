-- ============================================================================
-- IGO Protein Cuts — "Notify me when back in stock" requests
--
-- WHY
-- The full product detail page (ProductDetailPage.tsx) had no out-of-stock
-- handling at all — no banner, no disabled Add to Cart, no way for a
-- customer to ask to be told when an item is restocked (the quick-view
-- modal and the listing-grid cards already had a "Notify" button, but it
-- was never wired to anything real — it just flashed "Notified!" locally
-- and forgot the request). This table gives that button something real to
-- write to, and gives the website's own /admin a place to see, per product,
-- exactly which customers are waiting.
--
-- SCOPE / WHY NOT FULLY AUTOMATIC
-- Product stock status lives on the app-owned `products` table and is only
-- ever changed from the separate Flutter admin app — per this project's
-- CLAUDE.md, that table's schema/policies and the admin app itself are
-- off-limits from the website side, so this can't be a DB trigger that
-- fires the instant stock is restored. Instead: the website's own /admin
-- panel lists pending requests per product alongside that product's live
-- stock status (read from `products`, already an allowed read), and gives
-- staff a one-click mailto to actually reach out. Follows the same
-- public-insert / admin-manages pattern as igo_leads (0004) and
-- igo_batch_trace (0019).
-- ============================================================================

create table if not exists public.igo_stock_notify_requests (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null,       -- references products.id by convention, no FK (app-owned table)
  product_name   text not null,       -- snapshot at request time, so admin can read it even if the product is later renamed/removed
  customer_email text not null,
  customer_phone text,
  user_id        uuid,                -- set when the requester was signed in; null for guest requests
  notified_at    timestamptz,         -- set by admin once they've reached out
  created_at     timestamptz not null default now()
);

create index if not exists igo_stock_notify_requests_product_idx
  on public.igo_stock_notify_requests (product_id);

create index if not exists igo_stock_notify_requests_pending_idx
  on public.igo_stock_notify_requests (product_id) where notified_at is null;

alter table public.igo_stock_notify_requests enable row level security;

-- Anyone (signed in or guest) can ask to be notified — this is a simple
-- lead-capture insert, no sensitive data beyond an email/phone the customer
-- is voluntarily giving for this exact purpose.
drop policy if exists "Anyone can request a stock notification" on public.igo_stock_notify_requests;
create policy "Anyone can request a stock notification"
  on public.igo_stock_notify_requests for insert
  with check (true);

-- Only admins can see the list of who's waiting, or mark requests as handled.
-- Reuses the same igo_is_active_admin() predicate as every other website-owned table.
drop policy if exists "Admins manage stock notify requests" on public.igo_stock_notify_requests;
create policy "Admins manage stock notify requests"
  on public.igo_stock_notify_requests for select
  using (public.igo_is_active_admin());

drop policy if exists "Admins update stock notify requests" on public.igo_stock_notify_requests;
create policy "Admins update stock notify requests"
  on public.igo_stock_notify_requests for update
  using (public.igo_is_active_admin())
  with check (public.igo_is_active_admin());

drop policy if exists "Admins delete stock notify requests" on public.igo_stock_notify_requests;
create policy "Admins delete stock notify requests"
  on public.igo_stock_notify_requests for delete
  using (public.igo_is_active_admin());
