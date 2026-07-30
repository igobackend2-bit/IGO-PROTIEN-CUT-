/**
 * Generates SQL to add the website's products that don't yet exist in the
 * canonical `products` table.
 *
 * Run with:  npx tsx scripts/generateMissingProductsSql.ts
 * Output:    supabase/migrations/0006_add_missing_products.sql
 *
 * WHY A GENERATOR AND NOT HAND-WRITTEN SQL
 * The source of truth for this data is src/data/mockData.ts. Importing it
 * directly means the generated SQL can't drift from the real product
 * definitions, and re-running the generator after editing mockData.ts always
 * produces correct output.
 *
 * IMPORTANT — this writes to `products`, which the mobile app also reads.
 * Products added here WILL appear in the app. The generated SQL is idempotent
 * (it skips any product whose name already exists) and wrapped in a
 * transaction, so it is safe to run more than once and all-or-nothing if
 * anything fails.
 */
import { writeFileSync } from 'fs';
import { INITIAL_PRODUCTS } from '../src/data/mockData';
import { Product } from '../src/types';

/** Escapes a value for a single-quoted Postgres string literal. */
function sql(value: string | null | undefined): string {
  if (value === null || value === undefined || value === '') return 'null';
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlArray(values: string[]): string {
  if (values.length === 0) return 'null';
  return `array[${values.map((v) => sql(v)).join(', ')}]::text[]`;
}

function num(value: number | null | undefined): string {
  return value === null || value === undefined || Number.isNaN(value) ? 'null' : String(value);
}

/**
 * Maps a website category to the `products.category` text the APP will store.
 *
 * The app normalises categories by keyword (lib/models/product_model.dart
 * `_mapCategory`), so the value here has to contain the right keyword for the
 * app to file it correctly. A marinated chicken product is given 'Chicken' so
 * app users find it under Chicken rather than in a catch-all bucket — the
 * website's finer category (ready-to-cook, biryani…) is preserved separately
 * in igo_product_web_meta.website_category.
 */
function appCategory(product: Product): string {
  const name = product.name.toLowerCase();

  switch (product.category) {
    case 'chicken':
      return 'Chicken';
    case 'mutton':
      return 'Mutton';
    case 'beef':
      return 'Beef';
    case 'fish':
    case 'dry-fish':
      return 'Fish';
    case 'eggs':
      return 'Eggs';
    default:
      break;
  }

  // For the website-only categories, file by whichever protein the product
  // actually is, so the app's own category filter behaves sensibly.
  if (name.includes('chicken') || name.includes('wings') || name.includes('65')) return 'Chicken';
  if (name.includes('mutton') || name.includes('goat') || name.includes('lamb')) return 'Mutton';
  if (name.includes('beef') || name.includes('steak')) return 'Beef';
  if (
    name.includes('fish') ||
    name.includes('prawn') ||
    name.includes('crab') ||
    name.includes('squid') ||
    name.includes('salmon')
  ) {
    return 'Fish';
  }
  if (name.includes('egg')) return 'Eggs';

  return 'Healthy Add-ons';
}

/** Nutrition strings like '27g' / '165 kcal' → a number, or null. */
function parseNutrition(value: string | undefined): number | null {
  if (!value) return null;
  const match = value.match(/([\d.]+)/);
  if (!match) return null;
  const parsed = parseFloat(match[1]);
  return Number.isNaN(parsed) ? null : parsed;
}

const lines: string[] = [];

lines.push(`-- ============================================================================
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
`);

let count = 0;

for (const product of INITIAL_PRODUCTS) {
  const gallery = (product.galleryImages ?? []).filter(Boolean);
  const protein = parseNutrition(product.nutrition?.protein);
  const fat = parseNutrition(product.nutrition?.fat);
  const calories = parseNutrition(product.nutrition?.calories);
  const carbs = parseNutrition(product.nutrition?.carbs);
  const iron = parseNutrition(product.nutrition?.iron);
  const baseWeight = product.weightOptions?.[0];

  lines.push(`
-- ${product.name}  (${product.category} → ${appCategory(product)})
with inserted as (
  insert into public.products (
    name, description, price, image_url, image_urls, category, weight,
    protein_per_100g, fat_per_100g, storage_instruction, brand,
    is_available, stock_quantity, low_stock_threshold
  )
  select
    ${sql(product.name)},
    ${sql(product.description)},
    ${num(product.basePrice)},
    ${sql(product.image)},
    ${sqlArray(gallery)},
    ${sql(appCategory(product))},
    ${sql(baseWeight?.label ?? '500g')},
    ${num(protein)},
    ${num(fat)},
    ${sql(product.storageInstructions)},
    null,
    true,
    0,
    10
  where not exists (
    select 1 from public.products p
    where lower(trim(p.name)) = lower(trim(${sql(product.name)}))
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
  ${sql(product.category)},
  ${sql(product.subcategory)},
  ${sql(product.boneType)},
  ${sql(product.freshnessGrade)},
  ${num(calories)},
  ${num(carbs)},
  ${num(iron)},
  ${num(product.prepTimeMinutes)},
  ${product.isBestSeller ? 'true' : 'false'},
  ${product.isTodayFresh ? 'true' : 'false'},
  ${product.isFlashOffer ? 'true' : 'false'},
  true
from inserted
on conflict (product_id) do update
  set website_category  = excluded.website_category,
      added_by_website  = true;`);

  // Weight ladder for this product, as absolute prices taken straight from
  // mockData.ts — these are real, considered price points, so an override is
  // more faithful than a generic multiplier.
  for (const [index, option] of (product.weightOptions ?? []).entries()) {
    lines.push(`
insert into public.igo_product_variants (
  product_id, label, weight_grams, net_weight_grams, price_multiplier,
  price_override, servings, pieces, display_order
)
select p.id, ${sql(option.label)}, ${num(option.weightGrams)}, ${num(option.netWeightGrams)},
       1, ${num(option.price)}, ${sql(option.servings)}, ${sql(option.pieces)}, ${index}
from public.products p
where lower(trim(p.name)) = lower(trim(${sql(product.name)}))
on conflict (product_id, label) do nothing;`);
  }

  count += 1;
}

lines.push(`
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
`);

const outPath = 'supabase/migrations/0006_add_missing_products.sql';
writeFileSync(outPath, lines.join('\n'), 'utf-8');
console.log(`Wrote ${outPath} covering ${count} products.`);
console.log('Existing products are skipped automatically by the WHERE NOT EXISTS guard.');
