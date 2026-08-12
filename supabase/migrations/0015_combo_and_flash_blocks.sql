-- ============================================================================
-- IGO Protein Cuts — Combo Packs and Flash Deals headings
--
-- GAP THIS FILLS
-- Two homepage sections had no editable block at all:
--
--   "Combo Packs"              — the 4 green cards (ComboCardsGrid)
--   "Today's Flash Meat Deals" — the green countdown band (TodaysDealsBanner)
--
-- Both render products from the catalog, but their headings, eyebrows and CTA
-- text were hardcoded. This makes them editable and slots them into the
-- homepage running order.
--
-- The products in each are still catalog-driven:
--   Combo Packs  → products in the combo-packs category
--   Flash Deals  → products flagged is_flash_offer
--
-- SCOPE: igo_site_content only. No app table touched.
-- ============================================================================

insert into public.igo_site_content
  (key, content_type, payload, display_order, admin_label, admin_group)
values
  (
    'home.rail_combo_packs',
    'text',
    '{
      "eyebrow": "BUNDLE & SAVE",
      "heading": "Combo Packs",
      "subheading": "Curated bundles at a better price than buying each cut separately.",
      "viewAllLabel": "View All",
      "viewAllPath": "/category/combo-packs"
    }'::jsonb,
    155,
    'Combo Packs — heading',
    'Homepage'
  ),
  (
    'home.rail_flash_deals',
    'text',
    '{
      "eyebrow": "LIMITED TIME",
      "heading": "Today''s Flash Meat Deals",
      "subheading": "Weekly deals across our most popular cuts — while stocks last.",
      "ctaLabel": "SHOP FRESH DEALS",
      "ctaPath": "/offers"
    }'::jsonb,
    165,
    'Flash Deals — heading',
    'Homepage'
  )
on conflict (key) do nothing;


-- Give the Plans tab blocks labels matching their on-page headings.
update public.igo_site_content set admin_label = v.label
from (values
  ('plans.subscriptions', 'Protein Cuts Subscriptions'),
  ('plans.recipes',       'Signature Meat Recipes'),
  ('plans.guides',        'Cook It Right guides')
) as v(k, label)
where public.igo_site_content.key = v.k;


-- ============================================================================
-- VERIFY
-- ============================================================================
-- select display_order, admin_label, key
-- from public.igo_site_content
-- where admin_group = 'Homepage'
-- order by display_order;
-- ============================================================================
