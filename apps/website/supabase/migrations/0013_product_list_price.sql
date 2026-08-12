-- ============================================================================
-- IGO Protein Cuts — Website-owned list price and merchandising badges
--
-- THE BUG THIS FIXES
-- The website's Product type has both `basePrice` and `originalPrice` and shows
-- a strikethrough + "N% OFF" badge from the difference. The canonical
-- `products` table has only `price` — no list price — so the adapter set
-- originalPrice = basePrice, and every product rendered:
--
--     ₹649  ₹649  0% OFF
--
-- A redundant strikethrough and a meaningless badge, most visibly on the combo
-- banner carousel.
--
-- THE FIX
-- `original_price` lives here, in the website-owned meta table, because a
-- promotional list price is a merchandising decision rather than catalog data,
-- and adding a column to `products` is out of scope.
--
--   • Leave it null  → no strikethrough, no badge (correct default)
--   • Set it above the price → strikethrough + real discount percentage
--
-- SCOPE: alters igo_product_web_meta only, which is website-owned. No app
-- table is touched.
-- ============================================================================

alter table public.igo_product_web_meta
  add column if not exists original_price numeric;

comment on column public.igo_product_web_meta.original_price is
  'Promotional list price shown struck through. Null means no discount is '
  'advertised. Must be greater than products.price to display.';


-- ---------------------------------------------------------------------------
-- VERIFY
-- ---------------------------------------------------------------------------
-- Products currently advertising a discount (expect 0 rows until you set one):
--
--   select p.name, p.price, m.original_price,
--          round((1 - p.price / nullif(m.original_price, 0)) * 100) as pct_off
--   from public.products p
--   join public.igo_product_web_meta m on m.product_id = p.id
--   where m.original_price is not null and m.original_price > p.price
--   order by pct_off desc;
--
-- Example — advertise 20% off a combo:
--
--   update public.igo_product_web_meta
--      set original_price = 811
--    where product_id = (
--      select id from public.products where name = 'High Protein Gym Bro Bundle'
--    );
-- ============================================================================
