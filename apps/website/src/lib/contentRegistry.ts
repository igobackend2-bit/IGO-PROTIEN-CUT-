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
  // NOTE: 'sections.freshness_pillars' (FreshnessPromiseSection),
  // 'sections.popular_searches' (ExploreSection), and 'sections.bundle_banner'
  // are deliberately NOT listed here — none of their components are actually
  // imported by any real page (only by the admin's own preview code in
  // EditableCanvas.tsx/SectionPreview.tsx, and ContentEditor.tsx already
  // excludes the first two via its own HIDDEN_BLOCKS set). Listing them as
  // "connected" would show admins a false "Live" badge for edits that change
  // nothing on the actual site.
  'sections.comparison',
  'sections.certifications',
  'sections.how_it_works',
  'sections.our_farms',
  'sections.trust_strip',
  'sections.partners',
  'sections.promo_tiles',

  // Static pages — hero title/intro only (each page's deeper bespoke
  // sections — founder message, certifications, job list, etc. — stay
  // hardcoded; they don't match the generic heading/body list shape these
  // blocks were seeded with, and forcing them in would mean redesigning
  // the page, not just wiring content).
  'pages.about',
  'pages.b2b',
  'pages.careers',
  'pages.contact',

  // Plans & Recipes
  'plans.subscriptions',
  'plans.recipes',
  'plans.guides'

  // Site chrome
]);

export function isBlockConnected(key: string): boolean {
  return CONNECTED_BLOCKS.has(key);
}
