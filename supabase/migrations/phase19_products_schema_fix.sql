-- ============================================================================
-- Phase 19 (Admin Dashboard) — products schema fix
--
-- The Phase 18 admin-products Edge Function (PRODUCT_FIELDS, and `list`'s
-- `.order("created_at", ...)`) assumes `products` has weight,
-- protein_per_100g, fat_per_100g, storage_instruction, and created_at
-- columns. No migration ever actually added them — the customer app's
-- Product model already defends against their absence with fallback
-- defaults (lib/models/product_model.dart), which is why this went
-- unnoticed there, but it makes admin-products `list` fail outright
-- (`column products.created_at does not exist`), breaking the admin
-- dashboard's Products screen and dashboard product count.
--
-- Purely additive: nullable/defaulted columns, no data loss, no change to
-- any existing row's other columns, safe for the live customer app.
-- ============================================================================

alter table public.products
  add column if not exists weight text not null default '500g',
  add column if not exists protein_per_100g numeric,
  add column if not exists fat_per_100g numeric,
  add column if not exists storage_instruction text,
  add column if not exists created_at timestamptz not null default now();
