/**
 * WHICH CONTENT BLOCKS ARE ACTUALLY WIRED INTO THE SITE.
 *
 * A block can exist in `igo_site_content` and be fully editable in /admin while
 * the page that should render it still uses hardcoded values. Editing such a
 * block saves fine and changes nothing visible, which is confusing and wastes
 * the editor's time.
 *
 * This list is the source of truth for the "Live" / "Not connected" badge in
 * the admin. Keep it in sync: when you replace a hardcoded value with
 * `useSiteContent('some.key', …)`, add the key here.
 *
 * Verify with:
 *   grep -rhoP "useSiteContent\(\s*'\K[^']+" src/ | sort -u
 */
export const CONNECTED_BLOCKS = new Set<string>([
  // Homepage
  'home.hero',
  'home.hero_images',
  'home.ticker',
  'home.promo_slides',
  'home.section_categories',
  'home.categories',
  'home.stats',
  'home.value_props',
  'home.rail_top_picks',
  'home.rail_fresh_stock',
  'home.instagram',
  'home.newsletter',
  'home.rail_combo_packs',
  'home.rail_chef_picks',
  'home.rail_flash_deals',

  // Sections
  'sections.comparison',
  'sections.certifications',
  'sections.how_it_works',
  'sections.our_farms',
  'sections.freshness_pillars',
  'sections.trust_strip',
  'sections.popular_searches',
  'sections.partners',
  'sections.bundle_banner',
  'sections.promo_tiles'

  // Site chrome
]);

export function isBlockConnected(key: string): boolean {
  return CONNECTED_BLOCKS.has(key);
}
