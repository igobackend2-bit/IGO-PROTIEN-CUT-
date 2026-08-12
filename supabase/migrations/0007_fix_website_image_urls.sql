-- ============================================================================
-- IGO Protein Cuts — Convert website-relative image paths to absolute URLs
--
-- THE PROBLEM
-- 0006 inserted 44 products carrying the website's own relative image paths,
-- e.g. '/Images/Meat Images/Chicken/Chicken Wings.jpg'. Those resolve fine on
-- the website (they're served out of public/), but the MOBILE APP loads
-- image_url as an absolute URL, so every one of those products would show a
-- broken image in the app.
--
-- THE FIX
-- Rewrite them to absolute URLs on the live website domain, which already
-- serves these exact files:
--   https://igoproteincuts.com/Images/Meat%20Images/Chicken/Chicken%20Wings.jpg
--
-- Spaces are percent-encoded because Flutter's network image loader will not
-- encode them for you — a raw space in a URL fails there even though browsers
-- are forgiving about it.
--
-- SCOPE NOTE
-- This updates `products.image_url`, an app table, but ONLY on the 44 rows
-- that 0006 itself created (guarded by igo_product_web_meta.added_by_website).
-- No pre-existing product is touched. Verify with the "BEFORE" query below
-- before running.
--
-- DEPENDENCY: images must be live at https://igoproteincuts.com/Images/...
-- If you later move the site, re-run this with the new domain.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- BEFORE — confirm the blast radius. Expect 44 rows, all website-added.
-- ---------------------------------------------------------------------------
-- select p.name, p.image_url
-- from public.products p
-- join public.igo_product_web_meta m on m.product_id = p.id
-- where m.added_by_website = true and p.image_url like '/Images/%';


begin;

-- ---------------------------------------------------------------------------
-- 1. Primary image
-- ---------------------------------------------------------------------------
update public.products p
   set image_url = 'https://igoproteincuts.com' || replace(p.image_url, ' ', '%20')
  from public.igo_product_web_meta m
 where m.product_id = p.id
   and m.added_by_website = true
   and p.image_url like '/Images/%';


-- ---------------------------------------------------------------------------
-- 2. Gallery images — same treatment across the text[] column
-- ---------------------------------------------------------------------------
update public.products p
   set image_urls = (
     select array_agg(
       case
         when url like '/Images/%'
           then 'https://igoproteincuts.com' || replace(url, ' ', '%20')
         else url
       end
       order by ord
     )
     from unnest(p.image_urls) with ordinality as t(url, ord)
   )
  from public.igo_product_web_meta m
 where m.product_id = p.id
   and m.added_by_website = true
   and p.image_urls is not null
   and array_length(p.image_urls, 1) > 0;

commit;


-- ============================================================================
-- AFTER — verify. The first query should return 0 rows; the second shows the
-- rewritten URLs, which you can paste into a browser to spot-check.
-- ============================================================================
-- select count(*) as still_relative
-- from public.products p
-- join public.igo_product_web_meta m on m.product_id = p.id
-- where m.added_by_website = true and p.image_url like '/Images/%';
--
-- select p.name, p.image_url
-- from public.products p
-- join public.igo_product_web_meta m on m.product_id = p.id
-- where m.added_by_website = true
-- order by p.name
-- limit 20;
