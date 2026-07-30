import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * WEBSITE ADMIN API — the small surface the Flutter admin dashboard doesn't
 * cover.
 *
 * Everything operational (products, pricing, stock, orders, delivery,
 * customers, coupons, offers, combos, support, notifications, analytics,
 * reports, roles) lives in the Flutter admin at
 * https://protein-cuts-admin.vercel.app and is deliberately NOT duplicated
 * here — two editors for one field is how prices drift.
 *
 * What's left is genuinely website-only:
 *   • igo_site_content       homepage banners / hero / marketing blocks
 *   • igo_product_variants   the 500g / 1kg weight ladder
 *   • igo_product_web_meta   SEO title, slug, description
 *   • igo_leads              B2B and franchise enquiries
 *
 * All four are gated by RLS on active membership in `admin_users` (see
 * 0008_website_admin_policies.sql), the same table the Flutter admin checks.
 */

export interface Result<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

function noBackend<T>(): Result<T> {
  return { ok: false, error: 'Backend not configured.' };
}

// ── Site content (banners) ──────────────────────────────────────────────────

export interface SiteContentRow {
  id: string;
  key: string;
  content_type: string;
  payload: Record<string, unknown>;
  is_active: boolean;
  display_order: number;
}

export async function listSiteContent(): Promise<Result<SiteContentRow[]>> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { data, error } = await supabase
    .from('igo_site_content')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as unknown as SiteContentRow[] };
}

export async function upsertSiteContent(row: {
  id?: string;
  key: string;
  content_type: string;
  payload: Record<string, unknown>;
  is_active: boolean;
  display_order: number;
}): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { error } = await supabase.from('igo_site_content').upsert(
    {
      ...(row.id ? { id: row.id } : {}),
      key: row.key,
      content_type: row.content_type,
      payload: row.payload,
      is_active: row.is_active,
      display_order: row.display_order,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'key' }
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function setSiteContentActive(id: string, isActive: boolean): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { error } = await supabase
    .from('igo_site_content')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteSiteContent(id: string): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { error } = await supabase.from('igo_site_content').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Weight ladders ──────────────────────────────────────────────────────────

export interface VariantAdminRow {
  id: string;
  product_id: string;
  label: string;
  weight_grams: number;
  price_multiplier: number;
  price_override: number | null;
  servings: string | null;
  display_order: number;
  is_active: boolean;
  product_name?: string;
  product_price?: number;
}

/** Variants joined to their product name and base price, for display. */
export async function listVariants(): Promise<Result<VariantAdminRow[]>> {
  if (!isSupabaseConfigured || !supabase) return noBackend();

  // Two queries, because igo_product_variants deliberately has no FK to
  // products (a website table must never be able to block an admin delete),
  // so PostgREST can't embed the join.
  const [variantsRes, productsRes] = await Promise.all([
    supabase.from('igo_product_variants').select('*').order('display_order'),
    supabase.from('products').select('id, name, price')
  ]);

  if (variantsRes.error) return { ok: false, error: variantsRes.error.message };

  const products = new Map(
    ((productsRes.data ?? []) as unknown as { id: string; name: string; price: number }[]).map(
      (p) => [p.id, p]
    )
  );

  const rows = ((variantsRes.data ?? []) as unknown as VariantAdminRow[]).map((v) => ({
    ...v,
    product_name: products.get(v.product_id)?.name ?? '(deleted product)',
    product_price: products.get(v.product_id)?.price ?? 0
  }));

  return { ok: true, data: rows };
}

/**
 * Sets an exact price for one weight. Passing null clears it, returning that
 * weight to `products.price × price_multiplier` — which is the preferred
 * state, because it keeps the admin's price authoritative.
 */
export async function setVariantPriceOverride(
  variantId: string,
  priceOverride: number | null
): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { error } = await supabase
    .from('igo_product_variants')
    .update({ price_override: priceOverride })
    .eq('id', variantId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function setVariantActive(variantId: string, isActive: boolean): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { error } = await supabase
    .from('igo_product_variants')
    .update({ is_active: isActive })
    .eq('id', variantId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── SEO ─────────────────────────────────────────────────────────────────────

export interface SeoRow {
  product_id: string;
  slug: string | null;
  seo_title: string | null;
  seo_description: string | null;
  product_name?: string;
}

export async function listSeo(): Promise<Result<SeoRow[]>> {
  if (!isSupabaseConfigured || !supabase) return noBackend();

  const [metaRes, productsRes] = await Promise.all([
    supabase.from('igo_product_web_meta').select('product_id, slug, seo_title, seo_description'),
    supabase.from('products').select('id, name').order('name')
  ]);

  if (metaRes.error) return { ok: false, error: metaRes.error.message };

  const meta = new Map(
    ((metaRes.data ?? []) as unknown as SeoRow[]).map((m) => [m.product_id, m])
  );

  // Driven by the product list so products with no meta row yet still appear
  // and can be given SEO details.
  const rows = ((productsRes.data ?? []) as unknown as { id: string; name: string }[]).map((p) => ({
    product_id: p.id,
    product_name: p.name,
    slug: meta.get(p.id)?.slug ?? null,
    seo_title: meta.get(p.id)?.seo_title ?? null,
    seo_description: meta.get(p.id)?.seo_description ?? null
  }));

  return { ok: true, data: rows };
}

export async function saveSeo(row: {
  product_id: string;
  slug: string | null;
  seo_title: string | null;
  seo_description: string | null;
}): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { error } = await supabase.from('igo_product_web_meta').upsert(
    {
      product_id: row.product_id,
      slug: row.slug || null,
      seo_title: row.seo_title || null,
      seo_description: row.seo_description || null,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'product_id' }
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── Leads ───────────────────────────────────────────────────────────────────

export interface LeadRow {
  id: string;
  lead_type: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  budget: string | null;
  preferred_location: string | null;
  experience: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export async function listLeads(): Promise<Result<LeadRow[]>> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { data, error } = await supabase
    .from('igo_leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as unknown as LeadRow[] };
}

export async function setLeadStatus(id: string, status: string): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { error } = await supabase.from('igo_leads').update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteLead(id: string): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { error } = await supabase.from('igo_leads').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Leads as CSV, for the export button. */
export function leadsToCsv(leads: LeadRow[]): string {
  const headers = [
    'Created',
    'Type',
    'Name',
    'Email',
    'Phone',
    'City',
    'State',
    'Budget',
    'Preferred Location',
    'Experience',
    'Status'
  ];
  const escape = (v: string | null) => `"${(v ?? '').replace(/"/g, '""')}"`;
  const rows = leads.map((l) =>
    [
      new Date(l.created_at).toLocaleString('en-IN'),
      l.lead_type,
      l.full_name,
      l.email,
      l.phone,
      l.city,
      l.state,
      l.budget,
      l.preferred_location,
      l.experience,
      l.status
    ]
      .map((v) => escape(v as string | null))
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}
