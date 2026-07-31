import {
  Product,
  ProductCategory,
  ProductWeightOption,
  ProductNutrition
} from '../../types';

/**
 * THE SINGLE TRANSLATION POINT between the canonical, admin-owned `products`
 * table and the website's much richer `Product` type.
 *
 * Three sources are combined:
 *   1. `products`               — admin-owned. Price, stock, availability,
 *                                 name, images, category. READ ONLY.
 *   2. `igo_product_variants`   — website-owned. The weight ladder.
 *   3. `igo_product_web_meta`   — website-owned. Presentation + SEO fields.
 *
 * If the canonical schema ever changes, THIS FILE is the only place that
 * needs updating. Nothing else in the website should know the shape of a
 * `products` row.
 *
 * Every field the app's own `product_model.dart` treats as optional is
 * treated as optional here too, with the same spirit: derive an honest
 * fallback, never fabricate a specific claim about a product.
 */

/**
 * Shown when a product has no image in the database. Never an empty string —
 * `<img src="">` makes the browser re-fetch the whole page.
 */
export const PLACEHOLDER_IMAGE = '/Images/protein-cuts-logo.jpg';

// ── Row shapes as they come back from PostgREST ─────────────────────────────

export interface ProductRow {
  id: string;
  name: string | null;
  description: string | null;
  price: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  category: string | null;
  weight: string | null;
  protein_per_100g: number | null;
  fat_per_100g: number | null;
  storage_instruction: string | null;
  brand: string | null;
  is_available: boolean | null;
  ingredients: string | null;
  cooking_tips: string | null;
  recipe_ideas: string | null;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  created_at?: string | null;
}

export interface VariantRow {
  id: string;
  product_id: string;
  label: string;
  weight_grams: number;
  net_weight_grams: number | null;
  price_multiplier: number | null;
  price_override: number | null;
  servings: string | null;
  pieces: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

export interface WebMetaRow {
  product_id: string;
  /**
   * The website's own fine-grained category (ready-to-cook, biryani,
   * combo-packs…). `products.category` only carries the app's six coarse
   * buckets, so this preserves the website's merchandising without needing a
   * column on the app's table. Takes precedence over the derived category.
   */
  website_category: string | null;
  subcategory: string | null;
  bone_type: string | null;
  freshness_grade: string | null;
  calories_per_100g: number | null;
  carbs_per_100g: number | null;
  iron_per_100g: number | null;
  prep_time_minutes: number | null;
  recipe_pairing: string | null;
  /**
   * Promotional list price, shown struck through. Null (the default) means no
   * discount is advertised — see 0013_product_list_price.sql.
   */
  original_price: number | null;
  slug: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_best_seller: boolean | null;
  is_today_fresh: boolean | null;
  is_flash_offer: boolean | null;
}

export interface ReviewAggregate {
  rating: number;
  count: number;
}

// ── Category mapping ────────────────────────────────────────────────────────

/**
 * Mirrors `Product._mapCategory` in the app's lib/models/product_model.dart,
 * then converts to the website's lowercase slug form. Keeping the same
 * normalization rules means app and website always agree on which category a
 * product belongs to, even though `products.category` is free text.
 */
export function mapCategory(dbCategory: string | null): ProductCategory {
  const lower = (dbCategory ?? '').toLowerCase().trim();

  if (lower.includes('chicken')) return 'chicken';
  if (lower.includes('beef') || lower.includes('steak')) return 'beef';
  if (lower.includes('mutton') || lower.includes('lamb')) return 'mutton';
  if (
    lower.includes('fish') ||
    lower.includes('seafood') ||
    lower.includes('salmon') ||
    lower.includes('prawn') ||
    lower.includes('crab')
  ) {
    return 'fish';
  }
  if (lower.includes('egg')) return 'eggs';
  if (lower.includes('combo')) return 'combo-packs';
  if (lower.includes('ready') || lower.includes('marinade')) return 'ready-to-cook';
  if (lower.includes('biryani')) return 'biryani';
  if (lower.includes('frozen')) return 'frozen-food';
  if (lower.includes('cold')) return 'cold-cuts';
  if (lower.includes('dry')) return 'dry-fish';

  return 'healthy-addons';
}

/** Every valid website category slug, used to validate `website_category`. */
const WEBSITE_CATEGORIES: ProductCategory[] = [
  'chicken',
  'mutton',
  'beef',
  'fish',
  'dry-fish',
  'eggs',
  'ready-to-cook',
  'combo-packs',
  'subscription',
  'healthy-addons',
  'frozen-food',
  'biryani',
  'cold-cuts'
];

function isWebsiteCategory(value: string | null | undefined): boolean {
  return typeof value === 'string' && WEBSITE_CATEGORIES.includes(value as ProductCategory);
}

/** Reverse map — website slug → the `products.category` values to match on. */
export function categoryToDbFilters(category: ProductCategory): string[] {
  switch (category) {
    case 'chicken':
      return ['Chicken'];
    case 'beef':
      return ['Beef'];
    case 'mutton':
      return ['Mutton'];
    case 'fish':
      return ['Fish', 'Seafood'];
    case 'eggs':
      return ['Eggs'];
    default:
      return ['Healthy Add-ons'];
  }
}

// ── Small helpers ───────────────────────────────────────────────────────────

/** Parses '500g' / '1kg' / '1.5 kg' into grams. Returns null if unparseable. */
export function parseWeightToGrams(weight: string | null): number | null {
  if (!weight) return null;
  const match = weight.toLowerCase().replace(/\s+/g, '').match(/([\d.]+)(kg|g)/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (Number.isNaN(value)) return null;
  return match[2] === 'kg' ? Math.round(value * 1000) : Math.round(value);
}

/**
 * Availability.
 *
 * `is_available` is the admin's explicit on/off switch for a product and is
 * treated as the source of truth for whether it can be bought — the same
 * signal the mobile app's Product model uses.
 *
 * `stock_quantity` is inventory, and it is only used to *narrow* an available
 * product to "Limited Stock". A zero count on an available product means
 * inventory tracking simply isn't in use for it, NOT that the shop has sold
 * out — every row in the live catalog currently sits at 0. Treating 0 as
 * out-of-stock would take the entire website offline while `is_available`
 * says otherwise.
 *
 * Once you start recording stock through the admin's Inventory module, set a
 * product's `is_available` to false to take it off sale; the low-stock banner
 * then appears automatically as the count falls to the threshold.
 */
function toStockStatus(qty: number, isAvailable: boolean, lowThreshold: number): Product['stockStatus'] {
  if (!isAvailable) return 'Out of Stock';
  if (qty > 0 && qty <= lowThreshold) return 'Limited Stock';
  return 'In Stock';
}

function firstSentence(text: string | null, fallback: string): string {
  if (!text) return fallback;
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  const stop = trimmed.indexOf('. ');
  return stop > 0 ? trimmed.slice(0, stop + 1) : trimmed;
}

/**
 * The app stores ingredients/cooking_tips/recipe_ideas as free text, while
 * the website's UI wants a list. Split on newlines or bullet characters, and
 * fall back to a single-item list.
 */
function splitToList(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n|•|•|;/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const FRESHNESS_VALUES: Product['freshnessGrade'][] = [
  '100% Antibiotic-Free',
  'Fresh Water Catch',
  'Deep Sea Fresh',
  'Organic Farm',
  'Chilled 0-4°C'
];

const BONE_VALUES: Product['boneType'][] = [
  'Boneless',
  'With Bone',
  'Cleaned & Gutted',
  'Whole'
];

function coerceFreshness(
  value: string | null,
  category: ProductCategory
): Product['freshnessGrade'] {
  const match = FRESHNESS_VALUES.find((v) => v === value);
  if (match) return match;
  // Honest category-based default rather than an invented per-product claim.
  if (category === 'fish' || category === 'dry-fish') return 'Deep Sea Fresh';
  if (category === 'eggs') return 'Organic Farm';
  if (category === 'chicken') return '100% Antibiotic-Free';
  return 'Chilled 0-4°C';
}

function coerceBoneType(value: string | null, category: ProductCategory): Product['boneType'] {
  const match = BONE_VALUES.find((v) => v === value);
  if (match) return match;
  if (category === 'fish') return 'Cleaned & Gutted';
  if (category === 'eggs') return 'Whole';
  return 'With Bone';
}

// ── Weight options ──────────────────────────────────────────────────────────

/**
 * Builds the website's weight ladder.
 *
 * Price rule (see 0004_website_support.sql):
 *   effective = price_override ?? (products.price × price_multiplier)
 *
 * The multiplier is the default so that an admin price edit propagates to
 * every weight automatically and the website can never silently drift from
 * the admin. `price_override` is the escape hatch for exact price points.
 *
 * When a product has no variant rows at all, we synthesise a single option
 * from `products.weight` + `products.price` — i.e. the website behaves
 * exactly like the app for that product. Never an empty array, because the
 * cart and PDP both assume at least one option exists.
 */
export function buildWeightOptions(
  row: ProductRow,
  variants: VariantRow[]
): ProductWeightOption[] {
  const basePrice = Number(row.price ?? 0);

  const active = variants
    .filter((v) => v.is_active !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  if (active.length === 0) {
    const grams = parseWeightToGrams(row.weight) ?? 500;
    return [
      {
        label: row.weight ?? '500g',
        weightGrams: grams,
        price: Math.round(basePrice),
        originalPrice: Math.round(basePrice),
        servings: gramsToServings(grams)
      }
    ];
  }

  return active.map((v) => {
    const multiplier = Number(v.price_multiplier ?? 1);
    const override = v.price_override === null ? null : Number(v.price_override);
    const price = Math.round(override ?? basePrice * multiplier);

    return {
      label: v.label,
      weightGrams: v.weight_grams,
      price,
      // No canonical "list price" column exists, so originalPrice mirrors
      // price. Discounts are surfaced through the `offers` table instead of
      // an invented strike-through number.
      originalPrice: price,
      servings: v.servings ?? gramsToServings(v.weight_grams),
      ...(v.pieces ? { pieces: v.pieces } : {}),
      ...(v.net_weight_grams !== null && v.net_weight_grams !== undefined
        ? { netWeightGrams: v.net_weight_grams }
        : {})
    };
  });
}

function gramsToServings(grams: number): string {
  const servings = Math.max(1, Math.round(grams / 250));
  return servings === 1 ? 'Serves 1' : `Serves ${servings}`;
}

// ── Nutrition ───────────────────────────────────────────────────────────────

function buildNutrition(row: ProductRow, meta: WebMetaRow | null): ProductNutrition {
  const fmt = (value: number | null | undefined, unit: string): string =>
    value === null || value === undefined ? '—' : `${value}${unit}`;

  return {
    protein: fmt(row.protein_per_100g, 'g'),
    fat: fmt(row.fat_per_100g, 'g'),
    calories: fmt(meta?.calories_per_100g, ' kcal'),
    carbs: fmt(meta?.carbs_per_100g, 'g'),
    ...(meta?.iron_per_100g !== null && meta?.iron_per_100g !== undefined
      ? { iron: `${meta.iron_per_100g}mg` }
      : {})
  };
}

// ── The adapter ─────────────────────────────────────────────────────────────

export function toWebsiteProduct(
  row: ProductRow,
  variants: VariantRow[] = [],
  meta: WebMetaRow | null = null,
  reviews: ReviewAggregate | null = null
): Product {
  // Prefer the website's own category when one has been recorded — it's more
  // specific than the app's six buckets (e.g. 'ready-to-cook' rather than the
  // 'Chicken' the app files marinated chicken under).
  const category = isWebsiteCategory(meta?.website_category)
    ? (meta!.website_category as ProductCategory)
    : mapCategory(row.category);
  const weightOptions = buildWeightOptions(row, variants);
  const basePrice = weightOptions[0]?.price ?? Math.round(Number(row.price ?? 0));

  const stockQuantity = Number(row.stock_quantity ?? 0);
  const isAvailable = row.is_available !== false;
  const lowThreshold = Number(row.low_stock_threshold ?? 10);

  // Some catalog rows have no image_url yet. Passing '' to an <img src> makes
  // the browser re-request the current page, so fall back to the brand mark
  // rather than emitting an empty string. Fix the real cause by uploading a
  // photo for that product in the admin dashboard.
  const gallery = (row.image_urls ?? []).filter(
    (url): url is string => typeof url === 'string' && url.trim().length > 0
  );
  const rawPrimary = row.image_url?.trim();
  const primaryImage =
    rawPrimary && rawPrimary.length > 0 ? rawPrimary : gallery[0] ?? PLACEHOLDER_IMAGE;

  const description = row.description ?? '';

  // Only treat it as a discount if the list price is genuinely higher.
  const rawListPrice = meta?.original_price ?? null;
  const hasDiscount = rawListPrice !== null && rawListPrice > basePrice;
  const listPrice = hasDiscount ? Math.round(rawListPrice) : basePrice;
  const discountPercentage = hasDiscount
    ? Math.round((1 - basePrice / rawListPrice) * 100)
    : 0;

  return {
    id: row.id,
    name: row.name ?? 'Unnamed product',
    category,
    subcategory: meta?.subcategory ?? row.category ?? '',
    description,
    shortDescription: firstSentence(description, row.brand ?? ''),

    basePrice,
    // A discount is advertised ONLY when the admin has set a list price above
    // the selling price. Otherwise originalPrice mirrors basePrice, and the UI
    // suppresses both the strikethrough and the badge — rather than rendering
    // "₹649 ₹649 0% OFF", which is what happened before 0013.
    originalPrice: listPrice,
    discountPercentage,

    image: primaryImage,
    galleryImages: gallery.length > 0 ? gallery : primaryImage ? [primaryImage] : [],

    weightOptions,
    nutrition: buildNutrition(row, meta),

    freshnessGrade: coerceFreshness(meta?.freshness_grade ?? null, category),
    boneType: coerceBoneType(meta?.bone_type ?? null, category),

    isBestSeller: meta?.is_best_seller ?? false,
    isTodayFresh: meta?.is_today_fresh ?? false,
    isFlashOffer: meta?.is_flash_offer ?? false,

    stockStatus: toStockStatus(stockQuantity, isAvailable, lowThreshold),
    stockQuantity,

    // Real aggregates from `product_reviews` when available. Zero, not a
    // flattering placeholder, when a product has no reviews yet.
    rating: reviews?.rating ?? 0,
    reviewCount: reviews?.count ?? 0,

    prepTimeMinutes: meta?.prep_time_minutes ?? 20,
    storageInstructions:
      row.storage_instruction ?? 'Keep refrigerated at 0-4°C. Consume within 2 days of delivery.',
    ...(meta?.recipe_pairing ? { recipePairing: meta.recipe_pairing } : {}),

    // Individual review rows are fetched on demand by the PDP, not bundled
    // into every catalog row — 83 products × N reviews would be a large
    // payload for a listing page that only renders the average.
    reviews: []
  };
}

/** Convenience: the extra free-text fields the PDP renders as lists. */
export function extractProductLists(row: ProductRow) {
  return {
    ingredients: splitToList(row.ingredients),
    cookingTips: splitToList(row.cooking_tips),
    recipeIdeas: splitToList(row.recipe_ideas)
  };
}
