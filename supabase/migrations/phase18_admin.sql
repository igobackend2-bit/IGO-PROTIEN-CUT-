-- ============================================================================
-- Phase 18 (Admin Backend) migration
--
-- Pure backend prep for a future Admin Dashboard (Phase 19) — no UI ships
-- in this phase. Every new table here is locked down by RLS to
-- service-role/Edge-Function access only (plus one narrow self-check policy
-- so a client can cheaply ask "am I an admin?"), because the architecture
-- mandate for this phase is that Edge Functions — not direct table access
-- with permissive RLS — are the single source of truth for admin reads and
-- writes. Existing customer-facing tables and their RLS are left exactly as
-- they are; admin Edge Functions reach them via the service-role client,
-- which bypasses RLS entirely, so no admin bypass policies need adding to
-- `orders`, `products`, etc.
-- ============================================================================

-- ─── RBAC: roles, permissions, role→permission grants, admin membership ────
create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_role_permissions (
  role_id uuid not null references public.admin_roles (id) on delete cascade,
  permission_id uuid not null references public.admin_permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

-- Who is actually an admin, and which role they hold. Deliberately its own
-- table rather than a column on `profiles` — keeps admin/staff concerns out
-- of the customer Profile module entirely (that module stays untouched).
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role_id uuid not null references public.admin_roles (id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

alter table public.admin_roles enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_role_permissions enable row level security;
alter table public.admin_users enable row level security;

-- No public/authenticated policies on admin_roles / admin_permissions /
-- admin_role_permissions at all — only the service-role client (Edge
-- Functions) can read or write them. A regular authenticated user gets
-- zero rows back, which is the correct behavior.

-- The one narrow exception: a client can check its own admin membership
-- (role name, active flag) without a function round-trip, e.g. to decide
-- whether to even show an "Admin" entry point in a future dashboard shell.
drop policy if exists "Users can view their own admin membership" on public.admin_users;
create policy "Users can view their own admin membership"
  on public.admin_users for select
  using (auth.uid() = user_id);

-- ─── admin_has_permission: the one place permission resolution lives ──────
-- Used by Edge Functions (via RPC, service role) and available for any
-- future RLS policy that needs the same check — one implementation, reused
-- everywhere, exactly per the "no duplicated business logic" mandate.
-- super_admin implicitly passes every check even if a brand-new permission
-- row is added later and someone forgets to grant it explicitly.
create or replace function public.admin_has_permission(p_user_id uuid, p_permission text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.admin_users au
    join public.admin_roles r on r.id = au.role_id
    left join public.admin_role_permissions arp on arp.role_id = r.id
    left join public.admin_permissions ap on ap.id = arp.permission_id
    where au.user_id = p_user_id
      and au.is_active = true
      and (r.name = 'super_admin' or ap.code = p_permission)
  );
$$;

-- ─── Seed: roles ────────────────────────────────────────────────────────────
insert into public.admin_roles (name, description) values
  ('super_admin', 'Full, unrestricted access to every admin module, including granting other admins.'),
  ('admin', 'Full operational access; cannot grant or revoke admin roles.'),
  ('manager', 'Day-to-day store operations: products, inventory, orders, delivery, promotions, reports.'),
  ('inventory_staff', 'Stock management only.'),
  ('support_staff', 'Customer support ticket handling.'),
  ('delivery_manager', 'Delivery partner and live-delivery management.')
on conflict (name) do nothing;

-- ─── Seed: permissions ──────────────────────────────────────────────────────
insert into public.admin_permissions (code, description) values
  ('products.view', 'View product catalog data'),
  ('products.manage', 'Create/update/delete/publish products, pricing, images, categories'),
  ('inventory.view', 'View stock levels and inventory history'),
  ('inventory.manage', 'Record stock in/out/adjustments'),
  ('orders.view', 'View orders'),
  ('orders.manage', 'Accept/reject/pack/ready/cancel orders, assign delivery'),
  ('payments.manage', 'Approve/complete refunds'),
  ('delivery.view', 'View delivery assignments and live locations'),
  ('delivery.manage', 'Reassign delivery partners, trigger ETA refresh'),
  ('users.view', 'View customer directory and profiles'),
  ('roles.manage', 'Grant or revoke admin roles'),
  ('coupons.manage', 'Create/disable/expire coupons and manage offers'),
  ('reviews.moderate', 'Hide or delete product reviews'),
  ('support.manage', 'Manage support tickets, reply as agent, manage FAQs'),
  ('notifications.send', 'Send broadcast/targeted notifications'),
  ('analytics.view', 'View analytics dashboards'),
  ('reports.generate', 'Generate and export reports')
on conflict (code) do nothing;

-- ─── Seed: role → permission grants ─────────────────────────────────────────
insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id from public.admin_roles r, public.admin_permissions p where r.name = 'super_admin'
on conflict do nothing;

insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id from public.admin_roles r, public.admin_permissions p
where r.name = 'admin' and p.code <> 'roles.manage'
on conflict do nothing;

insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id from public.admin_roles r, public.admin_permissions p
where r.name = 'manager' and p.code in (
  'products.view', 'products.manage', 'inventory.view', 'inventory.manage',
  'orders.view', 'orders.manage', 'delivery.view', 'delivery.manage',
  'users.view', 'coupons.manage', 'reviews.moderate', 'notifications.send',
  'analytics.view', 'reports.generate'
)
on conflict do nothing;

insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id from public.admin_roles r, public.admin_permissions p
where r.name = 'inventory_staff' and p.code in ('products.view', 'inventory.view', 'inventory.manage')
on conflict do nothing;

insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id from public.admin_roles r, public.admin_permissions p
where r.name = 'support_staff' and p.code in ('support.manage', 'orders.view', 'users.view')
on conflict do nothing;

insert into public.admin_role_permissions (role_id, permission_id)
select r.id, p.id from public.admin_roles r, public.admin_permissions p
where r.name = 'delivery_manager' and p.code in ('delivery.view', 'delivery.manage', 'orders.view')
on conflict do nothing;

-- ─── Bootstrap: making the FIRST Super Admin ───────────────────────────────
-- There's no Admin UI yet (Phase 19), so nobody can self-assign a role.
-- Run this once, replacing the email, after this migration:
--
--   insert into public.admin_users (user_id, role_id, created_by)
--   select u.id, r.id, u.id
--   from auth.users u, public.admin_roles r
--   where u.email = 'you@example.com' and r.name = 'super_admin'
--   on conflict (user_id) do update set role_id = excluded.role_id, is_active = true;

-- ─── categories ─────────────────────────────────────────────────────────────
-- Admin-curated catalog list, additive alongside `products.category` (which
-- stays the free-text field the existing Product model normalizes into —
-- untouched). Lets a future dashboard manage display name/emoji/order
-- without needing to touch product rows or the Products module's code.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  emoji text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

insert into public.categories (name, emoji, display_order) values
  ('Chicken', '🍗', 10),
  ('Beef', '🥩', 20),
  ('Mutton', '🍖', 30),
  ('Fish', '🐟', 40),
  ('Eggs', '🥚', 50),
  ('Healthy Add-ons', '🥗', 60)
on conflict (name) do nothing;

-- ─── products: inventory columns ───────────────────────────────────────────
alter table public.products
  add column if not exists stock_quantity int not null default 0,
  add column if not exists low_stock_threshold int not null default 10;

-- ─── inventory_history ──────────────────────────────────────────────────────
-- Append-only ledger of every stock movement — `products.stock_quantity` is
-- the current, denormalized total; this table is the source of truth for
-- "how did it get there" (same ledger-plus-running-total pattern already
-- used by wallet_transactions/reward_transactions).
create table if not exists public.inventory_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  change_type text not null check (change_type in ('stock_in', 'stock_out', 'adjustment')),
  quantity_change int not null,
  resulting_stock int not null,
  reason text,
  performed_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index if not exists inventory_history_product_created_idx on public.inventory_history (product_id, created_at desc);

alter table public.inventory_history enable row level security;
-- Service-role (admin-inventory Edge Function) only — no client policies.

-- Single place a stock change is actually applied: updates the running
-- total and appends the ledger row atomically, so stock-in/stock-out/
-- adjustment in admin-inventory all funnel through one implementation
-- instead of three copies of "update then insert".
create or replace function public.apply_inventory_change(
  p_product_id uuid,
  p_change_type text,
  p_quantity_change int,
  p_reason text,
  p_performed_by uuid
)
returns public.products
language plpgsql
security definer
as $$
declare
  v_product public.products;
begin
  update public.products
    set stock_quantity = greatest(stock_quantity + p_quantity_change, 0)
    where id = p_product_id
    returning * into v_product;

  if v_product.id is null then
    raise exception 'Product not found.';
  end if;

  insert into public.inventory_history (product_id, change_type, quantity_change, resulting_stock, reason, performed_by)
  values (p_product_id, p_change_type, p_quantity_change, v_product.stock_quantity, p_reason, p_performed_by);

  return v_product;
end;
$$;

-- ─── audit_logs ──────────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users (id),
  role text,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

alter table public.audit_logs enable row level security;
-- Service-role only — every admin Edge Function writes here, nothing else
-- reads or writes it directly.

-- ─── system_settings ─────────────────────────────────────────────────────────
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

alter table public.system_settings enable row level security;
-- Service-role only.

insert into public.system_settings (key, value) values
  ('low_stock_default_threshold', '10'),
  ('store_location', '{"lat": 12.7969, "lng": 80.2467, "label": "Kanathur, Chennai"}')
on conflict (key) do nothing;

-- ─── analytics_cache ─────────────────────────────────────────────────────────
-- admin-analytics computes on demand (no cron in this project) and caches
-- the result here, so repeated dashboard loads within the cache window
-- don't re-run expensive aggregate queries.
create table if not exists public.analytics_cache (
  metric_key text primary key,
  period text not null check (period in ('daily', 'weekly', 'monthly')),
  computed_at timestamptz not null default now(),
  expires_at timestamptz not null,
  data jsonb not null
);

alter table public.analytics_cache enable row level security;
-- Service-role only.

-- ─── product_reviews: moderation ────────────────────────────────────────────
-- Additive column, default false so nothing changes for existing reviews
-- until an admin actively hides one. The public read policy is updated so
-- moderation actually takes effect for customers — required for
-- "reviews.moderate" to mean anything.
alter table public.product_reviews
  add column if not exists is_hidden boolean not null default false;

drop policy if exists "Reviews are publicly readable" on public.product_reviews;
create policy "Reviews are publicly readable"
  on public.product_reviews for select
  using (not is_hidden);

-- Owners should still be able to see + manage their own review even if an
-- admin hid it (e.g. to edit and resubmit) — the existing update/delete
-- policies already scope to auth.uid() = user_id regardless of is_hidden,
-- so nothing else needs to change there. A dedicated own-row select policy
-- covers the read side the same way.
drop policy if exists "Users can view their own hidden review" on public.product_reviews;
create policy "Users can view their own hidden review"
  on public.product_reviews for select
  using (auth.uid() = user_id);
