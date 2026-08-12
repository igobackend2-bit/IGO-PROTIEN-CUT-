# Website Content Admin — Plan

**Goal:** edit every image, heading and content block on the site from `/admin`,
with no code changes and no redeploy.

**Scope rule (unchanged):** website code and `igo_*` tables only. The mobile app,
the Flutter admin, the `admin-*` Edge Functions and every existing app table stay
untouched.

---

## What's already editable vs what isn't

**Already live from the database** — your Flutter admin controls these today:
products, prices, stock, availability, categories, coupons, offers, combo packs,
FAQs, reviews, orders, customers.

**Still hardcoded in code** — this is the work:

| # | Content area | Where it lives now |
|---|---|---|
| 1 | Hero headlines + subtext | `HomePage.tsx` `heroThemes` |
| 2 | Hero background images | `HomePage.tsx` `heroImages` |
| 3 | Promo carousel slides | `HomePage.tsx` `promoSlides` |
| 4 | Category circles ("Farm to Fork") | `HomePage.tsx` `categoryCards` |
| 5 | Instagram strip (6 tiles) | `HomePage.tsx` `instagramPosts` |
| 6 | Stats band (10,000+ / 0-4°C / 89+) | `HomePage.tsx` inline |
| 7 | Trust cards (Fast Delivery, etc.) | `TestimonialsSection` `valueProps` |
| 8 | Comparison table (IGO vs market) | `WhyIGOSection` + `TrustSection` |
| 9 | Certifications (ISO/HACCP/FSSAI) | 3 separate files, duplicated |
| 10 | How It Works (3 steps) | `HowItWorksSection` `steps` |
| 11 | Our Farms (3 cards) | `OurFarmsSection` `journey` |
| 12 | Freshness pillars | `FreshnessPromiseSection` `pillars` |
| 13 | Traceability features | `TraceabilitySection` `features` |
| 14 | Popular searches | `ExploreSection` `popularSearches` |
| 15 | Brand partner logos | `BrandPartnersSection` `brandIds` |
| 16 | Promo tiles (Free Delivery etc.) | `PromoTileStrip` |
| 17 | Bundle & Save banner | `TodaysDealsBanner` |
| 18 | Subscription plans (4) | `mockData` `INITIAL_SUBSCRIPTION_PLANS` |
| 19 | Recipes (3) | `mockData` `INITIAL_RECIPES` |
| 20 | Guides / Cook It Right | `mockData` `INITIAL_BLOGS` |
| 21 | App download banner + QR | `HomePage.tsx` inline |
| 22 | Newsletter band | `HomePage.tsx` inline |
| 23 | Footer links + contact | `Footer.tsx` |
| 24 | Static page copy | About / B2B / Careers / Contact / Policy |
| 25 | SEO per page | not stored anywhere |

---

## Architecture

### One generic table, not 25 specific ones

`igo_site_content` already exists from migration 0004:

```sql
key           text unique      -- 'home.hero', 'home.categories'
content_type  text             -- hero | slides | cards | table | stats | text
payload       jsonb            -- shape depends on content_type
is_active     boolean
display_order int
```

A jsonb payload means adding a new content block never needs a migration. The
admin renders a form based on `content_type`, so six form types cover all 25
areas.

### Every section falls back to its hardcoded array

```ts
const hero = useSiteContent('home.hero', HERO_FALLBACK);
```

If the row is missing, unpublished, or Supabase is unreachable, the section
renders exactly what it renders today. **The site can never go blank because a
content row was deleted.** This is the same stale-while-revalidate approach the
catalog uses.

### Images need a website-owned bucket

The app's `product-images` bucket is admin-gated and belongs to the product
catalog. Website media gets its own:

```sql
insert into storage.buckets (id, name, public)
values ('igo-website-media', 'igo-website-media', true)
on conflict (id) do nothing;
```

Public read; writes restricted to active `admin_users` via the
`igo_is_active_admin()` function already created in 0008.

---

## Phases

### Phase A — Foundation *(2–3 days)*

1. Migration `0010`: seed `igo_site_content` with all 25 blocks, using the
   current hardcoded values as their initial payload. Nothing changes visually.
2. Create the media bucket + RLS policies.
3. `src/lib/hooks/useSiteContent.ts` — reads a block by key, caches it, falls
   back to a supplied default.
4. `src/lib/api/media.ts` — upload, list, delete images in the bucket.

**Exit:** every block exists in the database with today's content. Site unchanged.

### Phase B — Media library *(2 days)*

New **Media** tab in `/admin`: drag-and-drop upload, grid of images, copy-URL
button, delete. Every other tab picks images from here.

This comes early because 11 of the 25 areas are image-driven — without it you'd
be pasting URLs by hand.

### Phase C — Homepage content *(4–5 days)*

Wire areas 1–6 and 21–22. These are the most visible and the ones you'll change
most often.

Admin gets a **Homepage** tab with a section per block:

- **Hero** — headline, highlight line, subtext, badges, background image
- **Promo slides** — repeatable: image, title, subtitle, CTA text, link
- **Categories** — repeatable: name, image, link, "NEW"/"BESTSELLER" badge
- **Instagram** — 6 image slots + links
- **Stats** — 3 number/label pairs
- **App banner** — heading, text, QR image, store links

Each block gets live preview and a Publish toggle so you can stage changes.

### Phase D — Trust & marketing sections *(3–4 days)*

Areas 7–17. Mostly repeatable card lists and two comparison tables.

Worth noting: certifications are currently **duplicated across three files** with
slightly different wording. Phase D collapses them into one block, so you edit
once and it updates everywhere.

### Phase E — Plans, recipes, guides *(3 days)*

Areas 18–20. These are structured enough to deserve their own tables rather than
jsonb:

```sql
igo_subscription_plans   -- title, price, cadence, features[], badge, image
igo_recipes              -- title, image, prep_time, difficulty, ingredients[], steps[]
igo_guides               -- title, image, excerpt, body, category
```

### Phase F — Static pages & SEO *(3 days)*

Areas 23–25. A block-based editor for About / B2B / Careers / Contact / Policy,
plus per-page SEO (title, description, OG image) stored in `igo_page_seo`.

---

## Effort

| Phase | Work | Est. |
|---|---|---|
| A | Foundation + seed | 2–3 d |
| B | Media library | 2 d |
| C | Homepage | 4–5 d |
| D | Trust & marketing | 3–4 d |
| E | Plans / recipes / guides | 3 d |
| F | Static pages + SEO | 3 d |

**≈ 3 weeks total.** Phases are independent after A and B — you can stop after C
and still have the highest-value 40% under admin control.

---

## What the admin will look like when done

```
/admin
├── Homepage        hero, promos, categories, instagram, stats, app banner
├── Sections        trust cards, comparison, certs, how-it-works, farms
├── Media           upload / browse / delete images
├── Plans           subscriptions, recipes, guides
├── Pages           About, B2B, Careers, Contact, Policy + SEO
├── Weight Options  (built)
├── SEO             per-product (built)
└── Leads           B2B & franchise (built)
```

Products, prices, stock, orders and customers deliberately stay in the Flutter
admin — one editor per field, no drift.

---

## Risks

| Risk | Mitigation |
|---|---|
| Deleting a block blanks a section | Every block has a hardcoded fallback; deletion reverts to it |
| Bad image URL breaks layout | `FadeImage` already falls back to the brand mark |
| Content edits go live instantly | `is_active` toggle = draft/publish per block |
| Large images slow the site | Media library warns above 500 KB and reports dimensions |
| Someone edits products here by mistake | Admin banner points at the Flutter dashboard for catalog work |

---

## Decision needed

Three weeks is the full scope. Two smaller cuts are worth considering:

- **Phase A + B + C only** (~1.5 weeks) — hero, promos, categories, Instagram,
  stats, app banner, plus the media library. That's everything above the fold and
  the content you'd realistically change weekly.
- **Phase A + B + C + D** (~2 weeks) — adds trust cards, comparison tables and
  certifications, which is effectively the whole homepage.

Phases E and F cover content that changes rarely — subscription plans, recipes,
policy pages — and can wait.
