# What's built — website connected to the database + admin

**Date:** 30 July 2026 · Website files only. App and admin untouched.

---

## Your next 3 steps

### 1. Run the migration *(2 minutes)*

Open the [SQL Editor](https://supabase.com/dashboard/project/aweevhgnbjuxcvnvjeie/sql/new),
paste **`supabase/migrations/0004_website_support.sql`**, run it.

Creates four new `igo_*` tables. Contains **no `ALTER`, no `DROP`** against any
existing table — verified. The app and admin never read these tables.

### 2. Check `.env`

```env
VITE_SUPABASE_URL="https://aweevhgnbjuxcvnvjeie.supabase.co"
VITE_SUPABASE_ANON_KEY="<your anon key>"
VITE_CATALOG_SOURCE="supabase"
```

Then `npm install` (adds `@supabase/supabase-js`) and `npm run dev`.

### 3. Verify it worked

- Open the website → products should now come from your **admin's** `products` table
- Change a price in the admin → refresh the site → new price appears
- Toggle `is_available` off → the product disappears
- Sign in with an app customer's credentials → their real orders and wallet show
- Place an order → it appears in the admin's Orders screen, assignable to a rider

**Instant rollback:** set `VITE_CATALOG_SOURCE=local` and redeploy. No code change.

---

## What changed

### New files

| File | Purpose |
|---|---|
| `supabase/migrations/0004_website_support.sql` | 4 new `igo_*` tables |
| `src/lib/supabase.ts` | Real Supabase client (anon key only) |
| `src/lib/adapters/productAdapter.ts` | `products` + variants + meta → website `Product` |
| `src/lib/api/catalog.ts` | Catalog / categories / offers / combos / coupons / FAQs / leads |
| `src/lib/api/auth.ts` | Supabase Auth, profiles, loyalty, admin check |
| `src/lib/api/orders.ts` | Order write + read + Realtime tracking |
| `src/vite-env.d.ts` | Typed env vars |

### Modified

| File | Change |
|---|---|
| `src/lib/storage.ts` | Catalog, coupons and orders now hydrate from Supabase |
| `src/App.tsx` | Real `/admin` guard; catalog hydration on mount |
| `src/lib/supabaseClient.ts` | **Deleted the fake login** |
| `src/components/UserAuthModal.tsx` | Supabase Auth (sign in / sign up / reset) |
| `src/pages/UserAccountPage.tsx` | Real orders, real loyalty tier, real sign-out |
| `src/pages/CartPage.tsx` | Order → canonical tables, errors surfaced |
| `src/components/CheckoutModal.tsx` | Same, plus payment-succeeded-but-save-failed handling |
| `src/components/LiveOrderTracking.tsx` | Realtime subscription |
| `package.json`, `.env.example` | Dependency + env docs |

---

## What the admin now controls on the website

Straight from the canonical tables, no admin changes:

**Products** · name, description, price, images, category, weight, protein/fat,
storage instructions, brand, availability, stock, low-stock threshold
**Categories** · name, emoji, display order, active
**Coupons** · code, discount type/value, min order, active
**Offers** · flash sales, festival banners, priority, date windows
**Combo packs** · items, discount, bundle type
**FAQs** · question, answer, category, priority
**Orders** · web orders appear in the admin queue; status changes push live to
the customer's tracking page via Realtime
**Reviews** · hidden reviews stay hidden on the website
**Customers** · website signups appear in the admin's Customers screen

---

## Security fixed

| Before | After |
|---|---|
| `loginWithEmail()` minted a session with **no password check** | Supabase Auth |
| `email.includes('admin')` → **Super Admin** | Checked against `admin_users` |
| `/admin` reachable by **anyone**, no guard | Gated on an active admin row |
| Failed order writes returned `{success: true}` | Failures surfaced to the customer |

Still outstanding, and worth doing today: run `git log --all -- .env`. If the
service-role key was ever committed, rotate it — it bypasses RLS on the
database your live app uses.

---

## Design decisions

**Stale-while-revalidate.** `getProducts()` and `getOrders()` stayed
synchronous, so none of their ~20 call sites changed. They return the cached
copy immediately; `hydrateCatalog()` / `hydrateOrders()` refresh in the
background and fire an event. A Supabase outage degrades to the last good
catalog rather than an empty shop.

**One translation point.** `productAdapter.ts` is the only file that knows the
shape of a `products` row. Schema changes land there and nowhere else.

**Weight pricing.** `price = products.price × price_multiplier`, unless
`price_override` is set. Multiplier is the default so an admin price edit flows
through every weight automatically and the website can't drift. Override is the
escape hatch for exact price points — this is the "both options" you asked for.

**Category mapping** mirrors the app's `_mapCategory` in
`product_model.dart`, so app and website always agree on which category a
product is in even though `products.category` is free text.

**Membership tiers** now follow the app's Bronze/Silver/Gold/Platinum, computed
from `reward_transactions`. The website's old Gold/Platinum/Elite ladder is
gone — both read the same `profiles` row, so only one could be true.

---

## Known limitations

**T1 — the admin can't tell web orders from app orders.** That needs a `channel`
column on `orders`, which would mean altering an app table. Web orders write a
shadow row to `igo_orders` with the canonical order id, so the split is
recoverable by joining if you want it later.

**T2 — weight ladders aren't admin-editable.** They live in
`igo_product_variants`. Base price and stock are still fully admin-controlled.

**T3 — banners, SEO and leads aren't in the Flutter admin.** They're in `igo_*`
tables. The website's `/admin` page should be slimmed to just these four things
(products/orders/inventory/customers tabs now duplicate the Flutter admin and
should be removed) — that work isn't done yet.

---

## Verified

- ✅ `tsc --noEmit` clean
- ✅ Full bundle builds (esbuild, 3.19 MB, every import resolves)
- ✅ `0004` touches only `igo_*` tables — the one reference to `admin_users` is
  a `select` inside an `igo_leads` RLS policy
- ✅ No service-role key anywhere in `src/`
- ✅ No inserts/updates/deletes against `products`, `categories`, `coupons`,
  `offers`, `combo_packs` or `admin_users`
- ✅ The app and admin repos were never mounted in this session — they
  physically could not have been modified

---

## Not done yet

1. **Seed `igo_product_variants`** — needs the catalog diff. Connect Supabase
   (Settings → Connectors) and I'll generate the seed SQL plus a list of SKUs
   you need to create in the admin.
2. **Slim `/admin`** — remove the tabs the Flutter admin owns.
3. **Retire the rest of localStorage** — subscriptions, tickets, wishlist,
   notifications all have canonical tables ready.
4. **Tests** — `productAdapter.ts` and `pricing.ts` first; a wrong multiplier
   silently overcharges customers.
5. **Remove dead auth endpoints** in `server.ts` (`/api/auth/*`) — now unused.
