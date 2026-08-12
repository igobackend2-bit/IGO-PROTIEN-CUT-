# Project State — resume from here

**Last updated:** 30 July 2026, end of day

> **If you're a new session:** read this file first, then `CLAUDE.md` for the
> scope rules. Everything below is current as of the last commit.

---

## Owner preferences — remember these, factor into future suggestions

Standing decisions from the site owner, not just one-off fixes. Any future
session/agent should read this before proposing new nav/header features.

| Date | Preference |
|---|---|
| 1 Aug 2026 | Removed the AI Search feature, the header Calculator button, and the header Call button from the navbar (`src/components/Navbar.tsx`, desktop + mobile drawer) — owner said they don't want these. Don't re-add or re-suggest them without asking first. The underlying `AISearchModal` / `ProteinCalculatorModal` components and their wiring in `App.tsx` were left in place (unreachable, harmless) rather than deleted, in case they're wanted back later. |

---

## Where things stand

**The website is live and running off the database.**
https://igo-protein-cuts-website.vercel.app

The Flutter admin at `protein-cuts-admin.vercel.app` now controls the website's
catalog, prices, stock, availability, categories, coupons, offers and combos.
Orders placed on the website land in that admin's Orders queue.

---

## Completed

### Data layer — DONE
- Website reads catalog from canonical `products` (89 SKUs) with weight ladders
- Real Supabase Auth — one login across app, admin and website
- Orders write to canonical `orders` / `order_items` / `addresses` / `payments`
- Live order tracking over Supabase Realtime
- B2B/franchise leads → `igo_leads`

### Security — DONE
- Removed fake client-side login (granted Super Admin to any email containing "admin")
- `/admin` gated on an active row in `admin_users`
- Silent order-write failures now surface to the customer
- No service-role key anywhere in `src/`

### Website admin — DONE (4 tabs)
`/admin` slimmed from 10 duplicated tabs to: Banners & Content, Weight Options,
SEO, B2B & Franchise Leads. Products/orders/inventory/customers deliberately
removed — the Flutter admin owns those.

### Deployment — DONE
- Pushed to `igobackend2-bit/IGO-PROTIEN-CUT-` monorepo at `apps/website`
- Vercel: Root Directory `apps/website`, env vars set, deploying green
- `apps/mobile`, `apps/admin` and `supabase/` never touched

---

## Migrations applied to Supabase (`aweevhgnbjuxcvnvjeie`)

| File | What it did | Status |
|---|---|---|
| `0004_website_support.sql` | 4 new `igo_*` tables | ✅ run |
| `0005_seed_weight_ladders.sql` | 500g/1kg ladders for existing products | ✅ run |
| `0006_add_missing_products.sql` | Added 44 products (45 → 89) | ✅ run |
| `0007_fix_website_image_urls.sql` | Rewrote images to igoproteincuts.com | ✅ run — **then reverted** |
| `0008_website_admin_policies.sql` | Admin write policies on `igo_*` | ✅ run |
| `0009_revert_image_urls.sql` | Undid 0007 (domain doesn't resolve) | ✅ run |
| `0010_content_foundation.sql` | Media bucket + 9 content blocks | ✅ run |
| `0011_content_sections.sql` | 11 section blocks | ✅ run |
| `0012_pages_and_seo.sql` | Plans, recipes, guides, pages, SEO | ✅ run |
| `0013_product_list_price.sql` | Website-owned list price / merchandising badges | ✅ run |
| `0014_admin_page_order.sql` | Admin block ordering + product-rail headings | ✅ run |
| `0015_combo_and_flash_blocks.sql` | Combo Packs / Flash Deals headings | ✅ run |
| `0016_ticker_strip.sql` / `0016_ticker_block.sql` | Homepage ticker strip content (duplicate pair, both ran — harmless, inserts are `on conflict do nothing`) | ✅ run |
| `0017_review_moderation_policies.sql` | Admin approve/reject/delete + customer delete-own RLS policies on `product_reviews` (no schema change — `is_hidden` already existed) | ✅ run |
| `0018_order_feedback.sql` | **NEW table** `igo_order_feedback` (website-owned) for post-delivery "how was your delivery" feedback + RLS | ✅ run |

---

## Post-delivery feedback form (added 3 Aug 2026)

Two-part feedback, both reachable from a new "Rate Your Order" button on a
**Delivered** order in the account page's My Orders tab (opens
`OrderFeedbackModal.tsx`):
1. **Per-product review** — reuses the existing `product_reviews` flow
   (`reviews.ts` `submitReview`), same admin moderation queue at
   `/admin` → Reviews, same "goes live on the product page once approved"
   behaviour that already existed. No new table for this half.
2. **Delivery experience** — new, in the brand-new `igo_order_feedback` table
   (`orderFeedback.ts`), surfaced at `/admin` → Delivery Feedback (new tab,
   `FeedbackTab` in `AdminDashboard.tsx`) with a "mark reviewed" action.

**Flutter admin team**: `igo_order_feedback` lives in the same shared
Supabase project — if you want a screen for it in the Flutter admin too, it's
a plain table (`id, order_id, user_id, delivery_rating, comment, status,
created_at`), readable with any Supabase client once `igo_is_active_admin()`
recognizes the signed-in admin (same check the website's own admin already
uses). No app-side schema change needed — this is a new table, not a change
to `orders` or anything else you own.

**Status:** migration run ✅ (3 Aug 2026). Code still needs to be pushed to
GitHub (see DEPLOY.md) for this to appear on the live site.

---

## Content Admin — ALL 6 PHASES CODE-COMPLETE

Goal: make every hardcoded content area editable from `/admin`.
See `CONTENT_ADMIN_PLAN.md` for the original plan.

**Code is written, type-checks clean, and builds (76 images in dist).
Three migrations still need running.**

| Phase | What | Status |
|---|---|---|
| A | Foundation — media bucket, `useSiteContent`, `media.ts` | ✅ code done |
| B | Media library — upload/browse/delete + image picker | ✅ code done |
| C | Homepage — hero, hero images, promos, categories, Instagram, stats | ✅ wired |
| D | Sections — how-it-works, farms, comparison, certs, pillars, trust strip | ✅ wired |
| E | Plans, recipes, guides | ✅ code done |
| F | Static pages + per-page SEO | ✅ code done |

### New files
```
src/lib/hooks/useSiteContent.ts        read a block, fall back to hardcoded
src/lib/iconMap.ts                     icon NAME → Lucide component
src/lib/api/media.ts                   igo-website-media bucket
src/components/admin/MediaLibrary.tsx  upload UI + image picker
src/components/admin/ContentEditor.tsx generic form for all 28 blocks
```

### `/admin` now has 9 tabs
Homepage · Sections · Plans & Recipes · Pages & SEO · Media · Banners ·
Weight Options · Product SEO · Leads

### Consolidations done
- Comparison table was duplicated in `WhyIGOSection` + `TrustSection` → one block
- Certifications existed in **3 files with 3 different lists** (one had a
  duplicate "ISO 22000 Certified", another omitted Halal) → one block

---

## NEXT ACTION when resuming

**All migrations 0010–0016 ran successfully on 3 Aug 2026** (confirmed via
Supabase SQL editor — every insert returned "Success. No rows returned",
which is expected for `on conflict do nothing` seed inserts).

Remaining steps:

1. **Verify in the admin UI** — sign into the website as an admin, open
   `/admin`, and confirm all the content tabs (Homepage, Sections, Plans &
   Recipes, Pages & SEO, etc.) now show real rows instead of "No content
   blocks found".
2. **Spot-check the live site** — the homepage, subscriptions/recipes/guides
   pages, and any static pages should look identical to before (these
   migrations only seed data to match the existing hardcoded fallbacks) —
   confirm nothing visually changed unexpectedly.
3. **Still open, unrelated to 0010–0016:** the review-moderation feature
   (`is_hidden` column + admin approve/reject/delete policies on
   `product_reviews`) has no migration file in this repo — if that was set up
   by hand in the SQL editor, double check it's actually live; the /admin
   Reviews tab depends on it.
4. **Still open:** add `https://<your-site>/**` under Supabase Auth → URL
   Configuration → Redirect URLs, or the password-reset flow won't return a
   working session.
5. Push to GitHub (`DEPLOY.md` has the commands) and Vercel auto-deploys.

Typecheck clean and build verified at last save.

---

## Open issues, not blockers

| Issue | Detail |
|---|---|
| **`igoproteincuts.com` doesn't resolve** | Domain bought but DNS not pointed anywhere. Unrelated to this work. |
| **Hostinger deploy fails** | `FTPError: 530 Login incorrect` — hosting not provisioned yet. User said leave it; they'll say when ready. Build itself passes. |
| **44 products have relative image paths** | Work on the website, show a placeholder in the mobile app. Permanent fix: upload photos via the Flutter admin → Supabase Storage. |
| **Nutrition empty on original 45 products** | `protein_per_100g` / `fat_per_100g` null → PDP shows "—". Fill in the Flutter admin. |
| **Hero images point at `igo-protien-cut.vercel.app`** | External domain; may break. Move to `igo-website-media` in Phase B. |
| **Second Vercel project** | `igo-protien-cut.vercel.app` also watches the repo and posts failed checks. Worth disconnecting. |
| **Supabase redirect URL** | Add `https://igo-protein-cuts-website.vercel.app/**` under Auth → URL Configuration, or password resets break. |

---

## Decisions already made — don't re-litigate

| Decision | Choice |
|---|---|
| Weight pricing | `products.price × price_multiplier`, with nullable `price_override` |
| Membership tiers | App's Bronze/Silver/Gold/Platinum (website's Gold/Platinum/Elite dropped) |
| Missing SKUs | Added all 44 to `products` — they appear in the mobile app too |
| Auth | Supabase email + password |
| Website `/admin` | Kept, slimmed to website-only content |
| Content storage | `igo_site_content` with jsonb payloads, not one table per block |
| Media bucket | New `igo-website-media`, separate from the app's `product-images` |

---

## Reference docs in this folder

- `CLAUDE.md` — scope rules (**read first**)
- `CONTENT_ADMIN_PLAN.md` — the in-progress content admin plan
- `DEPLOY.md` — GitHub + Vercel + Hostinger deployment
- `WHAT_I_BUILT.md` — what the database integration changed
- `STEP_BY_STEP_PLAN.md` — the original website↔admin integration plan
