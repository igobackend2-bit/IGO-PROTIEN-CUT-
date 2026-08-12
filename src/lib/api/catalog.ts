import { supabase, isSupabaseConfigured } from '../supabase';
import {
  ProductRow,
  VariantRow,
  WebMetaRow,
  ReviewAggregate,
  toWebsiteProduct
} from '../adapters/productAdapter';
import { Product, Coupon } from '../../types';

/**
 * CATALOG READS — all against canonical, ADMIN-OWNED tables.
 *
 * Every table read here already has a `for select using (true)` RLS policy
 * created by the app's own migrations (phase15_offers.sql, phase16_support.sql,
 * phase18_admin.sql), which is why the anon key is sufficient and why no
 * backend change was required to make this work. The Flutter app reads
 * `products` exactly this way in lib/services/product_service.dart.
 *
 * NOTHING IN THIS FILE WRITES. The admin dashboard is the only writer for
 * products, categories, coupons, offers and combo packs. If you ever find
 * yourself adding an insert/update here, stop — it belongs in the admin.
 */

// ── Response types ──────────────────────────────────────────────────────────

export interface CategoryRow {
  id: string;
  name: string;
  emoji: string | null;
  display_order: number;
  is_active: boolean;
}

export interface OfferRow {
  id: string;
  type: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
  priority: number;
  active: boolean;
  banner_image_url: string | null;
  coupon_code: string | null;
  min_order_value: number | null;
  product_id: string | null;
  category: string | null;
  total_quantity: number | null;
  remaining_quantity: number | null;
}

export interface ComboPackRow {
  id: string;
  title: string;
  description: string | null;
  discount: number;
  bundle_type: string;
  pick_count: number | null;
  banner_image_url: string | null;
  active: boolean;
  combo_pack_items: { id: string; product_id: string; quantity: number }[];
}

export interface FaqRow {
  id: string;
  category: string;
  question: string;
  answer: string;
  priority: number;
}

// ── Products ────────────────────────────────────────────────────────────────

const PRODUCT_COLUMNS =
  'id, name, description, price, image_url, image_urls, category, weight, ' +
  'protein_per_100g, fat_per_100g, storage_instruction, brand, is_available, ' +
  'ingredients, cooking_tips, recipe_ideas, stock_quantity, low_stock_threshold, created_at';

/**
 * Fetches the whole catalog and assembles website `Product` objects.
 *
 * Three queries rather than one nested select, because the variant and meta
 * tables are website-owned (`igo_*`) and deliberately have no foreign key to
 * `products` — so PostgREST can't embed them. Three flat queries is also
 * faster here than a nested join across ~100 rows.
 *
 * Returns `null` (not an empty array) when Supabase isn't configured or the
 * query fails, so callers can distinguish "no backend" from "empty catalog"
 * and fall back to local data instead of rendering an empty shop.
 */
export async function fetchCatalog(): Promise<Product[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [productsRes, variantsRes, metaRes, reviewsRes] = await Promise.all([
      supabase
        .from('products')
        .select(PRODUCT_COLUMNS)
        .order('created_at', { ascending: false }),
      supabase.from('igo_product_variants').select('*'),
      supabase.from('igo_product_web_meta').select('*'),
      supabase.from('product_reviews').select('product_id, rating').eq('is_hidden', false)
    ]);

    if (productsRes.error) {
      console.error('[catalog] products query failed:', productsRes.error.message);
      return null;
    }

    const rows = (productsRes.data ?? []) as unknown as ProductRow[];
    if (rows.length === 0) return [];

    // Variants / meta / reviews are non-fatal — a missing igo_* table (i.e.
    // migration 0004 not yet run) degrades to app-identical single-weight
    // products rather than breaking the catalog entirely.
    const variants = (variantsRes.error ? [] : (variantsRes.data ?? [])) as VariantRow[];
    const metas = (metaRes.error ? [] : (metaRes.data ?? [])) as WebMetaRow[];
    const reviews = (reviewsRes.error ? [] : (reviewsRes.data ?? [])) as {
      product_id: string;
      rating: number;
    }[];

    if (variantsRes.error) {
      console.warn(
        '[catalog] igo_product_variants unavailable — falling back to single-weight products. ' +
          'Has supabase/migrations/0004_website_support.sql been run?'
      );
    }

    const variantsByProduct = groupBy(variants, (v) => v.product_id);
    const metaByProduct = new Map(metas.map((m) => [m.product_id, m]));
    const reviewAggregates = aggregateReviews(reviews);

    return rows.map((row) =>
      toWebsiteProduct(
        row,
        variantsByProduct.get(row.id) ?? [],
        metaByProduct.get(row.id) ?? null,
        reviewAggregates.get(row.id) ?? null
      )
    );
  } catch (err) {
    console.error('[catalog] fetchCatalog threw:', (err as Error).message);
    return null;
  }
}

/** Single product, including its individual reviews (for the PDP). */
export async function fetchProduct(productId: string): Promise<Product | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [productRes, variantsRes, metaRes, reviewsRes] = await Promise.all([
      supabase.from('products').select(PRODUCT_COLUMNS).eq('id', productId).maybeSingle(),
      supabase.from('igo_product_variants').select('*').eq('product_id', productId),
      supabase.from('igo_product_web_meta').select('*').eq('product_id', productId).maybeSingle(),
      supabase
        .from('product_reviews')
        .select('id, rating, comment, created_at, user_id')
        .eq('product_id', productId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(50)
    ]);

    if (productRes.error || !productRes.data) return null;

    const reviewRows = (reviewsRes.error ? [] : (reviewsRes.data ?? [])) as {
      id: string;
      rating: number;
      comment: string | null;
      created_at: string;
      user_id: string | null;
    }[];

    const aggregate: ReviewAggregate | null =
      reviewRows.length > 0
        ? {
            rating:
              Math.round(
                (reviewRows.reduce((sum, r) => sum + r.rating, 0) / reviewRows.length) * 10
              ) / 10,
            count: reviewRows.length
          }
        : null;

    const product = toWebsiteProduct(
      productRes.data as unknown as ProductRow,
      (variantsRes.error ? [] : (variantsRes.data ?? [])) as unknown as VariantRow[],
      (metaRes.error ? null : (metaRes.data as unknown as WebMetaRow | null)) ?? null,
      aggregate
    );

    product.reviews = reviewRows.map((r) => ({
      id: r.id,
      userName: 'Verified Customer',
      rating: r.rating,
      date: new Date(r.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      comment: r.comment ?? '',
      // `product_reviews` is protected by an enforce_verified_purchase_review
      // trigger in the app's phase12_reviews.sql, so every row that exists
      // IS a verified purchase.
      verifiedPurchase: true,
      userId: r.user_id ?? undefined
    }));

    return product;
  } catch (err) {
    console.error('[catalog] fetchProduct threw:', (err as Error).message);
    return null;
  }
}

// ── Categories ──────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<CategoryRow[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, emoji, display_order, is_active')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('[catalog] categories query failed:', error.message);
    return null;
  }
  return (data ?? []) as CategoryRow[];
}

// ── Offers / combos / coupons / FAQs ────────────────────────────────────────

/** Active offers only, respecting the start/end window the admin sets. */
export async function fetchActiveOffers(): Promise<OfferRow[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('active', true)
    .lte('start_date', nowIso)
    .gte('end_date', nowIso)
    .order('priority', { ascending: false });
  if (error) {
    console.error('[catalog] offers query failed:', error.message);
    return null;
  }
  return (data ?? []) as OfferRow[];
}

export async function fetchComboPacks(): Promise<ComboPackRow[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('combo_packs')
    .select('*, combo_pack_items ( id, product_id, quantity )')
    .eq('active', true);
  if (error) {
    console.error('[catalog] combo_packs query failed:', error.message);
    return null;
  }
  return (data ?? []) as ComboPackRow[];
}

/**
 * Public coupons. The admin owns these; the website only displays and
 * validates them. Targeted coupons (product/category specific) are returned
 * too, when the table has those columns — the cart applies the targeting
 * rules at redemption time (see handleApplyCoupon in CartPage.tsx), only
 * discounting the matching line items rather than the whole order.
 */
export async function fetchCoupons(): Promise<Coupon[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const baseColumns =
    'id, code, description, discount_type, discount_value, min_order_value, is_active, expires_at';
  // Optional per-product / per-category targeting columns. Requested
  // separately rather than assumed, because not every install's `coupons`
  // table has them — a missing column would fail the whole query otherwise.
  const richColumns = `${baseColumns}, product_id, category`;

  let data: Record<string, unknown>[] | null = null;
  let error: { message: string } | null = null;
  let hasTargetingColumns = true;

  const richResult = await supabase.from('coupons').select(richColumns).eq('is_active', true);
  data = richResult.data as unknown as Record<string, unknown>[] | null;
  error = richResult.error;

  if (error) {
    hasTargetingColumns = false;
    const baseResult = await supabase.from('coupons').select(baseColumns).eq('is_active', true);
    data = baseResult.data as unknown as Record<string, unknown>[] | null;
    error = baseResult.error;
  }

  if (error) {
    console.error('[catalog] coupons query failed:', error.message);
    return null;
  }

  const rows = (data ?? []) as unknown as Record<string, unknown>[];

  return rows.map((c): Coupon => {
    // The website's Coupon type uses 'percentage' | 'flat'; the canonical
    // table uses 'flat' | 'percent' | 'free_delivery' | 'cashback'. Anything
    // that isn't a percentage is treated as a flat rupee amount, which is how
    // free_delivery and cashback already behave at checkout.
    const discountType: Coupon['discountType'] =
      c.discount_type === 'percent' ? 'percentage' : 'flat';

    const productId = hasTargetingColumns && c.product_id ? String(c.product_id) : undefined;
    const category = hasTargetingColumns && c.category ? String(c.category) : undefined;

    return {
      code: String(c.code ?? ''),
      description: (c.description as string) ?? '',
      discountType,
      value: Number(c.discount_value ?? 0),
      minOrderValue: Number(c.min_order_value ?? 0),
      // No expiry set by the admin means the coupon does not expire. An empty
      // string keeps the required field satisfied without inventing a date.
      expiresAt: (c.expires_at as string) ?? '',
      ...(productId ? { productId } : {}),
      ...(category ? { category } : {})
    };
  });
}

export async function fetchFaqs(): Promise<FaqRow[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('faq_items')
    .select('id, category, question, answer, priority')
    .order('priority', { ascending: false });
  if (error) {
    console.error('[catalog] faq_items query failed:', error.message);
    return null;
  }
  return (data ?? []) as FaqRow[];
}

// ── Website-owned content ───────────────────────────────────────────────────

export async function fetchSiteContent(
  key?: string
): Promise<{ key: string; content_type: string; payload: Record<string, unknown> }[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  let query = supabase
    .from('igo_site_content')
    .select('key, content_type, payload, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (key) query = query.eq('key', key);
  const { data, error } = await query;
  if (error) return null;
  return (data ?? []) as { key: string; content_type: string; payload: Record<string, unknown> }[];
}

/** B2B / franchise enquiry. Insert-only by RLS; anyone may submit. */
export async function submitLead(lead: {
  leadType?: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  budget?: string;
  preferredLocation?: string;
  experience?: string;
  message?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Backend not configured.' };
  }
  const { error } = await supabase.from('igo_leads').insert({
    lead_type: lead.leadType ?? 'franchise',
    full_name: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    city: lead.city ?? null,
    state: lead.state ?? null,
    budget: lead.budget ?? null,
    preferred_location: lead.preferredLocation ?? null,
    experience: lead.experience ?? null,
    message: lead.message ?? null
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Utilities ───────────────────────────────────────────────────────────────

function groupBy<T, K>(items: T[], keyOf: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }
  return map;
}

function aggregateReviews(
  rows: { product_id: string; rating: number }[]
): Map<string, ReviewAggregate> {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const r of rows) {
    const current = totals.get(r.product_id) ?? { sum: 0, count: 0 };
    current.sum += r.rating;
    current.count += 1;
    totals.set(r.product_id, current);
  }
  const out = new Map<string, ReviewAggregate>();
  for (const [productId, { sum, count }] of totals) {
    out.set(productId, { rating: Math.round((sum / count) * 10) / 10, count });
  }
  return out;
}
