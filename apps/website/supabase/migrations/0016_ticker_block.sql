-- ============================================================================
-- IGO Protein Cuts — Ticker strip above the promo carousel
--
-- GAP THIS FILLS
-- HomePage.tsx already reads `home.ticker` via useSiteContent, but no row was
-- ever seeded for it. The hook fell back to its hardcoded default, so the strip
-- rendered correctly on the site but never appeared in the admin sidebar —
-- there was nothing to list.
--
-- This is the dark strip directly above the promo carousel:
--   30-MIN EXPRESS DELIVERY · 100% ANTIBIOTIC-FREE · 0-4°C COLD CHAIN ·
--   FREE DELIVERY ABOVE ₹499
--
-- Values match the current hardcoded fallback exactly, so nothing changes
-- visually when this runs.
--
-- SCOPE: igo_site_content only. No app table touched.
-- ============================================================================

insert into public.igo_site_content
  (key, content_type, payload, display_order, admin_label, admin_group)
values (
  'home.ticker',
  'chips',
  '{
    "items": [
      { "label": "30-Min Express Delivery" },
      { "label": "100% Antibiotic-Free" },
      { "label": "0-4°C Cold Chain" },
      { "label": "Free Delivery Above ₹499" }
    ]
  }'::jsonb,
  25,
  'Ticker strip',
  'Homepage'
)
on conflict (key) do nothing;


-- ============================================================================
-- VERIFY — Ticker strip should appear between "Hero — image cards" (20)
-- and "Promo carousel" (30), matching where it sits on the page.
-- ============================================================================
-- select display_order, admin_label, key
-- from public.igo_site_content
-- where admin_group = 'Homepage'
-- order by display_order;
-- ============================================================================
