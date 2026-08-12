-- ============================================================================
-- IGO Protein Cuts — Admin ordering, friendly labels, and product-rail headings
--
-- WHY
-- The admin listed blocks in the order they were seeded, with names derived
-- from their keys ("Hero Images", "Trust Strip"). That doesn't match how you
-- read the site. This orders every block to the ACTUAL top-to-bottom sequence
-- of the homepage and gives each one the heading you see on the page, so the
-- left rail reads like a table of contents for the live site.
--
-- Also adds the headings above the product rails — "Top Picks For You",
-- "Today's Fresh Stock", "Chef Recommended Cuts". The products in those rails
-- come from the catalog (Bestseller / Fresh today / Flash deal flags in the
-- Pricing & Badges tab), but the headings above them were hardcoded until now.
--
-- SCOPE: igo_site_content only. No app table touched.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Admin display columns
-- ---------------------------------------------------------------------------
alter table public.igo_site_content
  add column if not exists admin_label text,
  add column if not exists admin_group text;

comment on column public.igo_site_content.admin_label is
  'Name shown in the admin sidebar — matches the heading on the live page.';
comment on column public.igo_site_content.admin_group is
  'Which page/area this block belongs to, for grouping in the admin.';


-- ---------------------------------------------------------------------------
-- 2. New blocks — the product rail headings
--
-- The rails themselves are driven by catalog flags; only the heading, eyebrow
-- and "View All" link are editable here.
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values
  ('home.rail_top_picks', 'text',
   '{"eyebrow":"MOST POPULAR CUTS","heading":"Top Picks For You","viewAllLabel":"View All","viewAllPath":"/search"}'::jsonb, 0),
  ('home.rail_fresh_stock', 'text',
   '{"eyebrow":"CUT FRESH THIS MORNING","heading":"Today''s Fresh Stock","viewAllLabel":"View All","viewAllPath":"/search"}'::jsonb, 0),
  ('home.rail_chef_picks', 'text',
   '{"eyebrow":"CURATED PAIRINGS","heading":"Chef Recommended Cuts","viewAllLabel":"View All","viewAllPath":"/recipes"}'::jsonb, 0),
  ('home.section_categories', 'text',
   '{"eyebrow":"THE IGO FARM NETWORK","heading":"Farm to Fork, the IGO Way","subheading":"From fresh cuts to eggs, marinades, and pantry staples — everything here is sourced straight from IGO''s own farms, never through a broker.","badge":"30-Minute Express Delivery"}'::jsonb, 0)
on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- 3. Order and label every block to match the live homepage, top to bottom
--
-- Numbers are spaced by 10 so a new block can be slotted between two existing
-- ones without renumbering everything.
-- ---------------------------------------------------------------------------
update public.igo_site_content set display_order = v.ord, admin_label = v.label, admin_group = v.grp
from (values
  -- ── Homepage, in render order ──
  ('home.hero',                 10,  'Hero — headlines',            'Homepage'),
  ('home.hero_images',          20,  'Hero — image cards',          'Homepage'),
  ('home.promo_slides',         30,  'Promo carousel',              'Homepage'),
  ('home.section_categories',   40,  'Farm to Fork — heading',      'Homepage'),
  ('home.categories',           50,  'Farm to Fork — categories',   'Homepage'),
  ('home.stats',                60,  'Why IGO? — stats band',       'Homepage'),
  ('home.value_props',          70,  'Why IGO? — four cards',       'Homepage'),
  ('sections.comparison',       80,  'Why Choose IGO Protein Cuts?','Homepage'),
  ('home.rail_top_picks',       90,  'Top Picks For You — heading', 'Homepage'),
  ('sections.certifications',   100, 'Quality & Certifications',    'Homepage'),
  ('home.rail_fresh_stock',     110, 'Today''s Fresh Stock — heading','Homepage'),
  ('sections.partners',         120, 'Our Farm & Supply Partners',  'Homepage'),
  ('sections.promo_tiles',      130, 'Promo tiles (4-up)',          'Homepage'),
  ('sections.how_it_works',     140, 'Fresh to Your Door in 3 Steps','Homepage'),
  ('sections.bundle_banner',    150, 'Bundle & Save banner',        'Homepage'),
  ('home.rail_chef_picks',      160, 'Chef Recommended — heading',  'Homepage'),
  ('sections.freshness_pillars',170, 'The Freshness Promise',       'Homepage'),
  ('sections.popular_searches', 180, 'Popular searches',            'Homepage'),
  ('home.app_banner',           190, 'App download banner',         'Homepage'),
  ('home.instagram',            200, 'Instagram strip',             'Homepage'),
  ('sections.trust_strip',      210, 'Built Around Trust',          'Homepage'),
  ('sections.our_farms',        220, 'Our Farms',                   'Homepage'),
  ('home.newsletter',           230, 'Newsletter band',             'Homepage'),
  ('site.footer',               240, 'Footer',                      'Homepage'),

  -- ── Plans, recipes, guides ──
  ('plans.subscriptions',       300, 'Subscription plans',          'Plans'),
  ('plans.recipes',             310, 'Signature recipes',           'Plans'),
  ('plans.guides',              320, 'Cook It Right guides',        'Plans'),

  -- ── Static pages ──
  ('pages.about',               400, 'About page',                  'Pages'),
  ('pages.b2b',                 410, 'B2B / Wholesale page',        'Pages'),
  ('pages.careers',             420, 'Careers page',                'Pages'),
  ('pages.contact',             430, 'Contact page',                'Pages'),
  ('seo.pages',                 440, 'Search engine listings',      'Pages')
) as v(k, ord, label, grp)
where public.igo_site_content.key = v.k;


-- Anything not listed above keeps working; give it a readable label so it
-- never shows a raw key in the sidebar.
update public.igo_site_content
   set admin_label = initcap(replace(split_part(key, '.', 2), '_', ' ')),
       admin_group = initcap(split_part(key, '.', 1))
 where admin_label is null;


-- ============================================================================
-- VERIFY — should read like the homepage, top to bottom
-- ============================================================================
-- select display_order, admin_group, admin_label, key
-- from public.igo_site_content
-- order by display_order;
-- ============================================================================
