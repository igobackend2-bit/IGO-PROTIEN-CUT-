-- ============================================================================
-- IGO Protein Cuts — Scrolling ticker strip above the promo carousel
--
-- The green scrolling marquee ("30-MIN EXPRESS DELIVERY · 100% ANTIBIOTIC-FREE
-- · 0-4°C COLD CHAIN · FREE DELIVERY ABOVE ₹499") was a hardcoded array inside
-- HomePage.tsx. This makes it editable and slots it in just above the promo
-- carousel, where it appears on the page.
--
-- The strip renders the list twice so the marquee loops seamlessly — you edit
-- one list, the duplication is automatic.
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
  'Ticker strip (scrolling)',
  'Homepage'
)
on conflict (key) do nothing;


-- ============================================================================
-- VERIFY
-- ============================================================================
-- select display_order, admin_label, key
-- from public.igo_site_content
-- where admin_group = 'Homepage'
-- order by display_order;
-- ============================================================================
