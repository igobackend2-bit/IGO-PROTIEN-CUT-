-- ============================================================================
-- IGO Protein Cuts — Revert 0007's image URL rewrite
--
-- WHAT WENT WRONG
-- 0007 rewrote the 44 website-added products' image paths from
--   /Images/Meat Images/Chicken/Chicken Wings.jpg
-- to
--   https://igoproteincuts.com/Images/Meat%20Images/Chicken/Chicken%20Wings.jpg
-- on the assumption that domain served those files. It does not resolve at
-- all (net::ERR_NAME_NOT_RESOLVED), so every one of those 44 products lost
-- its image on the website.
--
-- THIS FILE undoes that: back to root-relative paths, which the website
-- serves out of its own public/ folder in dev and in production.
--
-- KNOWN TRADE-OFF
-- Root-relative paths work on the website but NOT in the mobile app, which
-- loads image_url as an absolute URL. Those 44 products will show a
-- placeholder in the app until real photos are uploaded through the Flutter
-- admin (Products → Change photo), which stores them in the `product-images`
-- Supabase Storage bucket and yields URLs that work everywhere.
--
-- That is the correct permanent fix. This migration restores the website to
-- working order in the meantime.
--
-- SCOPE
-- Touches only rows where igo_product_web_meta.added_by_website = true, i.e.
-- the 44 rows 0006 created. Pre-existing products are untouched.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- BEFORE — expect 44 rows
-- ---------------------------------------------------------------------------
-- select p.name, p.image_url
-- from public.products p
-- join public.igo_product_web_meta m on m.product_id = p.id
-- where m.added_by_website = true
--   and p.image_url like 'https://igoproteincuts.com/%';


begin;

-- ---------------------------------------------------------------------------
-- 1. Primary image — strip the host and decode %20 back to spaces
-- ---------------------------------------------------------------------------
update public.products p
   set image_url = replace(
         replace(p.image_url, 'https://igoproteincuts.com', ''),
         '%20', ' '
       )
  from public.igo_product_web_meta m
 where m.product_id = p.id
   and m.added_by_website = true
   and p.image_url like 'https://igoproteincuts.com/%';


-- ---------------------------------------------------------------------------
-- 2. Gallery images
-- ---------------------------------------------------------------------------
update public.products p
   set image_urls = (
     select array_agg(
       case
         when url like 'https://igoproteincuts.com/%'
           then replace(replace(url, 'https://igoproteincuts.com', ''), '%20', ' ')
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
-- AFTER — the first should return 0, the second should show /Images/... paths
-- ============================================================================
-- select count(*) as still_absolute
-- from public.products p
-- join public.igo_product_web_meta m on m.product_id = p.id
-- where m.added_by_website = true
--   and p.image_url like 'https://igoproteincuts.com/%';
--
-- select p.name, p.image_url
-- from public.products p
-- join public.igo_product_web_meta m on m.product_id = p.id
-- where m.added_by_website = true
-- order by p.name
-- limit 10;
-- ============================================================================
