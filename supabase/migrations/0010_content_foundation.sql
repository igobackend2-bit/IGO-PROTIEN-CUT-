-- ============================================================================
-- IGO Protein Cuts — Website content foundation (Phase A)
--
-- Creates the media bucket and seeds every editable content block with the
-- values currently hardcoded in the site, so running this changes NOTHING
-- visually. Later phases wire each section to read from here.
--
-- SCOPE: igo_* tables and a NEW storage bucket only. No app table is touched,
-- and the app's own `product-images` bucket is left completely alone.
--
-- SAFETY: every insert is `on conflict (key) do nothing`, so re-running never
-- overwrites content you've edited in the admin.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Media bucket — website images uploaded from /admin
--
-- Separate from the app's `product-images` bucket on purpose: that one is for
-- the product catalog and is managed by the Flutter admin. Mixing marketing
-- banners into it would blur ownership.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('igo-website-media', 'igo-website-media', true)
on conflict (id) do nothing;

drop policy if exists "Website media is publicly readable" on storage.objects;
create policy "Website media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'igo-website-media');

drop policy if exists "Admins can upload website media" on storage.objects;
create policy "Admins can upload website media"
  on storage.objects for insert
  with check (bucket_id = 'igo-website-media' and public.igo_is_active_admin());

drop policy if exists "Admins can update website media" on storage.objects;
create policy "Admins can update website media"
  on storage.objects for update
  using (bucket_id = 'igo-website-media' and public.igo_is_active_admin());

drop policy if exists "Admins can delete website media" on storage.objects;
create policy "Admins can delete website media"
  on storage.objects for delete
  using (bucket_id = 'igo-website-media' and public.igo_is_active_admin());


-- ---------------------------------------------------------------------------
-- 2. HERO — rotating headline themes
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'home.hero',
  'hero',
  '{
    "autoRotateMs": 6000,
    "themes": [
      {
        "label": "IGO ECOSYSTEM • FRESH CUT ON ORDER",
        "headlineTop": "PURE FARM FRESH CUTS.",
        "headlineAccent": "30-MIN EXPRESS",
        "headlineBottom": "COLD CHAIN.",
        "description": "Experience India''s finest antibiotic-free Chicken, pasture-fed Mutton, wild seafood, and gym protein plans. Hand-trimmed by master butchers, chilled at 0-4°C, and delivered to your kitchen in 30 minutes."
      },
      {
        "label": "TOTAL TRACEABILITY",
        "headlineTop": "SCAN. VERIFY.",
        "headlineAccent": "TRUST EVERY",
        "headlineBottom": "CUT YOU BUY.",
        "description": "Every pack carries a batch ID you can trace back to the exact farm, cut date, and handler — full farm-to-table transparency, not just a promise."
      },
      {
        "label": "HERITAGE TAMIL FARMS",
        "headlineTop": "FARM-FRESH PROTEINS,",
        "headlineAccent": "TRACED",
        "headlineBottom": "EVERY STEP.",
        "description": "Never frozen. Always fresh. Always traced. Same-day delivery from heritage farms with 100% cold-chain integrity, hand-selected from certified partner farms."
      }
    ]
  }'::jsonb,
  1
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- 3. HERO IMAGES — the visual card paired with each theme
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'home.hero_images',
  'slides',
  '{
    "items": [
      {
        "src": "https://igo-protien-cut.vercel.app/images/narrative/farm.webp",
        "alt": "Heritage Tamil Farms",
        "caption": "High Meadows Farm",
        "sub": "Certified heritage pastures in the Nilgiris range."
      },
      {
        "src": "https://igo-protien-cut.vercel.app/images/narrative/facility.webp",
        "alt": "Cold-Chain Integrity",
        "caption": "IGO Cold-Chain Facility",
        "sub": "0-4°C sterile processing, ISO 22000 certified."
      },
      {
        "src": "https://igo-protien-cut.vercel.app/images/narrative/packaging.webp",
        "alt": "Total Traceability",
        "caption": "Batch-Tracked Packaging",
        "sub": "Every pack carries a scannable farm-to-door QR code."
      }
    ]
  }'::jsonb,
  2
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- 4. PROMO CAROUSEL
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'home.promo_slides',
  'slides',
  '{
    "autoRotateMs": 4500,
    "items": [
      {
        "eyebrow": "Seasonal Pick",
        "title": "Monsoon Special:",
        "titleAccent": "Crispy Wings",
        "copy": "Rainy-day cravings, sorted — fresh-cut chicken wings, hand-trimmed to order and delivered in 30 minutes.",
        "badgeLine1": "Starts From",
        "badgeLine2": "₹129",
        "cta": "Order Now",
        "path": "/search?q=Wings",
        "image": "/Images/banners/promo-wings-banner.jpg",
        "alt": "Monsoon Special crispy chicken wings"
      },
      {
        "eyebrow": "Combo Savings",
        "title": "Bundle & Save",
        "titleAccent": "Up to 20% Off",
        "copy": "Curated combo packs — whole chicken, mutton curry cut, and farm eggs bundled together at a better price than buying separately.",
        "badgeLine1": "Upto",
        "badgeLine2": "20% Off",
        "cta": "Shop Combo Packs",
        "path": "/category/combo-packs",
        "image": "/Images/banners/mutton-masterpiece-banner.jpg",
        "alt": "IGO combo pack — mutton curry cut"
      },
      {
        "eyebrow": "Subscriber Perk",
        "title": "Subscribe &",
        "titleAccent": "Save ₹1,200/Month",
        "copy": "Recurring orders unlock zero delivery fees and priority morning delivery slots — set it once, stay stocked automatically.",
        "badgeLine1": "Save Up To",
        "badgeLine2": "₹1,200/mo",
        "cta": "Explore Plans",
        "path": "/subscriptions",
        "image": "/Images/banners/promo-subscriber-banner.jpg",
        "alt": "IGO subscription — whole chicken"
      },
      {
        "eyebrow": "Free Delivery",
        "title": "On All Orders",
        "titleAccent": "Above ₹499",
        "copy": "No minimum-order stress — cross ₹499 and delivery is free, on every category, every time.",
        "badgeLine1": "Free Above",
        "badgeLine2": "₹499",
        "cta": "Start Shopping",
        "path": "/search",
        "image": "/Images/banners/promo-free-delivery-banner.jpg",
        "alt": "Farm-fresh eggs — free delivery above ₹499"
      }
    ]
  }'::jsonb,
  3
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- 5. CATEGORY CIRCLES — "Farm to Fork, the IGO Way"
--
-- `count` is stored as free text. Three of these were computed from the live
-- catalog in code; they become static text here so the admin can control them.
-- Set count to "" to hide the label entirely.
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'home.categories',
  'cards',
  '{
    "items": [
      { "title": "Fresh Chicken",   "path": "/category/chicken",      "icon": "Drumstick",        "count": "16 Cuts",          "image": "/Images/chicken-whole.png",                                  "badge": "Bestseller" },
      { "title": "Goat Mutton",     "path": "/category/mutton",       "icon": "Beef",             "count": "12 Cuts",          "image": "/Images/Meat Images/Mutton/Mutton curry.jpg" },
      { "title": "Premium Beef",    "path": "/category/beef",         "icon": "Beef",             "count": "9 Cuts",           "image": "/Images/Meat Images/Beef/Ribeye Steak.jpg" },
      { "title": "Fish",            "path": "/category/fish",         "icon": "Fish",             "count": "16 Varieties",     "image": "/Images/seer-fish.png" },
      { "title": "Sun-Dried Fish",  "path": "/category/dry-fish",     "icon": "Sun",              "count": "Karuvadu Picks",   "image": "/Images/Meat Images/Fish/Anchovy.jpg" },
      { "title": "Farm Eggs",       "path": "/category/eggs",         "icon": "Egg",              "count": "6 Varieties",      "image": "/Images/eggs.png" },
      { "title": "Ready to Cook",   "path": "/category/ready-to-cook","icon": "UtensilsCrossed",  "count": "5 Specials",       "image": "/Images/Meat Images/Chicken/Chicken Wings.jpg" },
      { "title": "Marinated Items", "path": "/search?q=Marinated",    "icon": "Flame",            "count": "Marinated Picks",  "image": "/Images/Meat Images/Chicken/Chicken Wings.jpg" },
      { "title": "Premium Cuts",    "path": "/search?q=Premium",      "icon": "Award",            "count": "Premium Picks",    "image": "/Images/Meat Images/Beef/Ribeye Steak.jpg" },
      { "title": "Frozen Food",     "path": "/category/frozen-food",  "icon": "Snowflake",        "count": "4 Freezer Picks",  "image": "/Images/Meat Images/Fish/Salmon Fillet.jpg" },
      { "title": "Biryani Kits",    "path": "/category/biryani",      "icon": "ChefHat",          "count": "3 Kits",           "image": "/Images/mutton-curry.png",                                   "badge": "NEW" },
      { "title": "Cold Cuts",       "path": "/category/cold-cuts",    "icon": "Sandwich",         "count": "4 Deli Picks",     "image": "/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg" },
      { "title": "Combo Packs",     "path": "/category/combo-packs",  "icon": "Gift",             "count": "20% Off",          "image": "/Images/chicken-breast.png",                                 "badge": "NEW" }
    ]
  }'::jsonb,
  4
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- 6. INSTAGRAM STRIP
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'home.instagram',
  'cards',
  '{
    "handle": "@igoproteincuts",
    "profileUrl": "https://www.instagram.com/igoproteincuts/",
    "items": [
      { "image": "/Images/instagram/post-1-shrimp.png",    "alt": "Fresh tiger prawns" },
      { "image": "/Images/instagram/post-2-eggs-reel.png", "alt": "Farm-fresh eggs reel" },
      { "image": "/Images/instagram/post-3-order.png",     "alt": "Order info post", "fit": "contain" },
      { "image": "/Images/instagram/post-4-eggs.png",      "alt": "Farm eggs" },
      { "image": "/Images/instagram/post-5-wings.png",     "alt": "Chicken wings" },
      { "image": "/Images/instagram/post-6-chocolate.png", "alt": "Featured post" }
    ]
  }'::jsonb,
  5
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- 7. STATS BAND
--
-- "89+ Fresh Products" is currently derived from the live catalog count. Stored
-- here as text so you control it; use the literal token {{productCount}} if you
-- want it to stay dynamic.
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'home.stats',
  'stats',
  '{
    "heading": "ONE ECOSYSTEM, FROM FARM TO FORK",
    "items": [
      { "value": "10,000+",         "label": "HAPPY CUSTOMERS" },
      { "value": "0-4°C",           "label": "CONTROLLED DELIVERY" },
      { "value": "{{productCount}}+", "label": "FRESH PRODUCTS" }
    ]
  }'::jsonb,
  6
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- 8. VALUE PROPS — the four icon cards under the stats band
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'home.value_props',
  'cards',
  '{
    "items": [
      { "icon": "Truck",       "title": "FAST DELIVERY",   "text": "Reliable cold-chain delivery in 30-90 minutes." },
      { "icon": "Award",       "title": "PREMIUM QUALITY", "text": "ISO 22000 & HACCP-certified standard." },
      { "icon": "Tag",         "title": "BEST PRICES",     "text": "Real bulk-order and subscription savings." },
      { "icon": "Leaf",        "title": "SUSTAINABLE",     "text": "Sourced through IGO''s own farm network." }
    ]
  }'::jsonb,
  7
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- 9. APP DOWNLOAD BANNER
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'home.app_banner',
  'text',
  '{
    "eyebrow": "SHOP FASTER",
    "heading": "ON YOUR PHONE",
    "body": "Reorder in seconds and track your delivery live — right from your phone''s home screen, no install required.",
    "qrImage": "",
    "appStoreUrl": "",
    "playStoreUrl": "",
    "image": "/Images/naattu-kozhi.png"
  }'::jsonb,
  8
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- 10. NEWSLETTER BAND
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'home.newsletter',
  'text',
  '{
    "heading": "Weekly Offers, Straight to Your Inbox",
    "body": "Subscribe for early access to fresh drops, seasonal specials, and new-city launches.",
    "placeholder": "your@email.com",
    "cta": "Subscribe"
  }'::jsonb,
  9
) on conflict (key) do nothing;


-- ============================================================================
-- VERIFY
-- ============================================================================
-- select key, content_type, is_active, display_order
-- from public.igo_site_content
-- order by display_order;
--
-- Confirm the bucket exists:
-- select id, name, public from storage.buckets where id = 'igo-website-media';
-- ============================================================================
