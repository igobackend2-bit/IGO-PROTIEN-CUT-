# IGO Protein Cuts — One Admin for App + Website

**Date:** 30 July 2026
**Inputs analysed:** `Protein-cuts-admin-main.zip` (full source, 9,885 lines Dart) + the website repo (18,747 lines TS/TSX)
**Goal:** one centralized admin panel controlling both the mobile app and the website, without breaking either.

---

# PART 1 — DEEP DIVE: WHAT YOUR ADMIN ACTUALLY IS

## 1.1 The headline finding

**Your admin never touches database tables.** It is a thin Flutter client over a set of `admin-*` **Supabase Edge Functions**, all sharing one contract:

```dart
// lib/core/network/edge_function_client.dart
POST /functions/v1/{function}
body: { action: "...", ...params }
→ JSON, or { error } on failure
```

The only two direct Supabase calls in the entire 9,885-line codebase are `admin_users` (reading your own membership at login) and the `product-images` Storage bucket (photo upload).

**This changes everything about the merge, and makes it dramatically easier than I expected.** All business logic and authorization live server-side in the Edge Functions. So the website doesn't need to be rewritten to talk to tables — **it becomes a third client of the same Edge Function API the admin and app already use.** One API, three consumers, one permission model.

## 1.2 Architecture

| Aspect | Implementation |
|---|---|
| Framework | Flutter Web (`flutter build web --release`), deployed on Vercel |
| Pattern | Clean architecture, feature-first — every module is `domain/` (models + repository interface) → `data/` (impl) → `presentation/` (controllers + screens + widgets) |
| State | Riverpod 3.3 (`AsyncNotifier`, `Provider`) |
| Routing | go_router 17.3 with `ShellRoute` + async `redirect` auth guard |
| Backend | Supabase (`supabase_flutter` 2.16) — **project `aweevhgnbjuxcvnvjeie`** |
| Charts | fl_chart | Tables | data_table_2 (paginated) |
| Build | Vercel clones the Flutter SDK at build time (`vercel.json`) |

**Quality assessment: this is well-built.** Proper layer separation, a single typed error path (`AppException`), reusable core widgets (`PaginatedTable`, `SearchFilterBar`, `StatCard`, `ConfirmDialog`, `EmptyStateView`, `ErrorRetryView`, `LoadingView`), responsive helpers, debouncing, CSV export. Every domain model carries a docstring naming the Edge Function constant it mirrors. **Extend this, don't replace it.**

## 1.3 The 12 modules

| # | Module | Route | Permission gate | What it controls |
|---|---|---|---|---|
| 1 | Dashboard | `/` | `analytics.view` | Revenue, order count, active/new/total customers, product count, low-stock count, pending deliveries, open tickets, sales-trend chart, top products, top categories, recent activity |
| 2 | Products | `/products` | `products.view/manage` | Full CRUD, image upload to Storage, categories tab (CRUD + display order + emoji), review moderation (hide/unhide) |
| 3 | Inventory | `/inventory` | `inventory.view/manage` | Stock in/out, manual adjustment, low-stock and out-of-stock lists, per-product movement history |
| 4 | Orders | `/orders` | `orders.view/manage` | List + filter, full detail dialog (items, address, payment), assign delivery partner, issue refund |
| 5 | Delivery | `/delivery` | `delivery.view/manage` | Partner CRUD, activate/deactivate, assignment list, live status + GPS pings, ETA refresh, reassign |
| 6 | Customers | `/users` | `users.view` | List + search, detail (profile, email, order count, total spent, recent orders) |
| 7 | Support | `/support` | `support.manage` | Ticket list, detail + reply thread, status changes, FAQ CRUD |
| 8 | Coupons | `/coupons` | `coupons.manage` | Coupons (CRUD, disable, expire), Offers/banners (CRUD, activate, priority), Combo packs (CRUD, activate, items) |
| 9 | Notifications | `/notifications` | `notifications.send` | Broadcast all, target one user, target a category, send history |
| 10 | Analytics | `/analytics` | `analytics.view` | Period revenue, orders, active/new customers, top products/categories, refunds, subscriptions, server-cached |
| 11 | Reports | `/reports` | `reports.generate` | 6 report types (sales, inventory, orders, delivery, payments, customer) → CSV download |
| 12 | Role Management | `/roles` | `roles.manage` | Roles, their permission grants, grant/revoke admin membership |

## 1.4 Control level — the RBAC model

**17 permission codes**, view/manage split:

```
products.view      products.manage      inventory.view    inventory.manage
orders.view        orders.manage        payments.manage
delivery.view      delivery.manage      users.view        roles.manage
coupons.manage     reviews.moderate     support.manage
notifications.send analytics.view       reports.generate
```

**How it's enforced — three layers, correctly done:**

1. **Route guard** (`app_router.dart`) — no Supabase Auth session → `/login`. Session but no active row in `admin_users` → forced sign-out. A customer account cannot reach the admin.
2. **UI gating** — `PermissionsController` resolves all 17 codes at login by calling the `admin_has_permission(p_user_id, p_permission)` Postgres RPC in parallel. Sidebar items hide, `PermissionGate` disables buttons.
3. **Server-side** — the same RPC is re-checked inside every Edge Function action. **The UI gate is convenience; the Edge Function is the real boundary.** A tampered client still can't do anything.

Tables behind it: `admin_users` (user_id, role_id, is_active), `admin_roles`, `admin_permissions`, `admin_role_permissions`.

## 1.5 The API surface — 10 functions, 72 actions

```
admin-products      list · create · update · delete · listCategories · createCategory
                    updateCategory · deleteCategory · moderateReview
admin-inventory     listLowStock · listOutOfStock · stockIn · stockOut · adjustment · history
admin-orders        list · get · assignDelivery · refund
admin-delivery      list · get · listPartners · createPartner · updatePartner
                    setPartnerActive · liveStatus · refreshEta · reassign
admin-users         list · get · listAdmins · listRoles · grantRole · revokeRole
admin-coupons       listCoupons · createCoupon · updateCoupon · disableCoupon · expireCoupon
                    deleteCoupon · listOffers · createOffer · updateOffer · setOfferActive
                    deleteOffer · listComboPacks · createComboPack · updateComboPack
                    setComboPackActive · deleteComboPack
admin-support       listTickets · getTicket · reply · setStatus · listFaqs · createFaq
                    updateFaq · deleteFaq
admin-notifications broadcast · targetUser · targetCategory · history
admin-analytics     summary
admin-reports       generate
```

## 1.6 The app's canonical schema (reverse-engineered from the domain models)

| Table | Key columns |
|---|---|
| `products` | id, name, description, price, image_url, image_urls[], category, weight, protein_per_100g, fat_per_100g, storage_instruction, brand, is_available, ingredients, cooking_tips, recipe_ideas, stock_quantity, low_stock_threshold |
| `categories` | id, name, emoji, display_order, is_active |
| `product_reviews` | id (int), product_id, rating, comment, is_hidden, created_at |
| `inventory_history` | id, product_id, change_type, quantity_change, resulting_stock, reason, created_at |
| `orders` | id, user_id, total_price, status, created_at, delivery_slot, payment_method, coupon_code, discount_amount, delivery_fee, tax_amount, address_id, delivery_partner_id, delivery_otp, cancelled_at, cancel_reason |
| `order_items` | id, order_id, product_id, quantity, price |
| `addresses` | full_name, phone, house, street, area, landmark, city, state, pincode |
| `profiles` | id (= auth.users.id), full_name, phone_number, created_at |
| `coupons` | id, code, description, discount_type, discount_value, min_order_value, is_active, expires_at, usage_limit, one_time_use, first_order_only, product_id, category, user_id |
| `offers` | id, type, title, description, discount_type, discount_value, start_date, end_date, priority, active, banner_image_url, min_order_value |
| `combo_packs` / `combo_pack_items` | id, title, description, discount, bundle_type, pick_count, banner_image_url, active / product_id, quantity |
| `delivery_partners` | id, name, phone, vehicle_number, vehicle_type, photo_url, rating, is_active |
| `delivery_assignments` | id, order_id, partner_id, status, assigned_at, picked_up_at, delivered_at, eta_minutes (+ GPS pings: lat, lng, recorded_at) |
| `support_tickets` / messages | id, user_id, subject, category, status, created_at, updated_at / ticket_id, sender, message, attachment |
| `faqs` | id, category, question, answer, priority |
| `notifications` | id, user_id, type, title, message, created_at |
| `subscriptions` | referenced by admin-analytics (activeSubscriptions, newSubscriptions) |
| `admin_users` / `admin_roles` / `admin_permissions` / `admin_role_permissions` | RBAC |
| Storage bucket | `product-images` |

---

# PART 2 — WHAT I STILL NEED

## 2.1 Yes — send the app zip. It's the last missing piece.

The admin repo references files that **live in the customer app repo, not here**:

```
supabase/functions/admin-products/index.ts     ← PRODUCT_FIELDS constant
supabase/functions/admin-orders/index.ts       ← ORDER_SELECT constant
supabase/functions/admin-coupons/index.ts      ← COUPON_FIELDS, OFFER_FIELDS
supabase/functions/admin-*/index.ts            ← all 10, ~72 actions
supabase/migrations/phase18_admin.sql          ← admin_permissions seed, admin_has_permission RPC
lib/services/admin_service.dart                ← the app's own Edge Function caller
```

**These Edge Functions are where 100% of the business logic and authorization live.** Extending them is the core of the work in Part 4. Without them I'm specifying against inferred signatures rather than real ones.

Also valuable from the app repo: all other `supabase/migrations/*.sql` (the true schema, including columns the admin doesn't surface), `lib/models/` (canonical field shapes), and any `pricing`/`cart`/`checkout` service (so the website's totals match the app's exactly).

**Just zip the whole app repo minus `build/`, `.dart_tool/`, `android/`, `ios/`.** I'd rather grep it myself than have you pick files.

## 2.2 Also worth doing

- **Rotate `SUPABASE_SERVICE_ROLE_KEY`** if the website's `.env` was ever committed (`git log --all -- .env`). It's a full-bypass credential on this same production database.
- Note the admin's anon key is in source — that's fine and normal, it's a publishable key protected by RLS.

---

# PART 3 — THE STRATEGY

## 3.1 The insight

My earlier plan assumed the website had to be rewired table-by-table. **That's wrong.** Because the admin is a thin client over Edge Functions, the right shape is:

```
                    ┌─────────────────────────────────┐
                    │   admin-*  EDGE FUNCTIONS       │
                    │   (all logic + authorization)   │
                    │   + NEW: storefront-* functions │
                    └───┬──────────┬──────────┬───────┘
                        │          │          │
              ┌─────────┘          │          └─────────┐
              │                    │                    │
       ┌──────┴──────┐      ┌──────┴──────┐     ┌───────┴───────┐
       │ Mobile App  │      │  CENTRAL    │     │   Website     │
       │  (Flutter)  │      │   ADMIN     │     │ (React+Express)│
       │             │      │  (Flutter)  │     │   ← NEW client│
       └─────────────┘      └─────────────┘     └───────────────┘
                                   │
                            ┌──────┴──────────────────┐
                            │ canonical tables        │
                            │ products, orders,       │
                            │ profiles, coupons…      │
                            └─────────────────────────┘
```

**The website becomes a third consumer of the same API.** The centralized admin is your *existing* admin, extended with a channel dimension and four new modules.

## 3.2 The `channel` dimension

The one concept the current system lacks: **which storefront did this come from?** Add `channel text not null default 'app'` (values `app` | `web`) to `orders`, `profiles`, `notifications`, and optionally `coupons`/`offers`/`combo_packs`.

Additive with a default, so **every existing row and every existing app query keeps working unchanged**. Then every admin list gets an All / App / Website filter, and the dashboard can split revenue by channel — which is the thing you actually want from a centralized admin.

## 3.3 Non-negotiable safety rules

1. **Additive-only schema changes.** New nullable columns or new tables. Never rename, retype, or drop anything the app reads.
2. **Additive-only Edge Function changes.** New actions and new optional params. Never change an existing action's response shape — the app depends on it.
3. **`igo_*` tables stay** as a shadow/reconciliation ledger through the whole migration. Drop nothing until the website has run clean on canonical tables for a full release cycle.
4. **Website never gets a service-role key in the browser.** Reads go through the anon key + RLS, or through `server.ts`.
5. **After every phase, regression-test the mobile app first.** The app is the incumbent and wins every conflict.
6. **Rehearse on a Supabase branch**, never on live.

---

# PART 4 — THE PLAN

## Phase 0 — Discovery *(1–2 days)* — BLOCKING

- **0.1** Receive the app zip; read all 10 `admin-*/index.ts`, `phase18_admin.sql`, all migrations
- **0.2** Document each action's exact params, response shape, and permission check
- **0.3** Dump the live schema from `aweevhgnbjuxcvnvjeie` (`information_schema.columns`, `pg_policies`, `pg_stat_user_tables`) to catch columns the admin doesn't surface
- **0.4** **The hard one — resolve the product model mismatch.** The website has 83 SKUs with *multiple weight options each* (`weightOptions[]`, own price per weight). The app's `products` is **single-price, single-weight**. Three options:

  | Option | Approach | Verdict |
  |---|---|---|
  | **A** | One `products` row per weight variant ("Chicken Breast 500g", "…1kg") | Works today, zero schema change, but pollutes the app's catalog and breaks its UX |
  | **B** | New `product_variants` table (product_id, label, weight_grams, price, original_price, servings, net_weight_grams); app ignores it, website + admin use it | **Recommended.** Additive, clean, and gives the app a growth path |
  | **C** | Keep variants in `igo_product_web_meta` as JSONB | Fastest, but variants stay invisible to the admin — defeats the purpose |

  **Go with B.** Decide in Phase 0; everything downstream depends on it.

- **0.5** Produce the field-level mapping: website `Product`/`Order`/`UserProfile` ↔ canonical tables. ~60% maps cleanly; the rest is Phase 1's side tables.

**Exit:** every Edge Function action documented; product model decided; mapping table has no gaps.

---

## Phase 1 — Schema extensions *(3–4 days)*

All additive. All safe to run on live.

```sql
-- 1. Channel dimension
alter table public.orders        add column if not exists channel text not null default 'app';
alter table public.profiles      add column if not exists channel text not null default 'app';
alter table public.notifications add column if not exists channel text not null default 'all';
create index if not exists orders_channel_idx on public.orders(channel);

-- 2. Product variants (Phase 0 decision B)
create table if not exists public.product_variants (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products(id) on delete cascade,
  label            text not null,          -- "500g", "1kg"
  weight_grams     int  not null,
  net_weight_grams int,                    -- seafood: edible weight
  price            numeric not null,
  original_price   numeric,
  servings         text,
  pieces           text,
  stock_quantity   int not null default 0,
  display_order    int not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index on public.product_variants(product_id);

-- 3. Website-only product fields — keeps products.* untouched
create table if not exists public.product_web_meta (
  product_id       uuid primary key references public.products(id) on delete cascade,
  subcategory      text,
  bone_type        text,                   -- Boneless | Bone-in | Mixed
  freshness_label  text,
  calories_per_100g numeric,
  carbs_per_100g   numeric,
  iron_per_100g    numeric,
  seo_title        text,
  seo_description  text,
  slug             text unique,
  updated_at       timestamptz not null default now()
);

-- 4. Website CMS
create table if not exists public.site_content (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,       -- 'home.hero', 'home.trust_badges'
  content_type text not null,              -- banner | text | json | image
  payload      jsonb not null,
  is_active    boolean not null default true,
  display_order int not null default 0,
  updated_at   timestamptz not null default now()
);

-- 5. Loyalty (migrated from igo_customers / igo_*_transactions)
alter table public.profiles add column if not exists membership_tier   text default 'Gold';
alter table public.profiles add column if not exists customer_segment  text default 'regular';
alter table public.profiles add column if not exists wallet_balance    numeric not null default 0;
alter table public.profiles add column if not exists reward_points     int not null default 0;
alter table public.profiles add column if not exists referral_code     text unique;
alter table public.profiles add column if not exists referred_by_code  text;

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id), type text not null,
  amount numeric not null, description text,
  status text not null default 'Completed', created_at timestamptz not null default now()
);
create table if not exists public.reward_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id), type text not null,
  points int not null, description text, created_at timestamptz not null default now()
);
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  referrer_user_id uuid references auth.users(id),
  referred_user_id uuid references auth.users(id),
  status text not null default 'pending', reward_amount numeric not null default 0,
  created_at timestamptz not null default now()
);

-- 6. B2B / franchise leads (website-only)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null,                 -- franchise | b2b | corporate
  name text, email text, phone text, city text, message text,
  status text not null default 'New', assigned_to uuid,
  created_at timestamptz not null default now()
);

-- 7. New permission codes
insert into public.admin_permissions (code, description) values
  ('content.manage',    'Manage website CMS content'),
  ('loyalty.manage',    'Manage wallet, rewards, membership tiers'),
  ('leads.manage',      'Manage B2B and franchise leads'),
  ('subscriptions.manage', 'Manage customer subscriptions')
on conflict (code) do nothing;
```

Add matching RLS: service-role full access (Edge Functions), plus `authenticated` read on the storefront-facing ones (`product_variants`, `product_web_meta`, `site_content`).

**Exit:** all migrations applied to a branch; mobile app regression-tested green.

---

## Phase 2 — Extend the Edge Functions *(1 week)*

Additive only.

**2.1 New actions on existing functions**

| Function | New actions |
|---|---|
| `admin-products` | `listVariants` · `createVariant` · `updateVariant` · `deleteVariant` · `getWebMeta` · `updateWebMeta` |
| `admin-orders` | add optional `channel` filter to `list` |
| `admin-users` | add optional `channel` filter; `adjustWallet` · `adjustRewards` · `setMembershipTier` · `setSegment` |
| `admin-analytics` | add `channel` param; return per-channel breakdown |
| `admin-reports` | add `channel` param; new report types `subscriptions`, `leads` |
| `admin-notifications` | add `channel` targeting (`app` / `web` / `all`) |

**2.2 New functions**

| Function | Actions | Permission |
|---|---|---|
| `admin-content` | `listContent` · `createContent` · `updateContent` · `setActive` · `deleteContent` · `reorder` | `content.manage` |
| `admin-loyalty` | `listWalletTx` · `listRewardTx` · `listReferrals` · `adjustWallet` · `adjustRewards` | `loyalty.manage` |
| `admin-leads` | `list` · `get` · `setStatus` · `assign` · `delete` | `leads.manage` |
| `admin-subscriptions` | `list` · `get` · `setStatus` · `updatePlan` | `subscriptions.manage` |

**2.3 The storefront API — `storefront` Edge Function**

The website needs public, unauthenticated reads. Do **not** point it at `admin-*` (those require admin permissions), and do **not** give the browser a service-role key.

```
storefront: getCatalog · getProduct · getCategories · getOffers · getComboPacks
            getSiteContent · validateCoupon
```

Read-only, anon-callable, server-cached. **This single function is what makes the admin control the website** — edit a product in the admin, `storefront.getCatalog` returns it, the website renders it.

**Exit:** every new action callable via curl with a real admin JWT; every old action byte-identical in response shape (snapshot-test this).

---

## Phase 3 — Rewire the website *(2 weeks)*

This is the bulk of the coding, and it's all on the website side.

**3.1** New `src/lib/api/` layer — a TypeScript twin of `EdgeFunctionClient`:

```ts
// src/lib/api/edgeClient.ts
export async function invoke<T>(fn: string, action: string, params = {}): Promise<T>
```

**3.2** `src/lib/adapters/` — one translation file per entity (`productAdapter.ts`, `orderAdapter.ts`, `customerAdapter.ts`). The website's rich `Product` type is assembled from `products` + `product_variants` + `product_web_meta`. **When the canonical schema changes, only these files change.**

**3.3** Replace `StoreService.getProducts()` — fetch from `storefront.getCatalog`, keep localStorage as a stale-while-revalidate cache and `INITIAL_PRODUCTS` as last-resort fallback. Gate behind `VITE_DATA_SOURCE=api|local` for instant rollback.

**3.4** **Adopt Supabase Auth.** Delete `SupabaseService.loginWithEmail()` — it mints sessions client-side with no password check and grants Super Admin on `email.includes('admin')`. Replace with `@supabase/supabase-js` `signInWithPassword` / `signUp`, same as the admin and app. One identity across all three surfaces. Retire the custom scrypt auth in `server.ts:252–405`.

**3.5** Orders → canonical `orders` + `order_items` + `addresses` with `channel='web'`. Dual-write to `igo_orders` as a shadow ledger. **Fix the silent-failure bug** (`server.ts:414` swallows errors and still returns `{success:true}`) — a failed write must return non-200 and enter a retry queue.

**3.6** Point coupons, offers, combos, FAQs, tickets, notifications at the canonical tables via `storefront` reads.

**3.7** Delete `/admin` from the website. Remove `AdminDashboard.tsx` (774 lines) and its route in `App.tsx:124` — which today has **no auth guard at all**.

**3.8** Data migration: `igo_customers` → `profiles` (dedupe on phone, then email; reconciliation report before merging), `igo_orders` → `orders`, `igo_combos` → `combo_packs`, `igo_*_transactions` → `wallet/reward_transactions`. The 83 `mockData.ts` products → `products` + `product_variants` + `product_web_meta`, matched by name (expect manual reconciliation on ~15–20%).

**Exit:** website runs entirely off canonical data. Edit a price in the admin → website shows it. Place a web order → appears in the admin tagged Website.

---

## Phase 4 — Extend the admin UI *(1 week)*

Now the admin becomes genuinely centralized. Follow the existing feature-first pattern exactly — `domain/` → `data/` → `presentation/`, one folder per module.

**4.1 Channel filter everywhere.** Add an All / App / Website segmented control to `SearchFilterBar`, wired into Orders, Customers, Analytics, Reports, Notifications. Dashboard gets a channel split on revenue and orders. **This is the single highest-value change** — it's what turns two admins into one.

**4.2 Product variants tab** in `ProductsScreen` (alongside the existing Categories tab), plus a Website Meta section in `product_form_dialog.dart` (subcategory, bone type, SEO, slug).

**4.3 Four new modules:**

| Module | Route | Permission | Screens |
|---|---|---|---|
| Website Content | `/content` | `content.manage` | Banner/hero/section CMS, reorder, activate, image upload to Storage |
| Loyalty & Wallet | `/loyalty` | `loyalty.manage` | Wallet + reward ledgers, manual adjust, membership tiers, referral tracking |
| Leads | `/leads` | `leads.manage` | B2B/franchise inbox, status pipeline, assign, CSV export |
| Subscriptions | `/subscriptions` | `subscriptions.manage` | Plan list, status changes, upcoming deliveries |

Each: add to `RoutePaths`, add a `NavItem` with its permission, add a `GoRoute` in the `ShellRoute`, add the permission code to `PermissionCodes.all`.

**4.4 Optional but recommended:** a "Website" sidebar section grouping Content / Leads / Subscriptions, so app-only admins aren't confused by modules they don't use.

**Exit:** one admin, one login, one permission model, both storefronts.

---

## Phase 5 — Hardening *(ongoing, start at Phase 1)*

- Rotate the leaked service-role key; move secrets to Vercel env vars
- Delete `supabase/migrations/0001_orders.sql` (creates an **un-prefixed `orders` table** — a real collision risk with the app's)
- Website: adopt React Router, `React.lazy` the heavy pages, add an error boundary (`App.tsx` is a manual `switch` with all 24 pages statically imported)
- Tests: Vitest on `pricing.ts` + the adapters first — pure functions where money bugs live. Snapshot-test every Edge Function response shape so app regressions are caught in CI.
- Sentry on all three surfaces; alert on order-sync queue depth
- Admin: `test/widget_test.dart` is still the Flutter scaffold default. Add real tests for `PermissionsController` and the repositories.

---

# PART 5 — SEQUENCING

| Phase | Work | Est. | Risk to app | Depends on |
|---|---|---|---|---|
| 0 | Discovery (needs app zip) | 1–2 d | None | — |
| 1 | Schema extensions (additive) | 3–4 d | **Very low** | 0 |
| 2 | Edge Functions (additive) | 1 wk | Low | 1 |
| 3 | Rewire website | 2 wk | Medium | 2 |
| 4 | Extend admin UI | 1 wk | None | 2 |
| 5 | Hardening | ongoing | None | — |

**Total ≈ 5 weeks** for one developer. Phases 3 and 4 can run in parallel with two.

```
Week 1     Phase 0 + Phase 1              ← rotate the key on day 1
Week 2     Phase 2  (Edge Functions)
Week 3-4   Phase 3  (website rewire)  ║  Phase 4 (admin UI) in parallel
Week 5     Cutover, data migration, hardening
```

**Fastest visible win:** Phase 1 + the `storefront` function + website step 3.3. Roughly two weeks and your existing admin controls the website's entire catalog — with near-zero risk, because everything is additive and read-only.

---

# PART 6 — RISK REGISTER

| # | Risk | Mitigation |
|---|---|---|
| R1 | Product variant model breaks the app's catalog UI | Option B (separate table). App never queries it. Regression-test the app's product screens. |
| R2 | Customer dedupe merges two real people | Reconciliation report reviewed manually before merge; `igo_customers` kept as shadow for one cycle |
| R3 | Edge Function change breaks the app | Additive-only; snapshot-test every existing response shape in CI |
| R4 | Website order write fails silently (bug exists today) | Non-200 on failure + retry queue + alerting |
| R5 | `channel` default wrong on existing rows | `default 'app'` — correct, since every current row is from the app |
| R6 | Two admins editing the same product | Optimistic concurrency via `updated_at`, or just accept last-write-wins (low volume) |
| R7 | Website catalog is a different SKU set from the app's | Surfaces in Phase 0.5 mapping. May need a `channel_visibility` column on `products`. |
| R8 | Leaked service-role key | Rotate immediately — independent of this plan |

---

# PART 7 — OPEN QUESTIONS

1. **Is the app's catalog the same 83 SKUs as the website?** Superset, subset, or different? If products should be app-only or web-only, add `channel_visibility text[] default '{app,web}'` to `products` in Phase 1.
2. **Should prices differ per channel?** If yes, `price` moves onto `product_variants` per channel and the model changes.
3. **Should coupons be app-only, web-only, or shared?** Suggest adding `channel` to `coupons` in Phase 1 so you can decide per-coupon.
4. **Does the app have subscriptions in production?** `admin-analytics` counts them but there's no admin module — the website has a full subscription feature. Confirm before merging.
5. **Does the app have a wallet/rewards system already?** If yes, the website's must reconcile with it rather than create a parallel one.
6. **Does the website need its own admin role** (e.g. a content editor who can't see app orders)? Trivial with the existing RBAC — just a role with only `content.manage`.

---

## Immediate next step

**Send the app zip** (whole repo minus `build/`, `.dart_tool/`, `android/`, `ios/`). With the 10 Edge Function sources and `phase18_admin.sql` I'll turn Phase 2 from a specification into actual TypeScript, and answer questions 1–5 from the code instead of asking you.

Nothing in this plan gets implemented until you approve it.
