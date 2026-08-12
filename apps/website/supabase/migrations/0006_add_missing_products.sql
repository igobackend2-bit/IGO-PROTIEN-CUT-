-- ============================================================================
-- IGO Protein Cuts — Add the website's missing products
--
-- GENERATED FILE. Do not edit by hand.
-- Regenerate with:  npx tsx scripts/generateMissingProductsSql.ts
-- Source of truth:  src/data/mockData.ts
--
-- ⚠️  READ THIS BEFORE RUNNING
-- This writes to public.products, which the MOBILE APP also reads. Every
-- product added here WILL appear in the app's catalog. This was a deliberate
-- decision — see the "Missing SKUs" section of STEP_BY_STEP_PLAN.md.
--
-- SAFETY
--   • Idempotent — skips any product whose name already exists (case- and
--     whitespace-insensitive), so re-running adds nothing twice.
--   • Wrapped in a transaction — if any statement fails, nothing is applied.
--   • Inserts only. No ALTER, no DROP, no changes to existing rows.
--
-- TO UNDO everything this file added:
--   delete from public.products
--    where id in (select product_id from public.igo_product_web_meta
--                  where added_by_website = true);
-- ============================================================================

begin;

-- Website-owned columns. igo_product_web_meta is a website table, so altering
-- it is in scope; no app table is touched.
alter table public.igo_product_web_meta
  add column if not exists website_category text,
  add column if not exists added_by_website boolean not null default false;


-- Fresh Farm Chicken - Curry Cut (Skinless)  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Fresh Farm Chicken - Curry Cut (Skinless)',
    'Our signature Curry Cut chicken is sourced from certified farms, 100% antibiotic-free, and vacuum-sealed at 0-4°C to retain natural moisture and protein content. Cleaned, gutted, and trimmed of excess fat.',
    189,
    '/Images/Meat Images/Chicken/Chicken Leg Piece.jpg',
    array['/Images/Meat Images/Chicken/Chicken Leg Piece.jpg']::text[],
    'Chicken',
    '500g (Approx. 12-16 pcs)',
    24.5,
    3.6,
    'Keep refrigerated between 0°C to 4°C. Consume within 48 hours of opening.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Fresh Farm Chicken - Curry Cut (Skinless)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Curry Cut',
  'With Bone',
  '100% Antibiotic-Free',
  165,
  0,
  1.2,
  20,
  true,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Approx. 12-16 pcs)', 500, null,
       1, 189, '2-3 Persons', '12-16 pcs', 0
from public.products p
where lower(trim(p.name)) = lower(trim('Fresh Farm Chicken - Curry Cut (Skinless)'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1000g (Approx. 24-30 pcs)', 1000, null,
       1, 359, '4-6 Persons', '24-30 pcs', 1
from public.products p
where lower(trim(p.name)) = lower(trim('Fresh Farm Chicken - Curry Cut (Skinless)'))
on conflict (product_id, label) do nothing;

-- Tender Chicken Breast - Boneless  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Tender Chicken Breast - Boneless',
    'Hand-trimmed 100% boneless chicken breast fillets with zero added water or steroids. Perfect for gym enthusiasts, meal preppers, grilled steaks, and stir-fries.',
    249,
    '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg',
    array['/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg']::text[],
    'Chicken',
    '500g (3-4 Breast Fillets)',
    31,
    2.1,
    'Store in freezer (-18°C) for up to 30 days or refrigerator (0-4°C) for 2 days.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Tender Chicken Breast - Boneless'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Boneless',
  'Boneless',
  '100% Antibiotic-Free',
  142,
  0,
  1,
  15,
  true,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (3-4 Breast Fillets)', 500, null,
       1, 249, '2-3 Gym Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Tender Chicken Breast - Boneless'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1000g (6-8 Breast Fillets)', 1000, null,
       1, 479, '5-6 Gym Servings', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Tender Chicken Breast - Boneless'))
on conflict (product_id, label) do nothing;

-- Juicy Chicken Drumsticks (Leg Pieces)  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Juicy Chicken Drumsticks (Leg Pieces)',
    'Succulent drumsticks sourced from young pasture-raised poultry. Tender meat surrounding a sturdy bone, perfect for retaining juices during tandoori and grilling.',
    219,
    '/Images/Meat Images/Chicken/Chicken Drumsticks.jpg',
    array['/Images/Meat Images/Chicken/Chicken Drumsticks.jpg']::text[],
    'Chicken',
    '500g (Approx. 5-6 Drumsticks)',
    23,
    6.2,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Juicy Chicken Drumsticks (Leg Pieces)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Drumsticks',
  'With Bone',
  '100% Antibiotic-Free',
  178,
  0,
  null,
  25,
  false,
  false,
  true,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Approx. 5-6 Drumsticks)', 500, null,
       1, 219, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Juicy Chicken Drumsticks (Leg Pieces)'))
on conflict (product_id, label) do nothing;

-- Chicken Lollipop Cuts  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken Lollipop Cuts',
    'Cleaned and scraped wing pieces shaped into easy-grip lollipops. Ready for quick marinade and deep frying or baking.',
    229,
    '/Images/Meat Images/Chicken/Chicken Wings.jpg',
    array['/Images/Meat Images/Chicken/Chicken Wings.jpg']::text[],
    'Chicken',
    '500g (Approx. 10-12 Lollipops)',
    22,
    7,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken Lollipop Cuts'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Lollipop',
  'With Bone',
  '100% Antibiotic-Free',
  185,
  0,
  null,
  20,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Approx. 10-12 Lollipops)', 500, null,
       1, 229, '3-4 Starter Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Lollipop Cuts'))
on conflict (product_id, label) do nothing;

-- Country Chicken (Nattu Kozhi) - Curry Cut  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Country Chicken (Nattu Kozhi) - Curry Cut',
    'Naturally raised free-range country chicken. Leaner meat with higher collagen, distinct earthy aroma, and authentic rich broth quality.',
    349,
    '/Images/Meat Images/Chicken/Whole Chicken.jpg',
    array['/Images/Meat Images/Chicken/Whole Chicken.jpg']::text[],
    'Chicken',
    '500g (Curry Cut)',
    26,
    4,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Country Chicken (Nattu Kozhi) - Curry Cut'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Country Chicken',
  'With Bone',
  'Organic Farm',
  170,
  0,
  null,
  35,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Curry Cut)', 500, null,
       1, 349, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Country Chicken (Nattu Kozhi) - Curry Cut'))
on conflict (product_id, label) do nothing;

-- Farm Fresh Quail (Whole Cleaned)  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Farm Fresh Quail (Whole Cleaned)',
    'Pasture-reared quail, hand-cleaned and dressed whole. A gourmet lean-protein choice with a mild, delicate flavor popular in tandoori and roast preparations.',
    279,
    '/Images/quail.png',
    array['/Images/quail.png']::text[],
    'Chicken',
    '500g (Approx. 5-6 Whole Quail)',
    25,
    5,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Farm Fresh Quail (Whole Cleaned)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Quail',
  'Whole',
  '100% Antibiotic-Free',
  150,
  0,
  null,
  25,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Approx. 5-6 Whole Quail)', 500, null,
       1, 279, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Farm Fresh Quail (Whole Cleaned)'))
on conflict (product_id, label) do nothing;

-- Premium Goat Mutton - Curry Cut  (mutton → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Premium Goat Mutton - Curry Cut',
    'Sourced from young grass-fed goats weighing under 11kg for guaranteed tenderness. Features a mix of shoulder, leg, and rib cuts cleaned and vacuum-packed.',
    549,
    '/Images/Meat Images/Mutton/Mutton curry.jpg',
    array['/Images/Meat Images/Mutton/Mutton curry.jpg']::text[],
    'Mutton',
    '500g (Approx. 15-18 pcs)',
    25,
    11,
    'Keep at 0°C to 4°C. Best pressure cooked with spices.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Premium Goat Mutton - Curry Cut'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'mutton',
  'Curry Cut',
  'With Bone',
  '100% Antibiotic-Free',
  210,
  0,
  3.4,
  40,
  true,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Approx. 15-18 pcs)', 500, null,
       1, 549, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Premium Goat Mutton - Curry Cut'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1000g (Approx. 30-35 pcs)', 1000, null,
       1, 1049, '5-6 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Premium Goat Mutton - Curry Cut'))
on conflict (product_id, label) do nothing;

-- Boneless Goat Mutton (Rich Protein)  (mutton → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Boneless Goat Mutton (Rich Protein)',
    '100% bone-free succulent goat meat pieces. Ideal for rich briyani, mutton keema, stews, and kebabs.',
    689,
    '/Images/Meat Images/Mutton/mutton boneless.jpg',
    array['/Images/Meat Images/Mutton/mutton boneless.jpg']::text[],
    'Mutton',
    '500g (Pure Boneless)',
    27.5,
    8.5,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Boneless Goat Mutton (Rich Protein)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'mutton',
  'Boneless',
  'Boneless',
  '100% Antibiotic-Free',
  195,
  0,
  null,
  35,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Pure Boneless)', 500, null,
       1, 689, '3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Boneless Goat Mutton (Rich Protein)'))
on conflict (product_id, label) do nothing;

-- Goat Mutton Ribs & Chops  (mutton → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Goat Mutton Ribs & Chops',
    'Juicy rib chops with delicate bone marrow. The fat marbling renders slowly to create irresistible flavor.',
    599,
    '/Images/Meat Images/Mutton/Mutton Ribs.webp',
    array['/Images/Meat Images/Mutton/Mutton Ribs.webp']::text[],
    'Mutton',
    '500g (Ribs & Chops)',
    24,
    14,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Goat Mutton Ribs & Chops'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'mutton',
  'Chops',
  'With Bone',
  '100% Antibiotic-Free',
  230,
  0,
  null,
  30,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Ribs & Chops)', 500, null,
       1, 599, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Goat Mutton Ribs & Chops'))
on conflict (product_id, label) do nothing;

-- Fresh Seer Fish / Vanjaram Steak  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Fresh Seer Fish / Vanjaram Steak',
    'Vanjaram (Seer Fish) is the undisputed king of sea fish. Firm white meat, single central bone, rich in Omega-3 fatty acids.',
    649,
    '/Images/Meat Images/Fish/Tuna Steak.webp',
    array['/Images/Meat Images/Fish/Tuna Steak.webp']::text[],
    'Fish',
    '500g (Approx. 4-6 Steaks)',
    26,
    7.5,
    'Keep chilled at 0-2°C. Fry or curry within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Fresh Seer Fish / Vanjaram Steak'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Fish Steak',
  'Cleaned & Gutted',
  'Deep Sea Fresh',
  180,
  0,
  1.8,
  15,
  true,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Approx. 4-6 Steaks)', 500, null,
       1, 649, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Fresh Seer Fish / Vanjaram Steak'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1000g (Approx. 8-12 Steaks)', 1000, null,
       1, 1249, '5-6 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Fresh Seer Fish / Vanjaram Steak'))
on conflict (product_id, label) do nothing;

-- Freshwater Rohu / Katla - Curry Cut  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Freshwater Rohu / Katla - Curry Cut',
    'Directly harvested from fresh clean river farms. Descaled, gutted, and cut into neat cross-section steaks.',
    229,
    '/Images/Meat Images/Fish/Rohu Fish.jpg',
    array['/Images/Meat Images/Fish/Rohu Fish.jpg']::text[],
    'Fish',
    '500g (Curry Cut)',
    20,
    2.5,
    'Store at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Freshwater Rohu / Katla - Curry Cut'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Fresh Water Fish',
  'With Bone',
  'Fresh Water Catch',
  120,
  0,
  null,
  20,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Curry Cut)', 500, null,
       1, 229, '2 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Freshwater Rohu / Katla - Curry Cut'))
on conflict (product_id, label) do nothing;

-- Fresh Tiger Prawns - Cleaned & Deveined  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Fresh Tiger Prawns - Cleaned & Deveined',
    'Sustainably farmed tiger prawns, peeled and deveined leaving tail on for exquisite presentation.',
    429,
    '/Images/Meat Images/Fish/Prawns.jpg',
    array['/Images/Meat Images/Fish/Prawns.jpg']::text[],
    'Fish',
    '350g Cleaned (Approx. 20-25 Prawns)',
    24,
    1.2,
    'Keep chilled at 0-2°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Fresh Tiger Prawns - Cleaned & Deveined'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Prawns',
  'Boneless',
  'Deep Sea Fresh',
  105,
  0,
  null,
  10,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '350g Cleaned (Approx. 20-25 Prawns)', 350, 245,
       1, 429, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Fresh Tiger Prawns - Cleaned & Deveined'))
on conflict (product_id, label) do nothing;

-- Norwegian Salmon Fillet (Boneless)  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Norwegian Salmon Fillet (Boneless)',
    'Premium imported Atlantic salmon, descaled and deboned with skin-on protection for pan-searing. Rich in healthy Omega-3 fats and prized for sushi-grade freshness.',
    899,
    '/Images/Meat Images/Fish/Salmon Fillet.jpg',
    array['/Images/Meat Images/Fish/Salmon Fillet.jpg']::text[],
    'Fish',
    '250g Fillet',
    22,
    11,
    'Keep chilled at 0-2°C. Consume within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Norwegian Salmon Fillet (Boneless)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Salmon',
  'Cleaned & Gutted',
  'Deep Sea Fresh',
  208,
  0,
  0.8,
  15,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '250g Fillet', 250, null,
       1, 899, '1-2 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Norwegian Salmon Fillet (Boneless)'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g Fillet', 500, null,
       1, 1749, '2-3 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Norwegian Salmon Fillet (Boneless)'))
on conflict (product_id, label) do nothing;

-- Fresh Mud Crab (Live Caught)  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Fresh Mud Crab (Live Caught)',
    'Wild-caught mud crab from coastal backwaters, cleaned and ready to cook. Prized for its dense, sweet meat and rich roe.',
    549,
    '/Images/Meat Images/Fish/Crab.jpg',
    array['/Images/Meat Images/Fish/Crab.jpg']::text[],
    'Fish',
    '500g (1-2 Crabs)',
    19,
    1.5,
    'Keep chilled at 0-2°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Fresh Mud Crab (Live Caught)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Crab',
  'Cleaned & Gutted',
  'Deep Sea Fresh',
  97,
  0,
  null,
  25,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (1-2 Crabs)', 500, 260,
       1, 549, '2 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Fresh Mud Crab (Live Caught)'))
on conflict (product_id, label) do nothing;

-- Live Mud Crab (Whole, Uncleaned)  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Live Mud Crab (Whole, Uncleaned)',
    'Whole live mud crab, tied and delivered same-day from coastal waters. Sold uncleaned so you get maximum freshness and roe — ask our butchers for cleaning at checkout if preferred.',
    649,
    '/Images/mud-crab.png',
    array['/Images/mud-crab.png']::text[],
    'Fish',
    '600g (1 Large Crab)',
    18,
    1.2,
    'Best cooked same-day. Keep in a ventilated container, not sealed, if not cooking immediately.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Live Mud Crab (Whole, Uncleaned)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Crab',
  'Whole',
  'Deep Sea Fresh',
  90,
  0,
  null,
  30,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '600g (1 Large Crab)', 600, 380,
       1, 649, '2 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Live Mud Crab (Whole, Uncleaned)'))
on conflict (product_id, label) do nothing;

-- Sun-Dried Anchovy (Nethili Karuvadu)  (dry-fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Sun-Dried Anchovy (Nethili Karuvadu)',
    'Traditional sun-dried Nethili fish. Cleaned of sand and dirt using modern optical sorting, sealed in moisture-proof zip locks.',
    179,
    '/Images/Meat Images/Fish/Anchovy.jpg',
    array['/Images/Meat Images/Fish/Anchovy.jpg']::text[],
    'Fish',
    '200g Pack',
    42,
    4.5,
    'Store in a cool dry place or refrigerate for 6 months shelf life.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Sun-Dried Anchovy (Nethili Karuvadu)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'dry-fish',
  'Anchovy',
  'Cleaned & Gutted',
  'Chilled 0-4°C',
  210,
  0,
  4.2,
  15,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '200g Pack', 200, null,
       1, 179, '4-5 Meals', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Sun-Dried Anchovy (Nethili Karuvadu)'))
on conflict (product_id, label) do nothing;

-- Farm Fresh White Eggs (Pack of 12)  (eggs → Eggs)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Farm Fresh White Eggs (Pack of 12)',
    'Strictly quality inspected, clean shell white eggs from healthy hens fed balanced grains.',
    89,
    '/Images/Meat Images/Eggs/Farm Fresh Eggs.webp',
    array['/Images/Meat Images/Eggs/Farm Fresh Eggs.webp']::text[],
    'Eggs',
    '12 Eggs Pack',
    6.3,
    4.8,
    'Store in egg tray inside refrigerator.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Farm Fresh White Eggs (Pack of 12)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'eggs',
  'White Eggs',
  'Whole',
  'Organic Farm',
  72,
  0.4,
  null,
  5,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '12 Eggs Pack', 600, null,
       1, 89, '12 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Farm Fresh White Eggs (Pack of 12)'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '30 Eggs Tray', 1500, null,
       1, 219, '30 Servings', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Farm Fresh White Eggs (Pack of 12)'))
on conflict (product_id, label) do nothing;

-- Organic Brown Country Hen Eggs (Pack of 6)  (eggs → Eggs)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Organic Brown Country Hen Eggs (Pack of 6)',
    'Naturally laid by country hens foraging outdoors. Higher Omega-3 content and deep orange flavorful yolk.',
    99,
    '/Images/Meat Images/Eggs/Farm Fresh Eggs.webp',
    array['/Images/Meat Images/Eggs/Farm Fresh Eggs.webp']::text[],
    'Eggs',
    '6 Eggs Pack',
    7.1,
    5.1,
    'Refrigerate.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Organic Brown Country Hen Eggs (Pack of 6)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'eggs',
  'Country Eggs',
  'Whole',
  'Organic Farm',
  78,
  0.3,
  null,
  5,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '6 Eggs Pack', 350, null,
       1, 99, '6 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Organic Brown Country Hen Eggs (Pack of 6)'))
on conflict (product_id, label) do nothing;

-- Chef Peri Peri Marinated Chicken Wings  (ready-to-cook → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chef Peri Peri Marinated Chicken Wings',
    'Pre-marinated freshly cut chicken wings. No artificial flavors or synthetic colors. Pan fry in 10 mins or air-fry for crispy texture.',
    239,
    '/Images/Meat Images/Chicken/Chicken Wings.jpg',
    array['/Images/Meat Images/Chicken/Chicken Wings.jpg']::text[],
    'Chicken',
    '400g Pack (8-10 Wings)',
    22,
    8,
    'Cook directly from pack or refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chef Peri Peri Marinated Chicken Wings'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'ready-to-cook',
  'BBQ Chicken',
  'With Bone',
  '100% Antibiotic-Free',
  190,
  2,
  null,
  10,
  true,
  false,
  true,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '400g Pack (8-10 Wings)', 400, null,
       1, 239, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chef Peri Peri Marinated Chicken Wings'))
on conflict (product_id, label) do nothing;

-- Tandoori Chicken Tikka (Boneless Marinated)  (ready-to-cook → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Tandoori Chicken Tikka (Boneless Marinated)',
    'Handcrafted marinade with authentic tandoori spices. Ready to cook on a pan, grill, or oven in just 12 minutes.',
    269,
    '/Images/Meat Images/Chicken/Chicken Thigh Boneless.jpg',
    array['/Images/Meat Images/Chicken/Chicken Thigh Boneless.jpg']::text[],
    'Chicken',
    '350g Pack',
    28,
    4.5,
    'Keep chilled 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Tandoori Chicken Tikka (Boneless Marinated)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'ready-to-cook',
  'Tandoori Chicken',
  'Boneless',
  '100% Antibiotic-Free',
  160,
  3,
  null,
  12,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '350g Pack', 350, null,
       1, 269, '2 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Tandoori Chicken Tikka (Boneless Marinated)'))
on conflict (product_id, label) do nothing;

-- Mutton Seekh Kebab (Marinated)  (ready-to-cook → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Mutton Seekh Kebab (Marinated)',
    'Freshly minced goat mutton blended with ginger-garlic, roasted spices, and fresh herbs, hand-shaped onto skewers. Pan-fry, grill, or air-fry in 12 minutes.',
    329,
    '/Images/Meat Images/Mutton/Mutton Mince.jpg',
    array['/Images/Meat Images/Mutton/Mutton Mince.jpg']::text[],
    'Mutton',
    '400g Pack (8 Skewers)',
    26,
    11,
    'Keep chilled at 0-4°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Mutton Seekh Kebab (Marinated)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'ready-to-cook',
  'Mutton Kebab',
  'Boneless',
  '100% Antibiotic-Free',
  210,
  3,
  null,
  12,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '400g Pack (8 Skewers)', 400, null,
       1, 329, '3-4 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Mutton Seekh Kebab (Marinated)'))
on conflict (product_id, label) do nothing;

-- Fish Amritsari (Marinated Fish Fry)  (ready-to-cook → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Fish Amritsari (Marinated Fish Fry)',
    'Fresh boneless fish fillet strips coated in a classic Amritsari batter with carom seeds and ginger-garlic. Shallow fry for 6-8 minutes for a crispy, golden starter.',
    299,
    '/Images/Meat Images/Fish/Salmon Fillet.jpg',
    array['/Images/Meat Images/Fish/Salmon Fillet.jpg']::text[],
    'Fish',
    '350g Pack',
    20,
    6,
    'Keep chilled at 0-2°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Fish Amritsari (Marinated Fish Fry)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'ready-to-cook',
  'Fish Fry',
  'Boneless',
  'Deep Sea Fresh',
  175,
  8,
  null,
  8,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '350g Pack', 350, null,
       1, 299, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Fish Amritsari (Marinated Fish Fry)'))
on conflict (product_id, label) do nothing;

-- Chicken 65 (Marinated)  (ready-to-cook → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken 65 (Marinated)',
    'Bite-sized boneless chicken pieces marinated with curry leaves, red chilli, ginger-garlic, and yogurt. A classic South Indian starter, ready in 10 minutes.',
    259,
    '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg',
    array['/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg']::text[],
    'Chicken',
    '400g Pack',
    24,
    7,
    'Keep chilled at 0-4°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken 65 (Marinated)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'ready-to-cook',
  'Chicken Snacks',
  'Boneless',
  '100% Antibiotic-Free',
  185,
  6,
  null,
  10,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '400g Pack', 400, null,
       1, 259, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken 65 (Marinated)'))
on conflict (product_id, label) do nothing;

-- Sunday Family Feast Combo  (combo-packs → Healthy Add-ons)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Sunday Family Feast Combo',
    'The ultimate weekend bundle for family lunches. Premium fresh cuts delivered together in one eco-insulated box with instant 20% bundle savings.',
    799,
    '/Images/banners/combo-family-feast-banner.jpg',
    array['/Images/banners/combo-family-feast-banner.jpg']::text[],
    'Healthy Add-ons',
    '1 Combo Box (Approx 2.1kg Total)',
    null,
    null,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Sunday Family Feast Combo'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'combo-packs',
  'Family Combo',
  'With Bone',
  '100% Antibiotic-Free',
  null,
  null,
  null,
  30,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1 Combo Box (Approx 2.1kg Total)', 2100, null,
       1, 799, '6-8 Family Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Sunday Family Feast Combo'))
on conflict (product_id, label) do nothing;

-- High Protein Gym Bro Bundle  (combo-packs → Healthy Add-ons)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'High Protein Gym Bro Bundle',
    'Engineered for athletes and bodybuilders: 380g total pure protein per combo box. Zero extra fat, 100% antibiotic-free.',
    649,
    '/Images/banners/combo-gym-bro-banner.jpg',
    array['/Images/banners/combo-gym-bro-banner.jpg', '/Images/chicken-breast.png', '/Images/eggs.png']::text[],
    'Healthy Add-ons',
    '1 Gym Pack Box',
    380,
    null,
    'Store chicken in freezer, eggs in fridge tray.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('High Protein Gym Bro Bundle'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'combo-packs',
  'Protein Combo',
  'Boneless',
  '100% Antibiotic-Free',
  null,
  0,
  null,
  15,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1 Gym Pack Box', 2500, null,
       1, 649, '7 Days Gym Preps', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('High Protein Gym Bro Bundle'))
on conflict (product_id, label) do nothing;

-- Festival Combo  (combo-packs → Healthy Add-ons)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Festival Combo',
    'A full festive spread for celebrations and family gatherings — a whole roasting chicken, tender mutton curry cut, and a dozen farm eggs, bundled together with combo savings.',
    899,
    '/Images/banners/combo-festival-banner.jpg',
    array['/Images/banners/combo-festival-banner.jpg', '/Images/Meat Images/Chicken/Whole Chicken.jpg', '/Images/Meat Images/Mutton/Mutton curry.jpg']::text[],
    'Healthy Add-ons',
    '1 Combo Box (Approx 2.5kg Total)',
    null,
    null,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Festival Combo'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'combo-packs',
  'Family Combo',
  'With Bone',
  '100% Antibiotic-Free',
  null,
  null,
  null,
  35,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1 Combo Box (Approx 2.5kg Total)', 2500, null,
       1, 899, '6-8 Family Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Festival Combo'))
on conflict (product_id, label) do nothing;

-- Seafood Combo  (combo-packs → Healthy Add-ons)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Seafood Combo',
    'A deep-sea trio for seafood lovers — cleaned tiger prawns, sashimi-grade salmon fillet, and a whole mud crab, bundled together with combo savings.',
    1799,
    '/Images/banners/combo-seafood-banner.jpg',
    array['/Images/banners/combo-seafood-banner.jpg', '/Images/Meat Images/Fish/Prawns.jpg', '/Images/Meat Images/Fish/Salmon Fillet.jpg', '/Images/Meat Images/Fish/Crab.jpg']::text[],
    'Healthy Add-ons',
    '1 Combo Box (Approx 1.1kg Total)',
    null,
    null,
    'Keep chilled at 0-2°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Seafood Combo'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'combo-packs',
  'Seafood Combo',
  'Cleaned & Gutted',
  'Deep Sea Fresh',
  null,
  null,
  null,
  25,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1 Combo Box (Approx 1.1kg Total)', 1100, null,
       1, 1799, '3-4 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Seafood Combo'))
on conflict (product_id, label) do nothing;

-- Frozen Chicken Nuggets  (frozen-food → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Frozen Chicken Nuggets',
    'Made from 100% antibiotic-free boneless chicken breast, breaded and flash-frozen at peak freshness. No preservatives added — just heat and serve in under 10 minutes.',
    249,
    '/Images/chicken-breast.png',
    array['/Images/chicken-breast.png']::text[],
    'Chicken',
    '400 g Pack',
    14,
    10,
    'Keep frozen at -18°C. Do not refreeze after thawing.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Frozen Chicken Nuggets'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'frozen-food',
  'Frozen Snacks',
  'Boneless',
  'Chilled 0-4°C',
  220,
  16,
  null,
  10,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '400 g Pack', 400, null,
       1, 249, '3-4 Servings', '20-24 pcs', 0
from public.products p
where lower(trim(p.name)) = lower(trim('Frozen Chicken Nuggets'))
on conflict (product_id, label) do nothing;

-- Frozen Fish Fillets  (frozen-food → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Frozen Fish Fillets',
    'Deboned and deskinned fish fillets, individually quick-frozen to lock in freshness. Perfect for fish fry, curries, or grilling without any prep hassle.',
    329,
    '/Images/seer-fish.png',
    array['/Images/seer-fish.png']::text[],
    'Fish',
    '500 g Pack',
    18,
    2.5,
    'Keep frozen at -18°C. Thaw in refrigerator before cooking.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Frozen Fish Fillets'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'frozen-food',
  'Frozen Seafood',
  'Boneless',
  'Chilled 0-4°C',
  105,
  0,
  null,
  15,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500 g Pack', 500, null,
       1, 329, '3-4 Servings', '4-5 fillets', 0
from public.products p
where lower(trim(p.name)) = lower(trim('Frozen Fish Fillets'))
on conflict (product_id, label) do nothing;

-- Frozen Chicken Seekh Kebabs  (frozen-food → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Frozen Chicken Seekh Kebabs',
    'Spiced minced chicken kebabs, pre-cooked and flash-frozen. Just pan-fry, grill, or air-fry for 8-10 minutes for a restaurant-style starter at home.',
    289,
    '/Images/chicken-whole.png',
    array['/Images/chicken-whole.png']::text[],
    'Chicken',
    '500 g Pack',
    16,
    9,
    'Keep frozen at -18°C. Cook directly from frozen.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Frozen Chicken Seekh Kebabs'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'frozen-food',
  'Frozen Snacks',
  'Boneless',
  'Chilled 0-4°C',
  190,
  4,
  null,
  10,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500 g Pack', 500, null,
       1, 289, '4-5 Servings', '10 pcs', 0
from public.products p
where lower(trim(p.name)) = lower(trim('Frozen Chicken Seekh Kebabs'))
on conflict (product_id, label) do nothing;

-- Frozen Green Peas  (frozen-food → Healthy Add-ons)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Frozen Green Peas',
    'Shelled and individually quick-frozen within hours of harvest to lock in sweetness and nutrition. A handy pantry staple for curries, pulao, and quick side dishes.',
    89,
    '/Images/eggs.png',
    array['/Images/eggs.png']::text[],
    'Healthy Add-ons',
    '500 g Pack',
    5,
    0.4,
    'Keep frozen at -18°C. No need to thaw before cooking.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Frozen Green Peas'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'frozen-food',
  'Frozen Vegetables',
  'Whole',
  'Chilled 0-4°C',
  81,
  14,
  null,
  5,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500 g Pack', 500, null,
       1, 89, '5-6 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Frozen Green Peas'))
on conflict (product_id, label) do nothing;

-- Chicken Biryani Kit  (biryani → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken Biryani Kit',
    'Everything you need for restaurant-style chicken biryani in one box — pre-marinated curry-cut chicken, seeraga samba rice, whole biryani spices, fried onions, and step-by-step instructions. Just cook and serve.',
    449,
    '/Images/chicken-whole.png',
    array['/Images/chicken-whole.png']::text[],
    'Chicken',
    '1 Kit (Serves 4)',
    28,
    14,
    'Refrigerate the marinated chicken; store rice and spices at room temperature. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken Biryani Kit'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'biryani',
  'Chicken Biryani',
  'With Bone',
  '100% Antibiotic-Free',
  520,
  58,
  null,
  45,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1 Kit (Serves 4)', 1200, null,
       1, 449, '4 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Biryani Kit'))
on conflict (product_id, label) do nothing;

-- Mutton Biryani Kit  (biryani → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Mutton Biryani Kit',
    'A complete mutton biryani meal kit — tender bone-in goat curry cuts marinated overnight, seeraga samba rice, whole spices, fried onions, and mint. Dum-cook at home in under an hour.',
    599,
    '/Images/banners/biryani-kit.jpg',
    array['/Images/banners/biryani-kit.jpg']::text[],
    'Mutton',
    '1 Kit (Serves 4)',
    32,
    22,
    'Refrigerate the marinated mutton; store rice and spices at room temperature. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Mutton Biryani Kit'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'biryani',
  'Mutton Biryani',
  'With Bone',
  '100% Antibiotic-Free',
  610,
  55,
  null,
  60,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1 Kit (Serves 4)', 1400, null,
       1, 599, '4 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Mutton Biryani Kit'))
on conflict (product_id, label) do nothing;

-- Egg Biryani Kit  (biryani → Eggs)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Egg Biryani Kit',
    'A lighter, faster biryani option with farm-fresh eggs, seeraga samba rice, whole spices, and fried onions. Ready in under 30 minutes.',
    249,
    '/Images/eggs.png',
    array['/Images/eggs.png']::text[],
    'Eggs',
    '1 Kit (Serves 2-3)',
    18,
    12,
    'Refrigerate eggs; store rice and spices at room temperature.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Egg Biryani Kit'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'biryani',
  'Egg Biryani',
  'Whole',
  'Organic Farm',
  410,
  52,
  null,
  25,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1 Kit (Serves 2-3)', 800, null,
       1, 249, '2-3 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Egg Biryani Kit'))
on conflict (product_id, label) do nothing;

-- Chicken Salami  (cold-cuts → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken Salami',
    'Deli-style chicken salami made from 100% antibiotic-free chicken, slow-cured and thinly sliced. Ready to eat straight from the pack — no cooking needed.',
    189,
    '/Images/chicken-breast.png',
    array['/Images/chicken-breast.png']::text[],
    'Chicken',
    '200 g Pack',
    15,
    8,
    'Refrigerate at 0-4°C. Consume within 3 days of opening.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken Salami'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'cold-cuts',
  'Salami',
  'Boneless',
  'Chilled 0-4°C',
  145,
  3,
  null,
  0,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '200 g Pack', 200, null,
       1, 189, '4-5 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Salami'))
on conflict (product_id, label) do nothing;

-- Chicken Ham  (cold-cuts → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken Ham',
    'Smoked chicken ham, thinly sliced and ready to eat. A breakfast and sandwich staple made with 100% antibiotic-free chicken.',
    179,
    '/Images/chicken-breast.png',
    array['/Images/chicken-breast.png']::text[],
    'Chicken',
    '200 g Pack',
    16,
    6,
    'Refrigerate at 0-4°C. Consume within 3 days of opening.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken Ham'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'cold-cuts',
  'Ham',
  'Boneless',
  'Chilled 0-4°C',
  130,
  2,
  null,
  0,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '200 g Pack', 200, null,
       1, 179, '4-5 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Ham'))
on conflict (product_id, label) do nothing;

-- Chicken Breakfast Sausages  (cold-cuts → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken Breakfast Sausages',
    'Classic breakfast-style chicken sausages, lightly seasoned and pre-cooked. Just pan-fry for 5 minutes for a crispy, juicy bite.',
    229,
    '/Images/chicken-whole.png',
    array['/Images/chicken-whole.png']::text[],
    'Chicken',
    '250 g Pack',
    14,
    15,
    'Refrigerate at 0-4°C. Cook within 3 days of opening.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken Breakfast Sausages'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'cold-cuts',
  'Sausages',
  'Boneless',
  'Chilled 0-4°C',
  210,
  4,
  null,
  8,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '250 g Pack', 250, null,
       1, 229, '3-4 Servings', '6-8 pcs', 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Breakfast Sausages'))
on conflict (product_id, label) do nothing;

-- Turkey Bacon  (cold-cuts → Healthy Add-ons)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Turkey Bacon',
    'Thinly sliced turkey bacon, smoked and ready to pan-fry. A leaner, high-protein alternative for breakfast plates and burgers.',
    249,
    '/Images/chicken-breast.png',
    array['/Images/chicken-breast.png']::text[],
    'Healthy Add-ons',
    '150 g Pack',
    17,
    9,
    'Refrigerate at 0-4°C. Cook within 3 days of opening.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Turkey Bacon'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'cold-cuts',
  'Bacon',
  'Boneless',
  'Chilled 0-4°C',
  150,
  1,
  null,
  5,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '150 g Pack', 150, null,
       1, 249, '2-3 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Turkey Bacon'))
on conflict (product_id, label) do nothing;

-- Weekly Fitness Protein Pass  (subscription → Healthy Add-ons)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Weekly Fitness Protein Pass',
    'Auto-recurring protein plan for fitness goals. Choose your preferred delivery days. Free express morning slots, 15% discount unlocked, cancel or pause anytime with 1 click.',
    1899,
    '/Images/chicken-breast.png',
    array['/Images/chicken-breast.png', '/Images/eggs.png']::text[],
    'Healthy Add-ons',
    '4-Week Auto Pass (12 Deliveries)',
    30,
    null,
    'Delivered fresh at your doorstep.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Weekly Fitness Protein Pass'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'subscription',
  'Fitness Plan',
  'Boneless',
  '100% Antibiotic-Free',
  null,
  0,
  null,
  10,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '4-Week Auto Pass (12 Deliveries)', 12000, null,
       1, 1899, '30 Days Supply', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Weekly Fitness Protein Pass'))
on conflict (product_id, label) do nothing;

-- Chicken Breast Boneless  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken Breast Boneless',
    'Fresh hand-trimmed boneless chicken breast, 100% antibiotic-free, vacuum-packed to lock in freshness and natural protein content.',
    249,
    '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg',
    array['/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg']::text[],
    'Chicken',
    '500g',
    31,
    2.1,
    'Refrigerate at 0-4°C. Consume within 48 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken Breast Boneless'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Boneless',
  'Boneless',
  '100% Antibiotic-Free',
  142,
  0,
  1,
  15,
  true,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 249, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Breast Boneless'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1000g', 1000, null,
       1, 479, '4-6 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Breast Boneless'))
on conflict (product_id, label) do nothing;

-- Chicken Drumsticks  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken Drumsticks',
    'Tender and juicy chicken drumsticks sourced from farm-raised poultry. Great for tandoori, BBQ, and spicy fry preparations.',
    219,
    '/Images/Meat Images/Chicken/Chicken Drumsticks.jpg',
    array['/Images/Meat Images/Chicken/Chicken Drumsticks.jpg']::text[],
    'Chicken',
    '500g (5-6 Drumsticks)',
    23,
    6.2,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken Drumsticks'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Drumsticks',
  'With Bone',
  '100% Antibiotic-Free',
  178,
  0,
  null,
  25,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (5-6 Drumsticks)', 500, null,
       1, 219, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Drumsticks'))
on conflict (product_id, label) do nothing;

-- Chicken Leg Piece  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken Leg Piece',
    'Whole chicken leg pieces cleaned and trimmed. Ideal for slow-cooked curries, biryanis, and oven roasts that need rich juicy meat.',
    229,
    '/Images/Meat Images/Chicken/Chicken Leg Piece.jpg',
    array['/Images/Meat Images/Chicken/Chicken Leg Piece.jpg']::text[],
    'Chicken',
    '500g (2-3 Leg Pieces)',
    24.5,
    7.5,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken Leg Piece'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Leg Piece',
  'With Bone',
  '100% Antibiotic-Free',
  185,
  0,
  null,
  30,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (2-3 Leg Pieces)', 500, null,
       1, 229, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Leg Piece'))
on conflict (product_id, label) do nothing;

-- Chicken Liver  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken Liver',
    'Cleaned and fresh chicken liver packed with iron, B12, and folate. A nutritional powerhouse for health-conscious protein seekers.',
    149,
    '/Images/Meat Images/Chicken/Chicken Liver.jpg',
    array['/Images/Meat Images/Chicken/Chicken Liver.jpg']::text[],
    'Chicken',
    '500g',
    26.5,
    4.8,
    'Refrigerate at 0-4°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken Liver'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Offal',
  'Boneless',
  '100% Antibiotic-Free',
  135,
  0.7,
  9,
  15,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 149, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Liver'))
on conflict (product_id, label) do nothing;

-- Chicken Mince  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken Mince',
    'Freshly minced boneless chicken meat with no added fillers or preservatives. Ideal for making kebabs, koftas, patties, and stuffed dishes.',
    239,
    '/Images/Meat Images/Chicken/Chicken Mince.jpg',
    array['/Images/Meat Images/Chicken/Chicken Mince.jpg']::text[],
    'Chicken',
    '500g',
    28,
    3.5,
    'Refrigerate at 0-4°C. Use within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken Mince'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Mince',
  'Boneless',
  '100% Antibiotic-Free',
  148,
  0,
  null,
  15,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 239, '3-4 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Mince'))
on conflict (product_id, label) do nothing;

-- Chicken Thigh Boneless  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken Thigh Boneless',
    'Tender boneless chicken thighs trimmed of excess fat and skin. More flavorful than breast, perfect for grilling, curries, and wraps.',
    229,
    '/Images/Meat Images/Chicken/Chicken Thigh Boneless.jpg',
    array['/Images/Meat Images/Chicken/Chicken Thigh Boneless.jpg']::text[],
    'Chicken',
    '500g',
    26,
    8,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken Thigh Boneless'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Boneless',
  'Boneless',
  '100% Antibiotic-Free',
  177,
  0,
  null,
  20,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 229, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Thigh Boneless'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1000g', 1000, null,
       1, 439, '4-6 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Thigh Boneless'))
on conflict (product_id, label) do nothing;

-- Chicken Wings  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Chicken Wings',
    'Fresh chicken wings cleaned and trimmed, perfect for Buffalo wings, BBQ glaze, or spicy air-fried snacks.',
    209,
    '/Images/Meat Images/Chicken/Chicken Wings.jpg',
    array['/Images/Meat Images/Chicken/Chicken Wings.jpg']::text[],
    'Chicken',
    '500g (8-10 Wings)',
    22,
    7,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Chicken Wings'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Wings',
  'With Bone',
  '100% Antibiotic-Free',
  185,
  0,
  null,
  20,
  false,
  false,
  true,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (8-10 Wings)', 500, null,
       1, 209, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Chicken Wings'))
on conflict (product_id, label) do nothing;

-- Whole Chicken  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Whole Chicken',
    'Whole farm-fresh chicken, fully cleaned, gutted, and dressed. Ideal for a full Sunday roast, whole chicken curry, or BBQ spit-roast.',
    299,
    '/Images/Meat Images/Chicken/Whole Chicken.jpg',
    array['/Images/Meat Images/Chicken/Whole Chicken.jpg']::text[],
    'Chicken',
    'Approx. 900g-1.1kg (1 Whole Bird)',
    25,
    3.6,
    'Refrigerate at 0-4°C. Use within 48 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Whole Chicken'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Whole',
  'Whole',
  '100% Antibiotic-Free',
  165,
  0,
  null,
  40,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, 'Approx. 900g-1.1kg (1 Whole Bird)', 1000, null,
       1, 299, '3-4 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Whole Chicken'))
on conflict (product_id, label) do nothing;

-- Country Chicken (Naattu Kozhi)  (chicken → Chicken)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Country Chicken (Naattu Kozhi)',
    'Traditionally reared free-range country chicken (naattu kozhi), raised outdoors on a natural diet. Firmer meat with a richer flavor than broiler chicken — a South Indian favorite for pepper chicken and country-style curries.',
    399,
    '/Images/naattu-kozhi.png',
    array['/Images/naattu-kozhi.png']::text[],
    'Chicken',
    'Approx. 700-900g (1 Whole Bird)',
    27,
    5.5,
    'Refrigerate at 0-4°C. Use within 48 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Country Chicken (Naattu Kozhi)'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'chicken',
  'Country Chicken',
  'Whole',
  'Organic Farm',
  180,
  0,
  null,
  45,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, 'Approx. 700-900g (1 Whole Bird)', 800, null,
       1, 399, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Country Chicken (Naattu Kozhi)'))
on conflict (product_id, label) do nothing;

-- Mutton Chops  (mutton → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Mutton Chops',
    'Fresh goat mutton chops cut from the rack with fine marbling. Ideal for slow pan searing, pressure cooking, or Indian spice-rubbed grills.',
    599,
    '/Images/Meat Images/Mutton/Mutton Chops.jpg',
    array['/Images/Meat Images/Mutton/Mutton Chops.jpg']::text[],
    'Mutton',
    '500g (4-5 Chops)',
    24,
    14,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Mutton Chops'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'mutton',
  'Chops',
  'With Bone',
  '100% Antibiotic-Free',
  230,
  0,
  null,
  35,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (4-5 Chops)', 500, null,
       1, 599, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Mutton Chops'))
on conflict (product_id, label) do nothing;

-- Mutton Leg  (mutton → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Mutton Leg',
    'Bone-in goat leg with premium lean meat and natural fat marbling. Slow-roasted or pressure-cooked for rich, succulent results.',
    749,
    '/Images/Meat Images/Mutton/Mutton Leg.jpg',
    array['/Images/Meat Images/Mutton/Mutton Leg.jpg']::text[],
    'Mutton',
    '500g (Half Leg)',
    26,
    12,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Mutton Leg'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'mutton',
  'Leg',
  'With Bone',
  '100% Antibiotic-Free',
  215,
  0,
  3.2,
  60,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Half Leg)', 500, null,
       1, 749, '3-4 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Mutton Leg'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1000g (Whole Leg)', 1000, null,
       1, 1449, '6-8 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Mutton Leg'))
on conflict (product_id, label) do nothing;

-- Mutton Liver  (mutton → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Mutton Liver',
    'Freshly cleaned goat liver, a rich source of iron, protein, and vitamin B12. Quick to cook and deeply nutritious.',
    349,
    '/Images/Meat Images/Mutton/Mutton Liver.jpg',
    array['/Images/Meat Images/Mutton/Mutton Liver.jpg']::text[],
    'Mutton',
    '500g',
    29.5,
    5.5,
    'Refrigerate at 0-4°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Mutton Liver'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'mutton',
  'Offal',
  'Boneless',
  '100% Antibiotic-Free',
  148,
  3.9,
  10.2,
  20,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 349, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Mutton Liver'))
on conflict (product_id, label) do nothing;

-- Mutton Mince  (mutton → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Mutton Mince',
    'Hand-ground fresh goat mutton mince with ideal fat-to-lean ratio. Zero fillers, no added water. Perfect for authentic keema curries and seekh kebabs.',
    649,
    '/Images/Meat Images/Mutton/Mutton Mince.jpg',
    array['/Images/Meat Images/Mutton/Mutton Mince.jpg']::text[],
    'Mutton',
    '500g',
    26,
    13,
    'Refrigerate at 0-4°C. Use within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Mutton Mince'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'mutton',
  'Mince',
  'Boneless',
  '100% Antibiotic-Free',
  218,
  0,
  null,
  20,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 649, '3-4 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Mutton Mince'))
on conflict (product_id, label) do nothing;

-- Mutton Ribs  (mutton → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Mutton Ribs',
    'Meaty goat ribs with tender meat and rich bone marrow. Best slow-cooked in a spiced gravy or grilled for a smoky flavour.',
    579,
    '/Images/Meat Images/Mutton/Mutton Ribs.webp',
    array['/Images/Meat Images/Mutton/Mutton Ribs.webp']::text[],
    'Mutton',
    '500g',
    22,
    15,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Mutton Ribs'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'mutton',
  'Ribs',
  'With Bone',
  '100% Antibiotic-Free',
  240,
  0,
  null,
  45,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 579, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Mutton Ribs'))
on conflict (product_id, label) do nothing;

-- Mutton Soup Bones  (mutton → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Mutton Soup Bones',
    'Goat soup bones loaded with collagen, gelatin, and bone marrow. Slow-cook for hours to extract a deeply nourishing and gut-healing broth.',
    299,
    '/Images/Meat Images/Mutton/Mutton Soup Bones.jpg',
    array['/Images/Meat Images/Mutton/Mutton Soup Bones.jpg']::text[],
    'Mutton',
    '500g',
    18,
    10,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Mutton Soup Bones'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'mutton',
  'Soup Bones',
  'With Bone',
  '100% Antibiotic-Free',
  180,
  0,
  null,
  90,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 299, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Mutton Soup Bones'))
on conflict (product_id, label) do nothing;

-- Mutton Curry  (mutton → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Mutton Curry',
    'Mixed bone-in mutton curry cut pieces from shoulder, leg, and rib. Each piece perfectly sized for soaking up rich masala gravies.',
    549,
    '/Images/Meat Images/Mutton/Mutton curry.jpg',
    array['/Images/Meat Images/Mutton/Mutton curry.jpg']::text[],
    'Mutton',
    '500g (15-18 pcs)',
    25,
    11,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Mutton Curry'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'mutton',
  'Curry Cut',
  'With Bone',
  '100% Antibiotic-Free',
  210,
  0,
  3.4,
  40,
  true,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (15-18 pcs)', 500, null,
       1, 549, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Mutton Curry'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1000g (30-35 pcs)', 1000, null,
       1, 1049, '5-6 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Mutton Curry'))
on conflict (product_id, label) do nothing;

-- Mutton Boneless  (mutton → Mutton)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Mutton Boneless',
    '100% bone-free goat mutton pieces, hand-trimmed of fat and sinew. Ideal for biryani, keema, tikka, and any recipe requiring pure tender meat.',
    689,
    '/Images/Meat Images/Mutton/mutton boneless.jpg',
    array['/Images/Meat Images/Mutton/mutton boneless.jpg']::text[],
    'Mutton',
    '500g',
    27.5,
    8.5,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Mutton Boneless'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'mutton',
  'Boneless',
  'Boneless',
  '100% Antibiotic-Free',
  195,
  0,
  null,
  35,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 689, '3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Mutton Boneless'))
on conflict (product_id, label) do nothing;

-- Beef Cubes  (beef → Beef)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Beef Cubes',
    'Fresh boneless beef cut into even cubes for consistent cooking. Sourced from quality cattle, perfect for stews, Beef Bourguignon, and slow-cooked curries.',
    499,
    '/Images/Meat Images/Beef/Beef Cubes.jpg',
    array['/Images/Meat Images/Beef/Beef Cubes.jpg']::text[],
    'Beef',
    '500g',
    26,
    15,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Beef Cubes'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'beef',
  'Cubes',
  'Boneless',
  '100% Antibiotic-Free',
  250,
  0,
  2.6,
  45,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 499, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Beef Cubes'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1000g', 1000, null,
       1, 949, '4-6 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Beef Cubes'))
on conflict (product_id, label) do nothing;

-- Beef Curry Cut  (beef → Beef)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Beef Curry Cut',
    'Mixed beef curry cut with both bone-in and boneless pieces from shoulder and shank. Rich in collagen for deep-flavored curry gravies.',
    449,
    '/Images/Meat Images/Beef/Beef Curry Cut.jpg',
    array['/Images/Meat Images/Beef/Beef Curry Cut.jpg']::text[],
    'Beef',
    '500g',
    24.5,
    13,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Beef Curry Cut'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'beef',
  'Curry Cut',
  'With Bone',
  '100% Antibiotic-Free',
  230,
  0,
  2.4,
  50,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 449, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Beef Curry Cut'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '1000g', 1000, null,
       1, 869, '5-6 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Beef Curry Cut'))
on conflict (product_id, label) do nothing;

-- Beef Liver  (beef → Beef)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Beef Liver',
    'Fresh beef liver cleaned and sliced, one of the most nutrient-dense foods available. Rich in iron, B12, zinc, and folate.',
    299,
    '/Images/Meat Images/Beef/Beef Liver.webp',
    array['/Images/Meat Images/Beef/Beef Liver.webp']::text[],
    'Beef',
    '500g',
    29,
    5,
    'Refrigerate at 0-4°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Beef Liver'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'beef',
  'Offal',
  'Boneless',
  '100% Antibiotic-Free',
  175,
  4,
  11,
  15,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 299, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Beef Liver'))
on conflict (product_id, label) do nothing;

-- Beef Mince  (beef → Beef)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Beef Mince',
    'Freshly ground beef with a balanced lean-to-fat ratio. No fillers or additives. Ideal for burgers, keema curries, meatballs, and shepherd''s pie.',
    519,
    '/Images/Meat Images/Beef/Beef Mince.jpg',
    array['/Images/Meat Images/Beef/Beef Mince.jpg']::text[],
    'Beef',
    '500g',
    26.5,
    14,
    'Refrigerate at 0-4°C. Use within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Beef Mince'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'beef',
  'Mince',
  'Boneless',
  '100% Antibiotic-Free',
  235,
  0,
  null,
  20,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g', 500, null,
       1, 519, '3-4 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Beef Mince'))
on conflict (product_id, label) do nothing;

-- Beef Shank  (beef → Beef)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Beef Shank',
    'Cross-cut beef shank with rich marrow bone and tough connective tissue that transforms into silky gelatin after slow-cooking. A classic for braised dishes.',
    549,
    '/Images/Meat Images/Beef/Beef Shank.jpg',
    array['/Images/Meat Images/Beef/Beef Shank.jpg']::text[],
    'Beef',
    '500g (2-3 Pieces)',
    28,
    12.5,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Beef Shank'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'beef',
  'Shank',
  'With Bone',
  '100% Antibiotic-Free',
  242,
  0,
  3,
  120,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (2-3 Pieces)', 500, null,
       1, 549, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Beef Shank'))
on conflict (product_id, label) do nothing;

-- Ribeye Steak  (beef → Beef)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Ribeye Steak',
    'Premium ribeye steak cut from the upper rib section with exceptional intramuscular fat marbling. Pan-sear to a perfect medium-rare for melt-in-your-mouth results.',
    999,
    '/Images/Meat Images/Beef/Ribeye Steak.jpg',
    array['/Images/Meat Images/Beef/Ribeye Steak.jpg']::text[],
    'Beef',
    '250g (1 Steak)',
    26,
    21,
    'Refrigerate at 0-4°C. Best cooked fresh.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Ribeye Steak'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'beef',
  'Steak',
  'Boneless',
  '100% Antibiotic-Free',
  291,
  0,
  2.8,
  15,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '250g (1 Steak)', 250, null,
       1, 999, '1 Person', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Ribeye Steak'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (2 Steaks)', 500, null,
       1, 1899, '2 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Ribeye Steak'))
on conflict (product_id, label) do nothing;

-- Sirloin Steak  (beef → Beef)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Sirloin Steak',
    'Well-aged sirloin steak, leaner than ribeye with a firm texture and beefy flavour. Perfect for quick pan searing or grilling.',
    849,
    '/Images/Meat Images/Beef/Sirloin Steak.jpg',
    array['/Images/Meat Images/Beef/Sirloin Steak.jpg']::text[],
    'Beef',
    '250g (1 Steak)',
    30,
    9,
    'Refrigerate at 0-4°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Sirloin Steak'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'beef',
  'Steak',
  'Boneless',
  '100% Antibiotic-Free',
  207,
  0,
  2.5,
  12,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '250g (1 Steak)', 250, null,
       1, 849, '1 Person', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Sirloin Steak'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (2 Steaks)', 500, null,
       1, 1599, '2 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Sirloin Steak'))
on conflict (product_id, label) do nothing;

-- T-Bone Steak  (beef → Beef)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'T-Bone Steak',
    'Impressive T-bone steak featuring two premium cuts (strip and tenderloin) separated by the T-shaped bone. A showstopper for any steak lover.',
    1099,
    '/Images/Meat Images/Beef/T-Bone Steak.jpg',
    array['/Images/Meat Images/Beef/T-Bone Steak.jpg']::text[],
    'Beef',
    'Approx. 350-400g (1 T-Bone)',
    28,
    18,
    'Refrigerate at 0-4°C. Best cooked fresh.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('T-Bone Steak'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'beef',
  'Steak',
  'With Bone',
  '100% Antibiotic-Free',
  273,
  0,
  2.7,
  20,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, 'Approx. 350-400g (1 T-Bone)', 400, null,
       1, 1099, '1-2 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('T-Bone Steak'))
on conflict (product_id, label) do nothing;

-- Tenderloin Steak  (beef → Beef)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Tenderloin Steak',
    'Premium centre-cut beef tenderloin, the most tender muscle of the animal. Extremely lean with a mild, buttery flavour. Perfect for pan-sear or oven roast.',
    1249,
    '/Images/Meat Images/Beef/Tenderloin Steak.jpg',
    array['/Images/Meat Images/Beef/Tenderloin Steak.jpg']::text[],
    'Beef',
    '200g (1 Fillet)',
    31,
    8,
    'Refrigerate at 0-4°C. Best cooked fresh.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Tenderloin Steak'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'beef',
  'Steak',
  'Boneless',
  '100% Antibiotic-Free',
  193,
  0,
  2.5,
  15,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '200g (1 Fillet)', 200, null,
       1, 1249, '1 Person', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Tenderloin Steak'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '400g (2 Fillets)', 400, null,
       1, 2399, '2 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Tenderloin Steak'))
on conflict (product_id, label) do nothing;

-- Anchovy  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Anchovy',
    'Small but mighty anchovies packed with Omega-3 fatty acids, calcium, and protein. Best enjoyed crispy fried or as a flavourful addition to gravies.',
    179,
    '/Images/Meat Images/Fish/Anchovy.jpg',
    array['/Images/Meat Images/Fish/Anchovy.jpg']::text[],
    'Fish',
    '500g (Cleaned)',
    20,
    4.8,
    'Refrigerate at 0-4°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Anchovy'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Small Fish',
  'With Bone',
  'Deep Sea Fresh',
  131,
  0,
  3.2,
  20,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Cleaned)', 500, null,
       1, 179, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Anchovy'))
on conflict (product_id, label) do nothing;

-- Crab  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Crab',
    'Fresh crab cleaned and cut for easy cooking. Sweet, succulent flesh with rich roe. Ideal for crab masala, butter garlic crab, and crab curry.',
    549,
    '/Images/Meat Images/Fish/Crab.jpg',
    array['/Images/Meat Images/Fish/Crab.jpg']::text[],
    'Fish',
    '500g (1-2 Crabs)',
    19,
    1.5,
    'Keep chilled at 0-2°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Crab'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Crab',
  'Cleaned & Gutted',
  'Deep Sea Fresh',
  97,
  0,
  null,
  25,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (1-2 Crabs)', 500, 260,
       1, 549, '2 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Crab'))
on conflict (product_id, label) do nothing;

-- Mackerel  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Mackerel',
    'Fresh whole mackerel cleaned and gutted. An affordable and highly nutritious fish packed with Omega-3, B12, and selenium.',
    259,
    '/Images/Meat Images/Fish/Mackerel.jpg',
    array['/Images/Meat Images/Fish/Mackerel.jpg']::text[],
    'Fish',
    '500g (2-3 Fish)',
    24,
    13.9,
    'Keep chilled at 0-2°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Mackerel'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Sea Fish',
  'Cleaned & Gutted',
  'Deep Sea Fresh',
  205,
  0,
  1.6,
  20,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (2-3 Fish)', 500, null,
       1, 259, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Mackerel'))
on conflict (product_id, label) do nothing;

-- Prawns  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Prawns',
    'Farm-fresh prawns peeled, deveined, and cleaned. Ready to marinate and cook in minutes for a protein-rich meal.',
    399,
    '/Images/Meat Images/Fish/Prawns.jpg',
    array['/Images/Meat Images/Fish/Prawns.jpg']::text[],
    'Fish',
    '350g (Cleaned)',
    24,
    1.2,
    'Keep chilled at 0-2°C.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Prawns'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Prawns',
  'Boneless',
  'Deep Sea Fresh',
  105,
  0,
  null,
  10,
  true,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '350g (Cleaned)', 350, 245,
       1, 399, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Prawns'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '700g (Cleaned)', 700, 490,
       1, 749, '4-5 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Prawns'))
on conflict (product_id, label) do nothing;

-- Rohu Fish  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Rohu Fish',
    'Rohu (Labeo rohita) is a sweet, mild freshwater fish, a staple in Indian and Bengali cuisine. Cleaned, descaled, and cut into steaks.',
    229,
    '/Images/Meat Images/Fish/Rohu Fish.jpg',
    array['/Images/Meat Images/Fish/Rohu Fish.jpg']::text[],
    'Fish',
    '500g (Curry Cut)',
    20,
    2.5,
    'Refrigerate at 0-4°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Rohu Fish'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Fresh Water Fish',
  'With Bone',
  'Fresh Water Catch',
  120,
  0,
  null,
  20,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Curry Cut)', 500, null,
       1, 229, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Rohu Fish'))
on conflict (product_id, label) do nothing;

-- Salmon Fillet  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Salmon Fillet',
    'Premium Atlantic salmon fillet, deboned and skin-on. Rich in healthy Omega-3 fatty acids, ideal for pan searing, baking, or sushi-grade sashimi.',
    899,
    '/Images/Meat Images/Fish/Salmon Fillet.jpg',
    array['/Images/Meat Images/Fish/Salmon Fillet.jpg']::text[],
    'Fish',
    '250g Fillet',
    22,
    11,
    'Keep chilled at 0-2°C. Consume within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Salmon Fillet'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Salmon',
  'Cleaned & Gutted',
  'Deep Sea Fresh',
  208,
  0,
  0.8,
  15,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '250g Fillet', 250, null,
       1, 899, '1-2 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Salmon Fillet'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g Fillet', 500, null,
       1, 1749, '2-3 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Salmon Fillet'))
on conflict (product_id, label) do nothing;

-- Sardines  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Sardines',
    'Fresh whole sardines cleaned and ready to cook. A nutritional powerhouse rich in calcium, Omega-3 fatty acids, vitamin D, and B12.',
    199,
    '/Images/Meat Images/Fish/Sardines.jpg',
    array['/Images/Meat Images/Fish/Sardines.jpg']::text[],
    'Fish',
    '500g (Cleaned)',
    24.6,
    10.5,
    'Keep chilled at 0-2°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Sardines'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Sea Fish',
  'Cleaned & Gutted',
  'Deep Sea Fresh',
  191,
  0,
  2.9,
  15,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Cleaned)', 500, null,
       1, 199, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Sardines'))
on conflict (product_id, label) do nothing;

-- Squid  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Squid',
    'Freshly cleaned squid (calamari), whole or rings as preferred. Light, mild flavour that absorbs marinades beautifully. Perfect for calamari, squid masala, and stir-fries.',
    349,
    '/Images/Meat Images/Fish/Squid.jpg',
    array['/Images/Meat Images/Fish/Squid.jpg']::text[],
    'Fish',
    '500g (Cleaned)',
    18,
    1.4,
    'Keep chilled at 0-2°C. Cook within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Squid'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Squid',
  'Cleaned & Gutted',
  'Deep Sea Fresh',
  92,
  3.1,
  null,
  15,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (Cleaned)', 500, null,
       1, 349, '2-3 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Squid'))
on conflict (product_id, label) do nothing;

-- Tuna Steak  (fish → Fish)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Tuna Steak',
    'Fresh tuna loin steak, sashimi-grade quality. Firm, meaty texture with a rich umami flavour. Excellent seared on the outside and pink in the middle.',
    749,
    '/Images/Meat Images/Fish/Tuna Steak.webp',
    array['/Images/Meat Images/Fish/Tuna Steak.webp']::text[],
    'Fish',
    '250g (1 Steak)',
    30,
    1,
    'Keep chilled at 0-2°C. Consume within 24 hours.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Tuna Steak'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'fish',
  'Tuna',
  'Boneless',
  'Deep Sea Fresh',
  144,
  0,
  1.3,
  10,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '250g (1 Steak)', 250, null,
       1, 749, '1-2 Persons', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Tuna Steak'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500g (2 Steaks)', 500, null,
       1, 1449, '2-3 Persons', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Tuna Steak'))
on conflict (product_id, label) do nothing;

-- Duck Eggs  (eggs → Eggs)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Duck Eggs',
    'Farm-fresh duck eggs with a richer yolk and a creamier texture than chicken eggs. Higher in protein and fat, perfect for baking and gourmet breakfasts.',
    149,
    '/Images/Meat Images/Eggs/Duck Eggs.jpg',
    array['/Images/Meat Images/Eggs/Duck Eggs.jpg']::text[],
    'Eggs',
    '6 Duck Eggs',
    8.9,
    9.6,
    'Refrigerate. Use within 2 weeks.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Duck Eggs'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'eggs',
  'Duck Eggs',
  'Whole',
  'Organic Farm',
  130,
  1,
  2.7,
  10,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '6 Duck Eggs', 480, null,
       1, 149, '6 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Duck Eggs'))
on conflict (product_id, label) do nothing;

-- Egg White Pack  (eggs → Eggs)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Egg White Pack',
    'Pasteurized liquid egg whites with zero yolks and zero fat. Perfect for protein shakes, omelettes, and fitness-focused meal prep.',
    129,
    '/Images/Meat Images/Eggs/Egg White Pack.jpg',
    array['/Images/Meat Images/Eggs/Egg White Pack.jpg']::text[],
    'Eggs',
    '500ml Pack (Approx. 15 Whites)',
    3.6,
    0,
    'Refrigerate. Use within 5 days of opening.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Egg White Pack'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'eggs',
  'Egg White',
  'Whole',
  'Organic Farm',
  17,
  0.2,
  null,
  2,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '500ml Pack (Approx. 15 Whites)', 500, null,
       1, 129, '10-15 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Egg White Pack'))
on conflict (product_id, label) do nothing;

-- Farm Fresh Eggs  (eggs → Eggs)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Farm Fresh Eggs',
    'Farm-raised fresh white eggs from healthy hens fed balanced grain diets. Strictly quality inspected with clean shells. A daily protein staple.',
    89,
    '/Images/Meat Images/Eggs/Farm Fresh Eggs.webp',
    array['/Images/Meat Images/Eggs/Farm Fresh Eggs.webp']::text[],
    'Eggs',
    '12 Eggs Pack',
    6.3,
    4.8,
    'Store in egg tray inside refrigerator.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Farm Fresh Eggs'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'eggs',
  'White Eggs',
  'Whole',
  'Organic Farm',
  72,
  0.4,
  null,
  5,
  true,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '12 Eggs Pack', 600, null,
       1, 89, '12 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Farm Fresh Eggs'))
on conflict (product_id, label) do nothing;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '30 Eggs Tray', 1500, null,
       1, 219, '30 Servings', null, 1
from public.products p
where lower(trim(p.name)) = lower(trim('Farm Fresh Eggs'))
on conflict (product_id, label) do nothing;

-- Quail Eggs  (eggs → Eggs)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Quail Eggs',
    'Farm-raised quail eggs, a gourmet delicacy with a high protein-to-size ratio. Rich in vitamins A, B12, and iron. Great boiled, fried, or pickled.',
    119,
    '/Images/Meat Images/Eggs/Quail.jpg',
    array['/Images/Meat Images/Eggs/Quail.jpg']::text[],
    'Eggs',
    '12 Quail Eggs',
    1.2,
    1,
    'Refrigerate. Use within 1 week.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Quail Eggs'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'eggs',
  'Quail Eggs',
  'Whole',
  'Organic Farm',
  14,
  0.04,
  0.3,
  5,
  false,
  true,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '12 Quail Eggs', 120, null,
       1, 119, '6-12 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Quail Eggs'))
on conflict (product_id, label) do nothing;

-- Avocado  (healthy-addons → Healthy Add-ons)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Avocado',
    'Hand-picked ripe avocados, rich in heart-healthy oleic acid, fibre, potassium, and vitamins E and K. Perfect paired with protein meals.',
    99,
    '/Images/Meat Images/Healthy Add-ons/Avocado.jpg',
    array['/Images/Meat Images/Healthy Add-ons/Avocado.jpg']::text[],
    'Healthy Add-ons',
    '2 Avocados (Approx. 300g)',
    2,
    14.7,
    'Store at room temperature until ripe, then refrigerate.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Avocado'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'healthy-addons',
  'Healthy Fats',
  'Whole',
  'Organic Farm',
  160,
  8.6,
  null,
  2,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '2 Avocados (Approx. 300g)', 300, null,
       1, 99, '2 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Avocado'))
on conflict (product_id, label) do nothing;

-- Bell Peppers  (healthy-addons → Healthy Add-ons)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Bell Peppers',
    'Colourful mixed bell peppers (red, yellow, green) rich in Vitamin C, antioxidants, and beta-carotene. Great for stir-fries, grills, and salads alongside your protein.',
    69,
    '/Images/Meat Images/Healthy Add-ons/Bell Peppers.webp',
    array['/Images/Meat Images/Healthy Add-ons/Bell Peppers.webp']::text[],
    'Healthy Add-ons',
    '300g (3 Peppers)',
    1,
    0.3,
    'Refrigerate in crisper drawer. Use within 1 week.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Bell Peppers'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'healthy-addons',
  'Vegetables',
  'Whole',
  'Organic Farm',
  31,
  6,
  null,
  5,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '300g (3 Peppers)', 300, null,
       1, 69, '3-4 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Bell Peppers'))
on conflict (product_id, label) do nothing;

-- Broccoli  (healthy-addons → Healthy Add-ons)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Broccoli',
    'Crisp fresh broccoli, one of the most nutrient-dense vegetables. Excellent source of Vitamin C, K, folate, and fibre. A perfect gym-meal pairing.',
    59,
    '/Images/Meat Images/Healthy Add-ons/Broccoli.jpg',
    array['/Images/Meat Images/Healthy Add-ons/Broccoli.jpg']::text[],
    'Healthy Add-ons',
    '300g (1 Head)',
    2.8,
    0.4,
    'Refrigerate. Use within 3-4 days.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Broccoli'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'healthy-addons',
  'Vegetables',
  'Whole',
  'Organic Farm',
  34,
  6.6,
  0.7,
  5,
  true,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '300g (1 Head)', 300, null,
       1, 59, '2-3 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Broccoli'))
on conflict (product_id, label) do nothing;

-- Cherry Tomato  (healthy-addons → Healthy Add-ons)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Cherry Tomato',
    'Vine-ripened cherry tomatoes, naturally sweet and packed with lycopene, Vitamin C, and antioxidants. A great fresh addition to any protein meal.',
    49,
    '/Images/Meat Images/Healthy Add-ons/Cherry Tomato.jpg',
    array['/Images/Meat Images/Healthy Add-ons/Cherry Tomato.jpg']::text[],
    'Healthy Add-ons',
    '250g Pack',
    0.9,
    0.2,
    'Store at room temperature. Refrigerate once cut.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Cherry Tomato'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'healthy-addons',
  'Vegetables',
  'Whole',
  'Organic Farm',
  18,
  3.9,
  null,
  2,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '250g Pack', 250, null,
       1, 49, '3-4 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Cherry Tomato'))
on conflict (product_id, label) do nothing;

-- Cucumber  (healthy-addons → Healthy Add-ons)
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    'Cucumber',
    'Fresh garden cucumbers, 96% water content. Low in calories and high in hydration. Great as a raw snack, in salads, raita, or as a cooling side to spicy meat dishes.',
    29,
    '/Images/Meat Images/Healthy Add-ons/Cucumber.webp',
    array['/Images/Meat Images/Healthy Add-ons/Cucumber.webp']::text[],
    'Healthy Add-ons',
    '2 Cucumbers (Approx. 400g)',
    0.7,
    0.1,
    'Refrigerate. Use within 5 days.',
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim('Cucumber'))
  )
  returning id
)
insert into public.igo_product_web_meta (
  product_id, website_category, subcategory, bone_type, freshness_grade,
  calories_per_100g, carbs_per_100g, iron_per_100g, prep_time_minutes,
  is_best_seller, is_today_fresh, is_flash_offer, added_by_website
)
select
  inserted.id,
  'healthy-addons',
  'Vegetables',
  'Whole',
  'Organic Farm',
  16,
  3.6,
  null,
  2,
  false,
  false,
  false,
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;

insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, '2 Cucumbers (Approx. 400g)', 400, null,
       1, 29, '3-4 Servings', null, 0
from public.products p
where lower(trim(p.name)) = lower(trim('Cucumber'))
on conflict (product_id, label) do nothing;

commit;

-- ============================================================================
-- VERIFY
-- ============================================================================
-- How many products exist now, by category:
--   select category, count(*) from public.products group by category order by 1;
--
-- Which products this file added:
--   select p.name, p.category, p.price
--   from public.products p
--   join public.igo_product_web_meta m on m.product_id = p.id
--   where m.added_by_website = true
--   order by p.category, p.name;
-- ============================================================================
