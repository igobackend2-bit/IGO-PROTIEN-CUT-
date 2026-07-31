# Project State — resume from here

**Last updated:** 30 July 2026, end of day

> **If you're a new session:** read this file first, then `CLAUDE.md` for the
> scope rules. Everything below is current as of the last commit.

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
| `0010_content_foundation.sql` | Media bucket + 9 content blocks | ⏳ **NOT RUN YET** |

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

**Run these three migrations in the Supabase SQL editor, in order:**

1. `0010_content_foundation.sql` — media bucket + 9 homepage blocks
2. `0011_content_sections.sql` — 11 section blocks
3. `0012_pages_and_seo.sql` — plans, recipes, guides, pages, SEO

Then sign into the website as an admin, open `/admin`, and the tabs populate.
Until they run, `/admin` shows "No content blocks found" and **the site renders
from the hardcoded fallbacks — nothing breaks.**

After that: push to GitHub (`DEPLOY.md` has the commands) and Vercel
auto-deploys.

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
