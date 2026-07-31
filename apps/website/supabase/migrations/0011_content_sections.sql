-- ============================================================================
-- IGO Protein Cuts — Section content blocks (Phase A, part 2)
--
-- Seeds the remaining editable blocks with today's hardcoded values, so running
-- this changes nothing visually.
--
-- CONSOLIDATION NOTE
-- Two things were duplicated in code and are now single blocks:
--
--   • The IGO-vs-market comparison table appeared identically in both
--     WhyIGOSection.tsx and TrustSection.tsx.  → sections.comparison
--
--   • Certifications appeared in THREE files (TrustSection,
--     QualityCertificationsSection, OurFarmsSection) with different wording and
--     different entries — TrustSection listed 3, QualityCertifications listed 4
--     including a duplicate "ISO 22000 Certified", OurFarms listed 4 including
--     "100% Halal" which the others omitted. Merged into one authoritative
--     list.  → sections.certifications
--
-- Edit once, updates everywhere.
--
-- SCOPE: igo_site_content only. No app table touched.
-- SAFETY: `on conflict (key) do nothing` — never overwrites your edits.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- How It Works — 3 steps
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'sections.how_it_works',
  'cards',
  '{
    "eyebrow": "SIMPLE PROCESS",
    "heading": "Fresh to Your Door in 3 Steps",
    "items": [
      { "icon": "ShoppingCart", "title": "Place Your Order",     "text": "Browse fresh categories, select your cuts, and checkout in under 2 minutes." },
      { "icon": "PackageCheck", "title": "Process & Pack Fresh", "text": "Cuts are processed the same morning in sterile, temperature-controlled dark stores." },
      { "icon": "Truck",        "title": "Delivered Fresh",      "text": "Arrives at your door at peak freshness (0-4°C) with end-to-end cold chain." }
    ]
  }'::jsonb,
  20
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- Our Farms — the farm → facility → packaging narrative
--
-- These images live on igo-protien-cut.vercel.app, an external domain. Move
-- them into the igo-website-media bucket via the admin's Media tab so the site
-- doesn't depend on a host you may retire.
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'sections.our_farms',
  'cards',
  '{
    "eyebrow": "FROM OUR NETWORK",
    "heading": "Our Farms",
    "subheading": "From heritage pastures to your kitchen — every stage of the journey, traced honestly.",
    "items": [
      { "label": "Heritage Farms",           "caption": "Nilgiris range, Tamil Nadu",       "image": "https://igo-protien-cut.vercel.app/images/narrative/farm.webp" },
      { "label": "Sterile Processing",       "caption": "ISO 22000 dark stores, 0-4°C",     "image": "https://igo-protien-cut.vercel.app/images/narrative/facility.webp" },
      { "label": "Batch-Tracked Packaging",  "caption": "Scannable farm-to-door QR code",   "image": "https://igo-protien-cut.vercel.app/images/narrative/packaging.webp" }
    ]
  }'::jsonb,
  21
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- Comparison table — was duplicated in WhyIGOSection + TrustSection
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'sections.comparison',
  'table',
  '{
    "eyebrow": "Competitive Edge",
    "heading": "Why Choose IGO Protein Cuts?",
    "subheading": "We''ve set a new benchmark for quality in the meat industry. Compare us with the local market and see the difference transparency makes.",
    "columns": { "feature": "FEATURE", "igo": "IGO Standard", "local": "LOCAL MARKET", "competitor": "COMPETITORS" },
    "rows": [
      { "feature": "Traceability", "igo": "Full Farm-to-Table (QR Scan)", "local": "None / Word of mouth",  "competitor": "Limited batch info" },
      { "feature": "Freshness",    "igo": "Never Frozen (0-4°C Always)",  "local": "Room temp / Variable",  "competitor": "Frozen for storage" },
      { "feature": "Processing",   "igo": "ISO 22000 Sterile Facility",   "local": "Open air market",       "competitor": "Standard warehouse" },
      { "feature": "Delivery",     "igo": "30-90 Min Cold-Chain",         "local": "No delivery",           "competitor": "3-4 hours / Dry bag" },
      { "feature": "Antibiotics",  "igo": "100% Antibiotic-Free",         "local": "Unknown",               "competitor": "Selective" }
    ]
  }'::jsonb,
  22
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- Certifications — merged from three separate lists
--
-- `year` is the expiry/renewal year shown on the Quality Certifications strip;
-- leave it blank to hide the badge.
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'sections.certifications',
  'cards',
  '{
    "eyebrow": "Verified Origins",
    "heading": "Premium Standards, Verified and Trusted.",
    "items": [
      { "name": "ISO 22000",      "icon": "ShieldCheck", "desc": "Food Safety Management",    "year": "2027" },
      { "name": "HACCP",          "icon": "Award",       "desc": "Risk Assessment Standard",  "year": "2027" },
      { "name": "FSSAI Licensed", "icon": "Globe",       "desc": "Lic: 10022043000918",       "year": "2027" },
      { "name": "100% Halal",     "icon": "Sprout",      "desc": "Zabiha certified sourcing", "year": "" }
    ]
  }'::jsonb,
  23
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- Freshness pillars
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'sections.freshness_pillars',
  'cards',
  '{
    "eyebrow": "OUR PROMISE",
    "heading": "The Freshness Promise",
    "items": [
      { "icon": "Thermometer", "title": "0–4°C Cold Chain", "text": "Temperature maintained from farm to your door" },
      { "icon": "Package",     "title": "Vacuum Sealed",    "text": "Hygienic air-tight packaging locks in freshness" },
      { "icon": "Scissors",    "title": "Expert Butchers",  "text": "Cuts by certified professionals, every order" },
      { "icon": "Ban",         "title": "No Preservatives", "text": "Nothing added — just clean, fresh protein" }
    ]
  }'::jsonb,
  24
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- Trust strip — "Built Around Trust, Not Just Delivery"
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'sections.trust_strip',
  'cards',
  '{
    "eyebrow": "WHY CUSTOMERS STAY",
    "heading": "Built Around Trust, Not Just Delivery",
    "items": [
      { "icon": "Truck",       "title": "Fast, on-time delivery",  "text": "Cuts are packed on ice and dispatched within the promised window — most orders arrive early." },
      { "icon": "ShieldCheck", "title": "Hygiene-first sourcing",  "text": "Every cut comes from a facility we audit, cleaned and portioned in a sterile room." },
      { "icon": "Repeat",      "title": "Real subscription support","text": "Pause, skip or change your plan any time — no penalty, no scripts." }
    ]
  }'::jsonb,
  25
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- Popular searches (Explore section)
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'sections.popular_searches',
  'chips',
  '{
    "heading": "Popular right now",
    "items": [
      { "label": "Chicken Breast",  "path": "/search?q=Chicken%20Breast" },
      { "label": "Mutton Curry Cut","path": "/search?q=Mutton%20Curry" },
      { "label": "Prawns",          "path": "/search?q=Prawns" },
      { "label": "Country Chicken", "path": "/search?q=Country%20Chicken" },
      { "label": "Salmon",          "path": "/search?q=Salmon" },
      { "label": "Farm Eggs",       "path": "/search?q=Eggs" }
    ]
  }'::jsonb,
  26
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- Promo tiles — the 4-up strip (Free Delivery / Biryani Kits / etc.)
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'sections.promo_tiles',
  'cards',
  '{
    "items": [
      { "title": "Free Delivery",              "subtitle": "Above ₹499",          "cta": "SHOP NOW",     "path": "/search",                 "image": "/Images/banners/promo-free-delivery-banner.jpg", "theme": "light" },
      { "title": "Biryani Kits",               "subtitle": "Everything included", "cta": "ORDER NOW",    "path": "/category/biryani",       "image": "/Images/banners/biryani-kit.jpg",                "theme": "dark", "badge": "NEW" },
      { "title": "Weekly Fitness Protein Pass","subtitle": "12 deliveries",       "cta": "VIEW PLAN",    "path": "/subscriptions",          "image": "/Images/banners/plan-fitness-banner.jpg",        "theme": "dark" },
      { "title": "Subscribe & Save",           "subtitle": "Up to 20% off",       "cta": "GET STARTED",  "path": "/subscriptions",          "image": "/Images/banners/promo-subscriber-banner.jpg",    "theme": "light" }
    ]
  }'::jsonb,
  27
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- Bundle & Save banner
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'sections.bundle_banner',
  'text',
  '{
    "eyebrow": "COMBO SAVINGS",
    "heading": "Bundle & Save",
    "headingAccent": "Up to 20% Off",
    "body": "Curated combo packs — whole chicken, mutton curry cut, and farm eggs bundled together at a better price than buying separately.",
    "cta": "SHOP COMBO PACKS",
    "path": "/category/combo-packs",
    "badge": "20% OFF",
    "image": "/Images/banners/combo-family-feast-banner.jpg"
  }'::jsonb,
  28
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- Brand / supply partners
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'sections.partners',
  'cards',
  '{
    "eyebrow": "THE IGO SUPPLY NETWORK",
    "heading": "Our Farm & Supply Partners",
    "items": [
      { "title": "Everyday Fresh, Delivered.", "text": "Same-day delivery across the city from our own cold-chain fleet.", "cta": "START YOUR ORDER", "path": "/search",  "image": "/Images/banners/b2c-delivery-banner.jpg" },
      { "title": "Bulk Supply, Simplified.",   "text": "Wholesale pricing and dedicated account management for kitchens.", "cta": "REQUEST WHOLESALE QUOTE", "path": "/b2b", "image": "/Images/banners/b2b-facility-banner.jpg" }
    ]
  }'::jsonb,
  29
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- Footer — contact details and column links
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'site.footer',
  'footer',
  '{
    "tagline": "Farm-to-fork fresh meat and seafood, delivered across India.",
    "email": "support@igoproteincuts.com",
    "phone": "+91 99725 32255",
    "address": "IGO Group HQ, Saibaba Colony, Coimbatore, Tamil Nadu",
    "socials": [
      { "label": "Instagram", "url": "https://www.instagram.com/igoproteincuts/" },
      { "label": "Facebook",  "url": "" },
      { "label": "YouTube",   "url": "" }
    ],
    "columns": [
      {
        "title": "COMPANY",
        "links": [
          { "label": "About Us",        "path": "/about" },
          { "label": "Careers",         "path": "/careers" },
          { "label": "Contact",         "path": "/contact" },
          { "label": "Franchise",       "path": "/franchise" }
        ]
      },
      {
        "title": "SHOP",
        "links": [
          { "label": "All Products",    "path": "/search" },
          { "label": "Offers",          "path": "/offers" },
          { "label": "Combo Packs",     "path": "/category/combo-packs" },
          { "label": "Subscriptions",   "path": "/subscriptions" }
        ]
      },
      {
        "title": "SUPPORT",
        "links": [
          { "label": "Help Centre",     "path": "/support" },
          { "label": "Track Order",     "path": "/account" },
          { "label": "Returns",         "path": "/policy" },
          { "label": "Privacy Policy",  "path": "/policy" }
        ]
      }
    ],
    "copyright": "© IGO Protein Cuts. All rights reserved."
  }'::jsonb,
  30
) on conflict (key) do nothing;


-- ============================================================================
-- VERIFY — expect 20 blocks after 0010 + 0011
-- ============================================================================
-- select key, content_type, is_active, display_order
-- from public.igo_site_content
-- order by display_order;
-- ============================================================================
