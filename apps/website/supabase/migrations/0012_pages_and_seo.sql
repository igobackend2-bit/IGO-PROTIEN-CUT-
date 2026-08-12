-- ============================================================================
-- IGO Protein Cuts — Plans, recipes, guides, static pages and SEO
-- (Phases E + F)
--
-- DESIGN DECISION
-- The plan originally proposed three dedicated tables (igo_subscription_plans,
-- igo_recipes, igo_guides). They're stored as content blocks instead, because:
--
--   • jsonb payloads mean adding a field never needs a migration
--   • the generic ContentEditor already edits them with zero new UI code
--   • none of this data is queried, filtered or joined — it's read whole and
--     rendered, which is exactly what a content block is for
--
-- If recipes later need search or per-recipe URLs, promoting them to a real
-- table is a contained change: the payload shape becomes the column list.
--
-- SCOPE: igo_site_content only. No app table touched.
-- SAFETY: `on conflict (key) do nothing` — never overwrites your edits.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- SUBSCRIPTION PLANS
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'plans.subscriptions',
  'cards',
  '{
    "eyebrow": "AUTOMATE YOUR PROTEIN",
    "heading": "Protein Cuts Subscriptions",
    "items": [
      {
        "id": "plan-01",
        "title": "Daily Fitness Protein Plan",
        "tagline": "Never run out of gym protein",
        "category": "Fitness",
        "frequency": "Daily",
        "pricePerMonth": 2999,
        "originalPrice": 3600,
        "savings": "Save ₹601 / month",
        "recommendedFor": "Athletes, Gym Goers & Macro Trackers",
        "badge": "MOST POPULAR",
        "itemsIncluded": ["500g Boneless Chicken Breast", "6 Organic Eggs", "Free Express Morning Delivery"]
      },
      {
        "id": "plan-02",
        "title": "Weekly Family Meat Box",
        "tagline": "Fresh weekend feasting automated",
        "category": "Family",
        "frequency": "Weekly",
        "pricePerMonth": 3499,
        "originalPrice": 4200,
        "savings": "Save ₹701 / month",
        "recommendedFor": "Families of 3 to 5 Members",
        "badge": "",
        "itemsIncluded": ["1kg Curry Cut Chicken", "500g Mutton Cut", "500g Seer Fish Steaks", "30 Eggs Tray"]
      },
      {
        "id": "plan-03",
        "title": "Monthly Elite Meat Pass",
        "tagline": "Premium cuts, every month",
        "category": "Premium",
        "frequency": "Monthly",
        "pricePerMonth": 4999,
        "originalPrice": 6200,
        "savings": "Save ₹1,201 / month",
        "recommendedFor": "Households that cook premium often",
        "badge": "",
        "itemsIncluded": ["Premium steak selection", "Seafood platter", "Priority delivery slots"]
      },
      {
        "id": "plan-04",
        "title": "BBQ & Grill Pack",
        "tagline": "Weekend grilling, sorted",
        "category": "Lifestyle",
        "frequency": "Weekly",
        "pricePerMonth": 3199,
        "originalPrice": 3900,
        "savings": "Save ₹701 / month",
        "recommendedFor": "Weekend hosts and grill enthusiasts",
        "badge": "",
        "itemsIncluded": ["Marinated wings", "Mutton chops", "Grill-ready prawns"]
      }
    ]
  }'::jsonb,
  40
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- RECIPES
--
-- `ingredients` and `steps` are string arrays — the ContentEditor renders each
-- as an add/remove list.
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'plans.recipes',
  'cards',
  '{
    "eyebrow": "COOK LIKE A CHEF",
    "heading": "Signature Meat Recipes",
    "items": [
      {
        "id": "rec-01",
        "title": "Authentic Chettinad Pepper Chicken",
        "category": "chicken",
        "prepTime": "15 mins",
        "cookTime": "25 mins",
        "servings": 4,
        "difficulty": "Medium",
        "calories": "320 kcal",
        "protein": "35g",
        "image": "/Images/chicken-whole.png",
        "ingredients": [
          "500g Fresh Farm Chicken Curry Cut",
          "2 tbsp Roasted Black Peppercorns",
          "1 tbsp Fennel Seeds & Cumin",
          "15 Shallots (Small Onions)",
          "Fresh Curry Leaves & Ginger Garlic Paste"
        ],
        "steps": [
          "Dry roast black peppercorns, fennel seeds and cumin until fragrant. Grind to a coarse powder.",
          "Sauté shallots and curry leaves until golden, then add ginger garlic paste.",
          "Add the chicken and sear on high heat until the edges colour.",
          "Stir in the ground spice mix, cover and cook 20 minutes until tender."
        ]
      },
      {
        "id": "rec-02",
        "title": "Royal Mutton Rogan Josh",
        "category": "mutton",
        "prepTime": "20 mins",
        "cookTime": "45 mins",
        "servings": 4,
        "difficulty": "Medium",
        "calories": "410 kcal",
        "protein": "32g",
        "image": "/Images/mutton-curry.png",
        "ingredients": [
          "750g Mutton Curry Cut",
          "1 cup Thick Yogurt",
          "2 tbsp Kashmiri Chilli Powder",
          "Whole spices — cardamom, cloves, bay leaf"
        ],
        "steps": [
          "Marinate the mutton in yogurt and chilli powder for 30 minutes.",
          "Temper whole spices in ghee until aromatic.",
          "Add the marinated mutton and brown well.",
          "Pressure cook 20 minutes, then simmer uncovered to thicken."
        ]
      },
      {
        "id": "rec-03",
        "title": "Crispy Rajasoman Tawa Fry",
        "category": "fish",
        "prepTime": "10 mins",
        "cookTime": "12 mins",
        "servings": 2,
        "difficulty": "Easy",
        "calories": "260 kcal",
        "protein": "28g",
        "image": "/Images/seer-fish.png",
        "ingredients": [
          "400g Seer Fish Steaks",
          "2 tbsp Rice Flour",
          "1 tsp Turmeric & Chilli Powder",
          "Curry leaves, lemon"
        ],
        "steps": [
          "Marinate the steaks in turmeric, chilli and salt for 10 minutes.",
          "Dust lightly with rice flour for the crust.",
          "Shallow fry 4 minutes a side on a hot tawa.",
          "Finish with curry leaves and a squeeze of lemon."
        ]
      }
    ]
  }'::jsonb,
  41
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- GUIDES — "Cook It Right"
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'plans.guides',
  'cards',
  '{
    "eyebrow": "KITCHEN KNOW-HOW",
    "heading": "Cook It Right",
    "items": [
      {
        "id": "guide-01",
        "title": "How to Store Fresh Cuts at Home",
        "excerpt": "Keep meat at its best from the moment it arrives — chilling, portioning and freezing without losing texture.",
        "image": "/Images/Meat Images/Chicken/Whole Chicken.jpg",
        "readTime": "4 min read",
        "category": "Storage"
      },
      {
        "id": "guide-02",
        "title": "The Ultimate Dry Fish Buying Guide",
        "excerpt": "What to look for in karuvadu — colour, smell, moisture — and how to soak and cook it properly.",
        "image": "/Images/Meat Images/Fish/Anchovy.jpg",
        "readTime": "6 min read",
        "category": "Buying"
      },
      {
        "id": "guide-03",
        "title": "Marinated Chicken Cooking Tips for Perfect Results",
        "excerpt": "Marination time, heat control and resting — the three things that separate juicy from dry.",
        "image": "/Images/Meat Images/Chicken/Chicken Wings.jpg",
        "readTime": "5 min read",
        "category": "Cooking"
      }
    ]
  }'::jsonb,
  42
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- STATIC PAGE COPY
--
-- One block per page. `sections` is a list of heading/body pairs so a page can
-- grow without a schema change.
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'pages.about',
  'page',
  '{
    "title": "About IGO Protein Cuts",
    "intro": "Farm-to-fork fresh meat and seafood, built on traceability rather than promises.",
    "heroImage": "https://igo-protien-cut.vercel.app/images/narrative/farm.webp",
    "sections": [
      { "heading": "Our Story",   "body": "IGO Protein Cuts began with a simple frustration: you could not find out where your meat came from. We built our own supply chain to fix that — heritage farms, our own cold-chain fleet, and a batch ID on every pack." },
      { "heading": "How We Source", "body": "Every partner farm is audited before it supplies us, and every cut is processed the same morning in ISO 22000 facilities held at 0-4°C." },
      { "heading": "What We Promise", "body": "Never frozen. No antibiotics. No preservatives. If a cut does not meet the grade, it does not ship." }
    ]
  }'::jsonb,
  50
) on conflict (key) do nothing;

insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'pages.b2b',
  'page',
  '{
    "title": "Bulk & Wholesale Supply",
    "intro": "Consistent quality and dedicated account management for restaurants, caterers and cloud kitchens.",
    "heroImage": "/Images/banners/b2b-facility-banner.jpg",
    "contactEmail": "b2b@igoproteincuts.com",
    "sections": [
      { "heading": "Why kitchens choose IGO", "body": "Same-morning processing, guaranteed cut specifications, and a fixed delivery window you can build a prep schedule around." },
      { "heading": "What we supply",         "body": "Chicken, mutton, beef, seafood and eggs at wholesale volumes, cut to your spec and delivered in cold-chain packaging." }
    ]
  }'::jsonb,
  51
) on conflict (key) do nothing;

insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'pages.careers',
  'page',
  '{
    "title": "Careers at IGO",
    "intro": "We are building India''s most transparent protein supply chain. Come help.",
    "heroImage": "",
    "sections": [
      { "heading": "How we work", "body": "Small teams, real ownership, and a bias toward shipping. Most of our roles are in Coimbatore, with some remote." }
    ]
  }'::jsonb,
  52
) on conflict (key) do nothing;

insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'pages.contact',
  'page',
  '{
    "title": "Contact Us",
    "intro": "Questions about an order, a partnership, or anything else — we read every message.",
    "heroImage": "",
    "email": "support@igoproteincuts.com",
    "phone": "+91 99725 32255",
    "address": "IGO Group HQ, Saibaba Colony, Coimbatore, Tamil Nadu",
    "hours": "Mon–Sat, 7:00 AM – 9:00 PM",
    "sections": []
  }'::jsonb,
  53
) on conflict (key) do nothing;


-- ---------------------------------------------------------------------------
-- PER-PAGE SEO
--
-- One block holding every page's title / description / OG image, so it can be
-- edited in one screen rather than page by page.
-- ---------------------------------------------------------------------------
insert into public.igo_site_content (key, content_type, payload, display_order)
values (
  'seo.pages',
  'seo',
  '{
    "items": [
      { "path": "/",              "title": "IGO Protein Cuts — Farm Fresh Chicken, Mutton, Seafood & Gym Protein, Delivered in 30 Min", "description": "India''s farm-to-table protein enterprise. 100% antibiotic-free chicken, mutton, seafood and eggs, hand-trimmed fresh and delivered under 0-4°C cold chain in 30 minutes.", "ogImage": "/og-image.jpg" },
      { "path": "/search",        "title": "Shop Fresh Meat & Seafood Online — IGO Protein Cuts", "description": "Browse fresh chicken, mutton, beef, fish and eggs. Hand-trimmed to order, never frozen, delivered in 30 minutes.", "ogImage": "/og-image.jpg" },
      { "path": "/offers",        "title": "Offers & Combo Deals — IGO Protein Cuts", "description": "Combo packs, flash deals and subscriber savings on farm-fresh meat and seafood.", "ogImage": "/og-image.jpg" },
      { "path": "/subscriptions", "title": "Meat Subscriptions — IGO Protein Cuts", "description": "Automate your protein. Daily, weekly and monthly plans with free delivery and priority slots.", "ogImage": "/og-image.jpg" },
      { "path": "/about",         "title": "About IGO Protein Cuts", "description": "How we source, process and deliver — the traceable farm-to-fork supply chain behind every cut.", "ogImage": "/og-image.jpg" },
      { "path": "/b2b",           "title": "Bulk & Wholesale Meat Supply — IGO Protein Cuts", "description": "Wholesale meat and seafood for restaurants, caterers and cloud kitchens across India.", "ogImage": "/og-image.jpg" },
      { "path": "/contact",       "title": "Contact IGO Protein Cuts", "description": "Get in touch about orders, partnerships or franchise enquiries.", "ogImage": "/og-image.jpg" }
    ]
  }'::jsonb,
  60
) on conflict (key) do nothing;


-- ============================================================================
-- VERIFY — expect 28 blocks total after 0010 + 0011 + 0012
-- ============================================================================
-- select key, content_type, is_active, display_order
-- from public.igo_site_content
-- order by display_order;
-- ============================================================================
