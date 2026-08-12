# Website → Database + Admin — Step-by-Step Plan (WEBSITE-ONLY)

**Date:** 30 July 2026 · **Revision 2 — corrected for scope constraint**

> **Scope rule:** website code only. The app, the admin, the `admin-*` Edge
> Functions and every existing app table are **off limits**. No `ALTER TABLE`,
> no new columns on app tables, no Edge Function edits, no admin UI changes.
>
> Supersedes `CENTRALIZED_ADMIN_PLAN.md` and `WEBSITE_AUDIT_AND_ADMIN_UNIFICATION_PLAN.md`.
> Both proposed app-side changes that are now out of scope.

---

## The good news: the constraint costs you almost nothing

I checked every RLS policy in the app's 20 migrations. **The website can connect
to the database and be controlled by your existing admin with zero backend
changes.** Not a workaround — this is exactly how the Flutter app already works.

### Reads — already public, work today

These tables carry `for select using (true)`. The website can read them with the
**anon key** right now, no migration, no Edge Function:

`products` · `categories` · `coupons` · `offers` · `combo_packs` ·
`combo_pack_items` · `faq_items` · `delivery_partners` · `achievements`

**This is the whole ballgame.** The moment the website reads `products` instead
of `mockData.ts`, your admin controls the website's catalog, prices, stock,
images, availability, categories, coupons, offers and combos. **No admin code
written. No app code touched.**

### Writes — already user-scoped, work today

These carry `auth.uid() = user_id` policies. An authenticated website user can
write their own rows, exactly as the app does (`order_service.dart` inserts
straight into `orders` from Flutter):

`orders` · `order_items` · `profiles` · `support_tickets` · `ticket_messages` ·
`subscriptions` · `wishlist_items` · `product_reviews` · `payments` ·
`stock_alerts` · `order_ratings`

A website order lands in the same `orders` table the app writes to, so **it
appears in your admin's Orders screen automatically** — assignable, refundable,
trackable, with Realtime already enabled on that table.

---

## What the constraint does cost — three honest trade-offs

| # | Limitation | Why | Workaround (website-side only) |
|---|---|---|---|
| **T1** | Admin can't tell web orders from app orders | Needs a `channel` column on `orders` — an app-table change, out of scope | Website keeps its existing `igo_orders` shadow row holding the canonical order id. Reporting is possible via join; the admin UI just won't show the split. One additive column later if you want it. |
| **T2** | Admin can't edit weight variants | Needs a `product_variants` table + admin UI — both out of scope | Base price and stock come from `products` (**admin-controlled**). The weight ladder (500g/1kg multipliers, servings, net weight) lives in the website's own `igo_product_variants`. Admin sets the price; the ladder scales from it. |
| **T3** | Admin can't edit website banners / SEO / leads | Needs `site_content` + `leads` tables + admin modules — out of scope | Stays in `igo_*` tables, managed by a **slimmed-down website admin page**. Unlike my earlier plan, we now *keep* `/admin` — but strip it to website-only content and guard it properly. |

Everything else — catalog, pricing, stock, categories, coupons, offers, combos,
FAQs, orders, customers, support tickets, subscriptions — is fully controlled by
your existing admin with no changes to it.

---

## Two conflicts you still need to decide

| # | Conflict | Recommendation |
|---|---|---|
| **C1** | Membership tiers — app has Bronze/Silver/Gold/Platinum (points-based: 0/500/1500/3000); website has Gold/Platinum/Elite (manual) | **Adopt the app's.** They share one `profiles` row; two tier systems on it can't both be right. Website-side relabel only. |
| **C2** | Catalog — website has 83 hardcoded SKUs; the live `products` table has an unknown set | Resolved by Step 2. Website-only SKUs get **created through the admin UI by you** — the website must never insert into `products`. |

Categories already align: the app normalizes to Chicken / Beef / Mutton / Fish /
Eggs / Healthy Add-ons — the same six the website uses.

---

# THE STEPS

## STEP 1 — Security cleanup *(today, ~1 hour)* — website repo only

```bash
cd "D:\Igo-websites\Protein cuts website"
git log --all -- .env          # ever committed?
git check-ignore -v .env       # ignored now?
```

1. If `.env` was ever committed → **rotate `SUPABASE_SERVICE_ROLE_KEY`** (Supabase dashboard → Settings → API). It bypasses RLS on the database your live app uses.
2. Add `.env` to `.gitignore`; move secrets to Vercel env vars.
3. **Delete `supabase/migrations/0001_orders.sql`.** It creates an un-prefixed `public.orders` — running it would collide with the app's table. This is the single most dangerous file in the website repo.
4. Guard `/admin` (`src/App.tsx:124`) — currently reachable by anyone, no check at all.
5. Remove the fake admin grant in `src/lib/supabaseClient.ts:47` (`email.includes('admin') ? 'Super Admin' : 'Customer'`).

**Verify:** `/admin` closed to logged-out visitors. App and admin untouched.

---

## STEP 2 — Catalog reconciliation *(1 day)* — no code

1. In the Supabase SQL editor (read-only query):
   ```sql
   select id, name, category, price, weight, is_available,
          stock_quantity, image_url
   from public.products
   order by category, name;
   ```
2. Diff against the 83 products in `src/data/mockData.ts` (`INITIAL_PRODUCTS`).
3. Mark each: **match** (link by UUID) / **app-only** / **website-only** / **rename**.
4. For website-only SKUs — **you create them in the admin UI.** The website never writes to `products`.
5. Record each product's weight ladder (500g/1kg/pieces/servings) — seed data for Step 4.

**Deliverable:** `catalog_mapping.csv` — website SKU id → app product UUID. Expect manual work on 15–25% of names.

---

## STEP 3 — Website-owned tables *(half a day)*

One migration in the **website repo**: `supabase/migrations/0004_website_support.sql`.
Creates **new `igo_*` tables only**. No `ALTER` on any app table. The app and
admin never see these.

```sql
-- Website-owned namespace. Nothing here touches any app table.

-- Weight ladder per product (trade-off T2). Base price still comes from
-- products.price, which the admin controls; these scale from it.
create table if not exists public.igo_product_variants (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null,          -- products.id, by convention (no FK)
  label            text not null,          -- '500g', '1kg'
  weight_grams     int  not null,
  net_weight_grams int,
  price_multiplier numeric not null default 1,
  servings         text,
  pieces           text,
  display_order    int not null default 0,
  is_active        boolean not null default true
);
create index if not exists igo_product_variants_pid_idx
  on public.igo_product_variants (product_id);
alter table public.igo_product_variants enable row level security;
create policy "Public read" on public.igo_product_variants
  for select using (true);

-- Website-only presentation fields
create table if not exists public.igo_product_web_meta (
  product_id        uuid primary key,
  subcategory       text,
  bone_type         text,
  freshness_label   text,
  calories_per_100g numeric,
  carbs_per_100g    numeric,
  iron_per_100g     numeric,
  slug              text unique,
  seo_title         text,
  seo_description   text
);
alter table public.igo_product_web_meta enable row level security;
create policy "Public read" on public.igo_product_web_meta
  for select using (true);

-- Homepage banners / hero / sections (trade-off T3)
create table if not exists public.igo_site_content (
  id            uuid primary key default gen_random_uuid(),
  key           text not null unique,
  content_type  text not null,
  payload       jsonb not null,
  is_active     boolean not null default true,
  display_order int not null default 0,
  updated_at    timestamptz not null default now()
);
alter table public.igo_site_content enable row level security;
create policy "Public read active" on public.igo_site_content
  for select using (is_active = true);

-- B2B / franchise leads
create table if not exists public.igo_leads (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null,
  name text, email text, phone text, city text, message text,
  status text not null default 'New',
  created_at timestamptz not null default now()
);
alter table public.igo_leads enable row level security;
create policy "Anyone can submit" on public.igo_leads
  for insert with check (true);
```

**Also:** `igo_orders` stays as the shadow ledger for T1 — don't drop it.

**Verify:** app and admin regression-tested green (they should be — nothing they read changed).

---

## STEP 4 — Website reads the real catalog *(4–5 days)* ⭐ THE BIG WIN

After this step your admin controls the website. This is what you actually asked for.

1. `npm install @supabase/supabase-js`
2. New `src/lib/supabase.ts` — a **real** anon-key client. (Today's `supabaseClient.ts` contains zero Supabase calls despite its name.)
3. New `src/lib/adapters/productAdapter.ts` — the single translation point:
   ```ts
   // products (admin-controlled) + igo_product_variants + igo_product_web_meta
   //   → the website's Product type
   toWebsiteProduct(row, variants, meta): Product
   ```
   Weight option price = `products.price × variant.price_multiplier`, so an
   admin price edit flows through every weight automatically.
4. Rewrite `StoreService.getProducts()` to query Supabase. Keep localStorage as a
   stale-while-revalidate cache and `INITIAL_PRODUCTS` as last-resort fallback.
5. Gate behind `VITE_CATALOG_SOURCE=supabase|local` for instant rollback.
6. Seed `igo_product_variants` + `igo_product_web_meta` from `mockData.ts` using the Step 2 mapping (one-off script).
7. Point `CategoryPage` / `SearchBrowsePage` at the `categories` table.
8. Read `offers`, `combo_packs`, `combo_pack_items`, `coupons`, `faq_items` from canonical tables — deleting the localStorage copies in `supabaseClient.ts`.

**Verify:** change a price in the admin → refresh the website → new price in listing, PDP, cart, checkout. Toggle `is_available` → product disappears. Stock reflects `stock_quantity`.

**Rollback:** `VITE_CATALOG_SOURCE=local`. Nothing was written.

---

## STEP 5 — Supabase Auth *(3–4 days)*

Required before any write step — RLS needs a real session.

1. Replace the fake `SupabaseService.loginWithEmail()` with `signInWithPassword` / `signUp` / `resetPasswordForEmail` / `onAuthStateChange`.
2. Delete the `AUTH_KEY` localStorage session and the custom scrypt auth in `server.ts:252–405`.
3. Update `UserAuthModal.tsx` and `UserAccountPage.tsx` to the real session.
4. Read/write `profiles` for name, phone, avatar, wallet balance, notification prefs — all columns already exist.
5. **Relabel membership tiers to the app's Bronze/Silver/Gold/Platinum** (conflict C1). Presentation change only; `profiles` is untouched.

**Verify:** an app user logs into the website with their app credentials. A new website signup appears in the admin's Customers list.

**Rollback:** `VITE_AUTH=supabase|legacy`.

---

## STEP 6 — Orders into the canonical tables *(4–5 days)*

1. Website checkout inserts into `orders` + `order_items` + `addresses` + `payments`
   using the **authenticated user's session** — the same path `order_service.dart`
   uses. No service-role key in the browser.
2. **Fix the silent-failure bug** (`server.ts:414`): a failed write currently still
   returns `{success: true}`. Return non-200, add a retry queue, alert on depth.
3. Add the missing reads — there is currently **no** `GET /api/orders`. Point
   `UserAccountPage` and `LiveOrderTracking` at `orders`. **Realtime is already
   enabled on that table** — subscribe rather than poll.
4. Keep writing the `igo_orders` shadow row with the canonical order id (T1).
5. Validate coupons against the `coupons` table using its existing rules
   (`min_order_value`, `usage_limit`, `one_time_use`, `first_order_only`, `expires_at`).

**Verify:** place a website order → appears in the admin's Orders list → assign a
delivery partner there → website tracking updates live.

---

## STEP 7 — Retire the remaining localStorage systems *(4–5 days)*

| Website feature | Canonical table (admin-controlled) |
|---|---|
| Support tickets | `support_tickets` + `ticket_messages` |
| FAQs | `faq_items` |
| Notifications | `notifications` |
| Wishlist | `wishlist_items` |
| Subscriptions | `subscriptions` + `subscription_history` |
| Wallet / rewards | `wallet_transactions`, `reward_transactions`, `profiles.wallet_balance` |
| Referrals | `profiles.referral_code` / `referred_by` (triggers award automatically) |
| Reviews | `product_reviews` (moderation already in the admin) |
| B2B / franchise forms | `igo_leads` |
| Homepage banners | `igo_site_content` |

**Verify:** grep the website for `localStorage` — only cart, recently-viewed and UI prefs should remain.

---

## STEP 8 — Slim the website admin *(2–3 days)*

Revised from my earlier plan: **keep `/admin`, but strip it.** With app/admin
changes out of scope, website-only content needs somewhere to live.

**Delete** from `AdminDashboard.tsx` (774 lines): products, inventory, orders,
delivery, customers, audit, notifications, support tabs — all now owned by the
Flutter admin.

**Keep, as "Website Content":** banners/hero (`igo_site_content`), weight-variant
ladders (`igo_product_variants`), SEO metadata (`igo_product_web_meta`),
B2B/franchise leads (`igo_leads`).

**Guard it properly:** server-side session check + verify the user has a row in
`admin_users` (that table has a self-read policy — `auth.uid() = user_id` — so
the website can check its own membership without any backend change). No
client-side role inference.

**Verify:** a customer account cannot open `/admin`. An admin account can, and
sees only the four website-content tabs.

---

## STEP 9 — Data migration *(2–3 days)*

Only after Steps 4–8 are green on staging.

1. `igo_customers` → `profiles`: match on phone, then email. **Produce a
   reconciliation report and review it manually before merging.** Website writes
   go through normal user-scoped RLS — no service-role key.
2. Historical `igo_orders` → `orders`: decide whether it's worth backfilling.
   If most website orders were localStorage-only, there may be very little real
   data to move.
3. Wallet/reward balances → canonical ledgers.
4. **Keep every `igo_*` table.** Rename to `igo_archive_*` after one clean
   release cycle. Drop nothing for at least a month.

---

## STEP 10 — Hardening *(3–4 days)*

1. Vitest on `src/lib/pricing.ts` and the adapters — pure functions, and where money bugs live.
2. Sentry; alert on order-sync queue depth.
3. React Router + `React.lazy` — today all 24 pages load on first paint (`App.tsx` is a manual `switch` with static imports).
4. Add an error boundary.
5. Run both data sources in parallel 48h, compare order counts, then flip the flags.

---

# TIMELINE

| Step | Work | Est. | Touches app/admin? |
|---|---|---|---|
| 1 | Security cleanup | 1 h | No |
| 2 | Catalog reconciliation | 1 d | No (read-only query) |
| 3 | Website-owned tables | 0.5 d | No (new `igo_*` only) |
| 4 | **Catalog from DB** ⭐ | 4–5 d | No |
| 5 | Supabase Auth | 3–4 d | No |
| 6 | Orders | 4–5 d | No |
| 7 | Retire localStorage | 4–5 d | No |
| 8 | Slim website admin | 2–3 d | No |
| 9 | Data migration | 2–3 d | No |
| 10 | Hardening | 3–4 d | No |

**≈ 5 weeks solo.** Every step is website-side.

**Fastest visible win: Steps 1 → 2 → 3 → 4.** About two weeks, and your existing
admin controls the website's entire catalog, pricing, stock, categories, coupons,
offers and combos. Read-only, additive, reversible by a single env var.

---

# DO THIS FIRST

1. `git log --all -- .env` → rotate the service-role key if it was ever committed
2. Delete `supabase/migrations/0001_orders.sql` — it creates a colliding `public.orders`
3. Guard `/admin` — publicly reachable right now
4. Run the Step 2 catalog query and diff against `mockData.ts`

Then tell me to start Step 3 or Step 4 and I'll write the code — website files only.

---

# CONFIRM BEFORE I BUILD

| # | Question | My recommendation |
|---|---|---|
| C1 | Membership tiers — app's Bronze/Silver/Gold/Platinum, or keep the website's Gold/Platinum/Elite? | **App's** |
| C2 | Website-only SKUs — will you create them in the admin, or drop them? | Create in admin |
| T1 | Accept that the admin can't distinguish web from app orders for now? | **Yes** — one additive column later if you want it |
| T2 | Accept weight ladders being website-managed, with the admin controlling base price? | **Yes** |
| — | Keep MSG91 phone OTP, or Supabase email auth only? | Supabase email first; add phone later |
