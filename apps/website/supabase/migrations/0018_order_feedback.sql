-- ============================================================================
-- IGO Protein Cuts — Delivery/order feedback table (website-owned, NEW table)
--
-- WHY
-- The customer asked for a post-delivery feedback form covering the whole
-- experience "from product to delivery" — not just the product itself.
-- Product-level feedback already has a home: `product_reviews` (app-owned,
-- moderated in /admin → Reviews, see 0017_review_moderation_policies.sql).
-- There is no existing table anywhere for the delivery/order-experience half
-- (packaging, delivery time, driver, etc.), so rather than guess at columns
-- on an app-owned table I don't control, this creates a brand-new igo_*
-- table for it — same pattern as igo_leads / igo_site_content, fully within
-- this website's own namespace, zero risk to any app/admin table.
--
-- SCOPE
--   • Brand-new table. No ALTER TABLE on anything else, no new column on any
--     pre-existing table (orders, product_reviews, etc.).
--   • `order_id` is stored as a plain uuid with NO foreign key into `orders`
--     — deliberately avoids even a read-only coupling to the app's table
--     definition. Ownership is enforced by RLS (`user_id = auth.uid()`) and
--     the website only ever writes an order_id it already fetched for that
--     same signed-in user via fetchMyOrders()/fetchOrder().
--   • Reuses `public.igo_is_active_admin()` from 0008_website_admin_policies.sql
--     — the one canonical "is an admin" check, not a new one.
--
-- WHAT THE FLUTTER TEAM NEEDS TO KNOW (per user's request to loop them in):
-- This table lives in the same shared Supabase project as every app table,
-- so their admin dashboard can query `igo_order_feedback` directly with any
-- Supabase client (same technique as reading any other table) if they want
-- a screen for it — no changes needed on their side for the data to exist,
-- only if they want to *display* it in their own admin UI. Columns:
--   id               uuid
--   order_id         uuid   (matches orders.id)
--   user_id          uuid   (matches auth.users.id / profiles.id)
--   delivery_rating  smallint, 1-5
--   comment          text, nullable
--   status           text, 'new' | 'reviewed'
--   created_at       timestamptz
-- ============================================================================

create table if not exists public.igo_order_feedback (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  delivery_rating smallint not null check (delivery_rating between 1 and 5),
  comment text,
  status text not null default 'new' check (status in ('new', 'reviewed')),
  created_at timestamptz not null default now(),
  unique (order_id, user_id)
);

alter table public.igo_order_feedback enable row level security;

-- Customers can submit and view their own feedback (also used to hide the
-- "Rate Your Order" prompt once they've already submitted for that order).
drop policy if exists "Customers insert own order feedback" on public.igo_order_feedback;
create policy "Customers insert own order feedback"
  on public.igo_order_feedback for insert
  with check (auth.uid() = user_id);

drop policy if exists "Customers view own order feedback" on public.igo_order_feedback;
create policy "Customers view own order feedback"
  on public.igo_order_feedback for select
  using (auth.uid() = user_id);

-- Admins (website admin dashboard, and the Flutter admin if they add a
-- screen for it — both check the same igo_is_active_admin()) can view and
-- mark feedback as reviewed.
drop policy if exists "Admins view all order feedback" on public.igo_order_feedback;
create policy "Admins view all order feedback"
  on public.igo_order_feedback for select
  using (public.igo_is_active_admin());

drop policy if exists "Admins update order feedback" on public.igo_order_feedback;
create policy "Admins update order feedback"
  on public.igo_order_feedback for update
  using (public.igo_is_active_admin())
  with check (public.igo_is_active_admin());

-- ============================================================================
-- VERIFY
-- ============================================================================
--   select column_name, data_type from information_schema.columns
--   where table_schema = 'public' and table_name = 'igo_order_feedback'
--   order by ordinal_position;
--
--   select policyname, cmd from pg_policies
--   where schemaname = 'public' and tablename = 'igo_order_feedback'
--   order by policyname;
-- ============================================================================
