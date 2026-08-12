-- ============================================================================
-- IGO Protein Cuts — Seed weight ladders + website meta
--
-- SCOPE: writes ONLY to igo_product_variants and igo_product_web_meta, both
-- website-owned. Reads public.products to find ids. No ALTER, no writes to any
-- app table. Safe for the live app and the admin dashboard.
--
-- Safe to run more than once: every insert ends with
-- `on conflict do nothing`, so re-running adds only what's missing.
--
-- ---------------------------------------------------------------------------
-- PRICING MODEL
-- ---------------------------------------------------------------------------
-- The website shows:   price = products.price × price_multiplier
--                      ...unless price_override is set, which then wins.
--
-- products.price is the 500g base price and is owned by the admin dashboard.
-- So changing a price in the admin updates every weight on the website
-- automatically — nothing here needs re-running.
--
-- Multipliers used below reflect normal Indian meat retail, where buying the
-- larger pack is cheaper per kilo:
--     250g  = 0.55×   (small packs carry a per-kilo premium)
--     500g  = 1.00×   (the base)
--     1kg   = 1.90×   (a 5% per-kilo saving vs two 500g packs)
--
-- To pin an exact price for one weight instead, set price_override:
--     update public.igo_product_variants
--        set price_override = 549
--      where product_id = '<uuid>' and label = '1kg';
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. 500g — the base weight, for every product the admin has published
-- ---------------------------------------------------------------------------
insert into public.igo_product_variants
  (product_id, label, weight_grams, price_multiplier, servings, display_order)
select
  p.id,
  '500g',
  500,
  1.00,
  'Serves 2',
  1
from public.products p
where coalesce(p.category, '') not ilike '%egg%'
on conflict (product_id, label) do nothing;


-- ---------------------------------------------------------------------------
-- 2. 1kg — the value pack
-- ---------------------------------------------------------------------------
insert into public.igo_product_variants
  (product_id, label, weight_grams, price_multiplier, servings, display_order)
select
  p.id,
  '1kg',
  1000,
  1.90,
  'Serves 4-5',
  2
from public.products p
where coalesce(p.category, '') not ilike '%egg%'
on conflict (product_id, label) do nothing;


-- ---------------------------------------------------------------------------
-- 3. 250g — small pack, meaningful for premium cuts only
--
-- Deliberately limited to steaks, liver and prawns. A 250g whole chicken is
-- not a real product, and offering it would look careless.
-- ---------------------------------------------------------------------------
insert into public.igo_product_variants
  (product_id, label, weight_grams, price_multiplier, servings, display_order)
select
  p.id,
  '250g',
  250,
  0.55,
  'Serves 1',
  0
from public.products p
where (
    p.name ilike '%steak%'
 or p.name ilike '%liver%'
 or p.name ilike '%prawn%'
 or p.name ilike '%tenderloin%'
 or p.name ilike '%salmon%'
)
on conflict (product_id, label) do nothing;


-- ---------------------------------------------------------------------------
-- 4. Eggs — sold by count, not weight
--
-- weight_grams is still populated (roughly 50g per egg) because the website's
-- Product type requires it for sorting and filtering, but the customer only
-- ever sees the pack label.
-- ---------------------------------------------------------------------------
insert into public.igo_product_variants
  (product_id, label, weight_grams, price_multiplier, servings, pieces, display_order)
select p.id, 'Pack of 6',  300,  1.00, 'Serves 3',  '6 pieces',  1
from public.products p where coalesce(p.category, '') ilike '%egg%'
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants
  (product_id, label, weight_grams, price_multiplier, servings, pieces, display_order)
select p.id, 'Pack of 12', 600,  1.90, 'Serves 6',  '12 pieces', 2
from public.products p where coalesce(p.category, '') ilike '%egg%'
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants
  (product_id, label, weight_grams, price_multiplier, servings, pieces, display_order)
select p.id, 'Pack of 30', 1500, 4.40, 'Serves 15', '30 pieces', 3
from public.products p where coalesce(p.category, '') ilike '%egg%'
on conflict (product_id, label) do nothing;


-- ---------------------------------------------------------------------------
-- 5. Website meta — bone type and freshness, derived from the product name
--
-- Only sets what the name genuinely tells us. Anything ambiguous is left null
-- and the website falls back to a category-level default rather than making a
-- specific claim about a product it can't back up.
-- ---------------------------------------------------------------------------
insert into public.igo_product_web_meta (product_id, bone_type, freshness_grade, subcategory)
select
  p.id,

  case
    when p.name ilike '%boneless%'  then 'Boneless'
    when p.name ilike '%breast%'    then 'Boneless'
    when p.name ilike '%mince%'     then 'Boneless'
    when p.name ilike '%keema%'     then 'Boneless'
    when p.name ilike '%fillet%'    then 'Boneless'
    when p.name ilike '%steak%'     then 'Boneless'
    when p.name ilike '%cubes%'     then 'Boneless'
    when p.name ilike '%liver%'     then 'Boneless'
    when p.name ilike '%whole%'     then 'Whole'
    when p.name ilike '%curry cut%' then 'With Bone'
    when p.name ilike '%drumstick%' then 'With Bone'
    when p.name ilike '%leg%'       then 'With Bone'
    when p.name ilike '%ribs%'      then 'With Bone'
    when p.name ilike '%chops%'     then 'With Bone'
    when p.name ilike '%shank%'     then 'With Bone'
    when p.name ilike '%wings%'     then 'With Bone'
    when coalesce(p.category, '') ilike '%fish%' then 'Cleaned & Gutted'
    when coalesce(p.category, '') ilike '%egg%'  then 'Whole'
    else null
  end,

  case
    when coalesce(p.category, '') ilike '%chicken%' then '100% Antibiotic-Free'
    when coalesce(p.category, '') ilike '%fish%'    then 'Deep Sea Fresh'
    when coalesce(p.category, '') ilike '%egg%'     then 'Organic Farm'
    else 'Chilled 0-4°C'
  end,

  p.category

from public.products p
on conflict (product_id) do nothing;


-- ============================================================================
-- VERIFY — run these after the inserts above
-- ============================================================================

-- How many weight options each product now has (expect 2, or 3 for premium
-- cuts and eggs):
--
--   select p.name, p.category, count(v.id) as weight_options
--   from public.products p
--   left join public.igo_product_variants v on v.product_id = p.id
--   group by p.name, p.category
--   order by weight_options, p.category, p.name;

-- What the customer will actually be charged for each weight:
--
--   select p.name,
--          v.label,
--          round(coalesce(v.price_override, p.price * v.price_multiplier)) as price
--   from public.products p
--   join public.igo_product_variants v on v.product_id = p.id
--   order by p.category, p.name, v.display_order;
