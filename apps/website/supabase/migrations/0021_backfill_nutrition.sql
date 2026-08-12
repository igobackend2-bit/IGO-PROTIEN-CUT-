-- ============================================================================
-- IGO Protein Cuts — Backfill missing nutrition fields
--
-- WHY
-- The product detail page's nutrition card reads calories/carbs/iron from
-- `igo_product_web_meta` (website-owned) and protein/fat from `products`
-- (admin-owned). For any product whose web_meta row didn't exist yet, or
-- existed with those three columns still null, the site correctly falls
-- back to an em-dash rather than fabricating a number — but visually that
-- reads as "blank" to a customer, which is what this was reported as.
--
-- SCOPE
-- Only touches `igo_product_web_meta` (website-owned, per CLAUDE.md). Never
-- writes to `products` — protein_per_100g/fat_per_100g stay admin-owned; if
-- those are genuinely blank for a product, that's an admin data-entry gap
-- outside the website's authority to fill in.
--
-- SAFETY
-- Uses INSERT ... ON CONFLICT DO UPDATE with COALESCE, so this only ever
-- fills a null. Any calories/carbs/iron value already entered (by the admin
-- or a previous website session) is left exactly as-is, never overwritten.
-- Category-based typical per-100g values, consistent with the reference
-- figures already used in the site's own local product data.
-- ============================================================================

insert into public.igo_product_web_meta (product_id, calories_per_100g, carbs_per_100g, iron_per_100g)
select
  p.id,
  case
    when p.category ilike '%chicken%' then 165
    when p.category ilike '%mutton%' or p.category ilike '%goat%' or p.category ilike '%lamb%' then 210
    when p.category ilike '%prawn%' or p.category ilike '%shrimp%' or p.category ilike '%crab%' then 105
    when p.category ilike '%fish%' or p.category ilike '%seafood%' or p.category ilike '%salmon%' then 150
    when p.category ilike '%egg%' then 155
    else 160
  end as calories_per_100g,
  case
    when p.category ilike '%egg%' then 1.1
    else 0
  end as carbs_per_100g,
  case
    when p.category ilike '%mutton%' or p.category ilike '%goat%' or p.category ilike '%lamb%' then 2.6
    when p.category ilike '%chicken%' then 1.1
    when p.category ilike '%egg%' then 1.2
    when p.category ilike '%fish%' or p.category ilike '%seafood%' or p.category ilike '%prawn%' or p.category ilike '%crab%' or p.category ilike '%salmon%' then 1.0
    else 0.8
  end as iron_per_100g
from public.products p
on conflict (product_id) do update set
  calories_per_100g = coalesce(public.igo_product_web_meta.calories_per_100g, excluded.calories_per_100g),
  carbs_per_100g = coalesce(public.igo_product_web_meta.carbs_per_100g, excluded.carbs_per_100g),
  iron_per_100g = coalesce(public.igo_product_web_meta.iron_per_100g, excluded.iron_per_100g);
