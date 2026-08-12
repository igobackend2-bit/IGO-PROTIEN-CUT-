# IGO Protein Cuts — Website Audit & Shared-Admin Implementation Plan

**Date:** 30 July 2026
**Scope:** Full audit of the Protein Cuts website + plan to drive it from the existing
Flutter admin (`protein-cuts-admin.vercel.app`) **without changing anything the mobile app depends on**.

---

# PART 1 — WEBSITE AUDIT

## 1.1 Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript, Vite 6, Tailwind CSS 4 |
| Routing | **Hand-rolled** `switch` on `window.location.pathname` in `src/App.tsx` — no router library |
| Server | Express 4 (`server.ts`, ~500 lines), SSR-less; Vite middleware in dev, static `dist/` in prod |
| Database | Supabase Postgres, project **`aweevhgnbjuxcvnvjeie`** (REST via `fetch`, no `@supabase/supabase-js`) |
| 3D / motion | three.js, motion, canvas-confetti |
| AI | `@google/genai` (Gemini) for AI search, with rule-based fallback |
| Payments | Razorpay (falls back to a simulated flow when no key) |
| OTP | MSG91 (falls back to dev-mode console codes) |

**Size:** ~18,750 lines of TS/TSX across 69 source files. Largest: `mockData.ts` (2,768), `HomePage.tsx` (1,611), `CartPage.tsx` (1,137), `ProductDetailPage.tsx` (811), `AdminDashboard.tsx` (774).

## 1.2 What's actually built

Genuinely comprehensive on the front end — 24 pages, 20 components, 20 homepage sections:

- **Catalog:** 83 hardcoded products across chicken / mutton / beef / fish / eggs / healthy add-ons, each with weight options, nutrition, gallery, reviews, bone-type, freshness
- **Commerce:** cart with cooking-assistant cross-sell, bulk-tier pricing engine (`src/lib/pricing.ts`), coupons, wallet redemption, delivery-slot picker, 4 payment methods, Razorpay hook
- **Account:** orders, profile, rewards, wallet, referrals, coupons, subscriptions, wishlist
- **Growth:** combos, flash sale, membership tiers (Gold/Platinum/Elite), Build-Your-Own-Box subscriptions, B2B, franchise, gifting, careers
- **Support:** ticketing + FAQ + AI agent simulation, returns
- **Admin:** `/admin` route → `AdminDashboard.tsx` with 10 tabs

## 1.3 Critical findings

### 🔴 F1 — localStorage is the system of record, not Supabase

This is the single biggest structural issue and it is what blocks the shared admin.

`src/lib/storage.ts` (`StoreService`) and `src/lib/supabaseClient.ts` (`SupabaseService`) are **both pure localStorage wrappers**. Despite the filename, `supabaseClient.ts` contains *zero* Supabase calls — it reads and writes 10 browser keys seeded from `mockData.ts`:

```
protein_cuts_products_v2      protein_cuts_notifications_v1
protein_cuts_orders_v1        protein_cuts_tickets_v1
protein_cuts_cart_v1          protein_cuts_faqs_v1
protein_cuts_coupons_v1       protein_cuts_returns_v1
protein_cuts_user_v1          protein_cuts_subscriptions_v1
protein_cuts_wishlist_v1      protein_cuts_delivery_partners_v1
protein_cuts_leads_v1         protein_cuts_audit_logs_v1
protein_cuts_gift_note_v1     protein_cuts_rewards_v1
protein_cuts_recently_viewed  protein_cuts_wallet_v1
```

**Consequences:**
- Every visitor gets their own private copy of the catalog, prices, stock and orders
- A price edit in `/admin` changes it **only in that one browser**, and is wiped by a cache clear
- Two devices for the same customer show different order histories
- Stock levels are fiction — nothing decrements globally, so oversell is guaranteed at scale
- **No admin — yours or any other — can ever control this site until this is fixed**

### 🔴 F2 — Only 4 of ~20 entities reach the database

`server.ts` touches Supabase in exactly two places:

| Endpoint | Table | Direction |
|---|---|---|
| `POST /api/orders` | `igo_orders` | write-only (upsert) |
| `POST /api/orders/status` | `igo_orders` | write-only (patch) |
| `POST /api/auth/signup` / `login` / `reset-password` | `igo_customers` | read + write |

Everything else — products, inventory, combos, coupons, subscriptions, tickets, notifications, wallet, rewards, referrals, delivery partners, audit logs — never leaves the browser. And note the orders flow is **write-only**: the site pushes orders up but never reads them back, so `GET` of order history still comes from localStorage.

### 🔴 F3 — Two parallel namespaces in one shared database

`supabase/migrations/0002_igo_platform_schema.sql` states it plainly:

> *"This project's Supabase database is shared with another of the owner's apps — using a distinct prefix guarantees these new tables can never collide with that app's existing table names."*

So project `aweevhgnbjuxcvnvjeie` currently holds:

- **`igo_*` tables** — created by/for the website: `igo_customers`, `igo_orders`, `igo_referrals`, `igo_subscriptions`, `igo_combos`, `igo_wallet_transactions`, `igo_reward_transactions`
- **un-prefixed tables** — owned by the mobile app, and **these are what the Flutter admin manages**

The isolation that made the website safe to build is exactly what stops your admin from seeing it. **This is the core problem to solve.**

### 🟠 F4 — Authentication is fake on the client

`SupabaseService.loginWithEmail()` (`supabaseClient.ts:47`) mints a session client-side with **no password check at all**, and grants admin purely on a string match:

```ts
role: email.includes('admin') ? 'Super Admin' : 'Customer'
```

Anyone typing `admin@anything.com` becomes Super Admin. Meanwhile `/admin` in `App.tsx:124` renders `AdminDashboard` with **no guard whatsoever** — no session check, no role check, no redirect. The route is publicly reachable.

The *server* auth (`server.ts:252–405`) is much better — scrypt hashing with random salt, `timingSafeEqual` comparison, email validation — but the client bypasses it entirely, and there is no session token, no JWT, no cookie. Nothing binds a browser to a verified identity.

### 🟠 F5 — Supabase RLS locks out everything except service_role

Every `igo_*` table has exactly one policy:

```sql
create policy "Service role full access" on public.igo_<table>
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
```

RLS is on and there is no `anon` or `authenticated` policy. So `VITE_SUPABASE_ANON_KEY` in the browser bundle can read **nothing** — correct for security, but it means every database read must go through `server.ts`. Any plan that assumes direct browser→Supabase queries will silently return empty arrays.

### 🟠 F6 — Secrets are committed to `.env`

`.env` is tracked in the working tree and contains a live `SUPABASE_SERVICE_ROLE_KEY` — a full-bypass credential for a database **shared with your production mobile app**. Verify `.gitignore` covers it and check git history; if it was ever pushed, that key must be rotated in the Supabase dashboard.

### 🟡 F7 — Order writes fail silently

Both Supabase calls in `server.ts` are wrapped in `try/catch` that only `console.error`s and returns `{ success: true }` regardless. A customer sees "order placed", the order lives in their localStorage, and the database never receives it — with no alert to anyone. Comment at `server.ts:404` acknowledges this is deliberate ("non-fatal"), which was reasonable while Supabase was optional, but is unacceptable once the admin depends on that data.

### 🟡 F8 — Migration `0001` is dead but still runnable

`0001_orders.sql` creates an **un-prefixed `public.orders` table**. `0002` supersedes it. If anyone runs `0001` against the shared project it could collide with an app table of the same name. Delete it or rename it `0001_orders.sql.deprecated`.

### 🟡 F9 — No router, no code-splitting

`App.tsx` is a manual `switch` on `pathname` with all 24 pages statically imported, so every visitor downloads the entire site — including the 774-line admin dashboard and the three.js hero — on first paint. There's no lazy loading, no error boundary, no 404 for unmatched dynamic segments beyond the default case.

### 🟡 F10 — No tests, no CI, no error tracking

`package.json` has no test script (`lint` is just `tsc --noEmit`). No Sentry/logging. For a codebase about to have its entire data layer rewritten, this is the riskiest gap after F1.

## 1.4 Severity summary

| # | Finding | Severity | Blocks shared admin? |
|---|---|---|---|
| F1 | localStorage is the system of record | 🔴 Critical | **Yes** |
| F2 | Only orders + customers reach the DB | 🔴 Critical | **Yes** |
| F3 | `igo_*` vs app namespace split | 🔴 Critical | **Yes** |
| F4 | Client-side fake auth, unguarded `/admin` | 🟠 High | Yes |
| F5 | RLS blocks anon key entirely | 🟠 High | Yes |
| F6 | service_role key in tracked `.env` | 🟠 High | No |
| F7 | Silent write failures | 🟡 Medium | Yes |
| F8 | Dead migration `0001` | 🟡 Medium | No |
| F9 | No router / code-splitting | 🟡 Medium | No |
| F10 | No tests / CI / error tracking | 🟡 Medium | No |

---

# PART 2 — ADMIN PANEL ANALYSIS

## 2.1 What I established

- `protein-cuts-admin.vercel.app` is a **Flutter Web application**, app id `protein_cuts_admin`, served from Vercel
- Standard Flutter web build output: `main.dart.js`, `flutter_bootstrap.js`, `manifest.json`, `assets/`, canvaskit renderer
- `manifest.json` still carries scaffold defaults (`"description": "A new Flutter project."`, theme `#0175C2`) — it was generated by `flutter create` and never customised
- The second URL you gave (`protein-cuts-admin-git-main-...vercel.app`) is **not a repository** — it's Vercel's git-branch alias for the same deployment. Same bundle, same app.

## 2.2 What I could not establish, and why

`main.dart.js` is a compiled, minified, gzip-served Dart bundle. It returns as binary through the tooling available here, and even decompressed, Dart's dart2js output mangles identifiers heavily. I could not extract:

- The table names the admin reads and writes
- Whether it points at `aweevhgnbjuxcvnvjeie` or a different Supabase project
- Its auth model (Supabase Auth? custom? role table?)
- Its route/screen list and RBAC model

I also could not query project `aweevhgnbjuxcvnvjeie` directly — the Supabase connector in this session only has **`ktgaqyooycmgxmlpuefk` (INDIA_GREEN_APP, status INACTIVE)**, which is a different project.

**Everything in Part 4 that mentions specific app table names is therefore parameterised.** Phase 0 below resolves it in about ten minutes.

---

# PART 3 — THE CORE PROBLEM

```
                Supabase project aweevhgnbjuxcvnvjeie
   ┌──────────────────────────────────────────────────────────┐
   │                                                          │
   │   UN-PREFIXED TABLES              igo_* TABLES           │
   │   (products, orders, users…)      igo_orders             │
   │        ▲          ▲               igo_customers          │
   │        │          │               igo_combos             │
   │        │          │               igo_subscriptions      │
   │        │          │                    ▲                 │
   └────────┼──────────┼────────────────────┼─────────────────┘
            │          │                    │ write-only
     ┌──────┴───┐  ┌───┴──────────┐   ┌─────┴──────┐
     │ Mobile   │  │ Flutter      │   │ Website    │
     │ App      │  │ ADMIN        │   │ server.ts  │
     └──────────┘  └──────────────┘   └─────┬──────┘
                                            │
                                     ┌──────┴───────────────┐
                                     │ localStorage         │
                                     │ ← REAL source of     │
                                     │   truth for the site │
                                     └──────────────────────┘
```

The admin cannot manage the website for **two independent reasons**, and both must be fixed:

1. **Wrong storage.** Website state lives in each visitor's browser, not in Postgres. No admin can reach it.
2. **Wrong namespace.** Even the small slice that *is* in Postgres sits in `igo_*`, which the admin doesn't read.

## 3.1 Recommended architecture

> **Read-only first, then shared core.** Phase the website onto the app's canonical tables — reads before writes — keeping website-only concepts in `igo_*`. Zero changes to the Flutter admin and zero changes to the mobile app.

Why this over the alternatives:

- **vs. extending the admin to manage `igo_*`:** you told me the admin must not be affected. Extending it means Flutter work, a redeploy, and a permanent double dataset — two product catalogs, two price lists, two stock counts, drifting apart forever.
- **vs. a big-bang full merge:** rewriting every entity at once, on a codebase with no tests, against a database your live app depends on, is how you take down the app.
- **Read-only first** gives a visible win in days: the moment the website reads `products` from the app's table, editing a price in your existing admin changes the website. No admin code written.

## 3.2 Non-negotiable safety rules

These apply to every phase:

1. **Never `ALTER` or `DROP` an un-prefixed table.** New columns the website needs go in a side table `igo_product_web_meta` joined by product id, never as columns on the app's `products`.
2. **Never write to app tables before Phase 3**, and only then through `server.ts` with the service-role key, never from the browser.
3. **All new website tables keep the `igo_` prefix.** The namespace convention stays — it's the reason nothing has broken so far.
4. **Do Phases 1–3 against a Supabase branch or a restored staging copy first.** Never rehearse on the live project.
5. **After every phase, smoke-test the mobile app**, not just the website. The app is the incumbent; it wins every conflict.
6. **Keep localStorage as a read-through cache during migration**, so a Supabase outage degrades the site rather than breaking it.

---

# PART 4 — IMPLEMENTATION PLAN

## Phase 0 — Discovery *(blocking; ~1 day)*

Nothing below can be specified precisely until this runs.

**0.1 — Dump the app's real schema.** In the Supabase SQL editor for `aweevhgnbjuxcvnvjeie`:

```sql
-- Every table, its columns, types and nullability
select
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
from information_schema.tables t
join information_schema.columns c
  on c.table_schema = t.table_schema
 and c.table_name  = t.table_name
where t.table_schema = 'public'
  and t.table_type   = 'BASE TABLE'
order by t.table_name, c.ordinal_position;

-- Row counts, so you can tell live tables from abandoned ones
select relname as table_name, n_live_tup as approx_rows
from pg_stat_user_tables
where schemaname = 'public'
order by n_live_tup desc;

-- Every RLS policy (tells you how the admin authenticates)
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename;

-- Foreign keys — the real entity graph
select
  tc.table_name, kcu.column_name,
  ccu.table_name as references_table,
  ccu.column_name as references_column
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
order by tc.table_name;

-- Auth users: is the admin using Supabase Auth?
select count(*) from auth.users;
```

**0.2 — Grep the Flutter admin source** (once you give me the repo) for `.from('`, `.rpc('`, `select(`, `insert(`, `update(`, `Supabase.initialize` — that yields the definitive list of tables and columns the admin touches, plus the project URL it targets.

**0.3 — Produce the mapping table.** Deliverable of this phase:

| Website concept | Website today | App table | Column-level mapping | Owner after merge |
|---|---|---|---|---|
| Product | `INITIAL_PRODUCTS` in `mockData.ts` (83 items) | `products`? | *TBD* | App / admin |
| Stock | `product.stockCount` in localStorage | `inventory`? | *TBD* | App / admin |
| Order | `igo_orders` + localStorage | `orders`? | *TBD* | Shared |
| Customer | `igo_customers` | `users` / `customers`? | *TBD* | Shared |
| Coupon | localStorage only | `coupons`? | *TBD* | App / admin |
| Combo | `igo_combos` | — likely none | website-only | Website (`igo_`) |
| Ticket / FAQ | localStorage only | *TBD* | *TBD* | *TBD* |

**0.4 — Rotate the service-role key** if `.env` was ever committed. Check with `git log --all -- .env`.

**Exit criteria:** the mapping table above is fully populated, with no `TBD` in the "App table" column.

---

## Phase 1 — Catalog read-only from the app's tables *(~1 week)*

**Goal:** the website's product catalog, prices, images and stock come from the same table your Flutter admin already edits. Edit a price in the admin → it appears on the website. **Zero admin changes, zero app changes, zero writes.**

**1.1 Add server catalog endpoints** in `server.ts`, reusing the existing `supabaseRest()` helper:

```
GET  /api/catalog/products            → all active products
GET  /api/catalog/products/:id        → one product
GET  /api/catalog/categories          → category list
GET  /api/catalog/stock               → { [productId]: stockCount }
```

All service-role, server-side only. Add `Cache-Control: public, max-age=60` and an in-process 60-second memo so you don't hammer Postgres on every page view.

**1.2 Write the adapter** — new file `src/lib/catalogAdapter.ts`:

```ts
// Single translation point between the app's row shape and the website's
// Product type. When the app's schema changes, ONLY this file changes.
export function appRowToProduct(row: AppProductRow): Product { … }
```

The website's `Product` type is far richer than a typical app products table (weight options, nutrition, gallery, bone type, freshness, reviews). Fields the app table lacks come from a **new website-only side table**:

```sql
create table if not exists public.igo_product_web_meta (
  product_id      text primary key,   -- FK by convention to the app's products.id
  gallery_images  jsonb,
  weight_options  jsonb,
  nutrition       jsonb,
  bone_type       text,
  subcategory     text,
  seo_title       text,
  seo_description text,
  updated_at      timestamptz not null default now()
);
alter table public.igo_product_web_meta enable row level security;
create policy "Service role full access" on public.igo_product_web_meta
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
```

> This is the key trick: **the app's table stays untouched**, the website gets its extra fields, and the join happens in `server.ts`.

**1.3 Seed `igo_product_web_meta`** from the 83 products in `mockData.ts` via a one-off script, matched to app product ids by name (expect manual reconciliation on maybe 15–20% of names).

**1.4 Rewire `StoreService.getProducts()`** to fetch `/api/catalog/products`, keeping the localStorage copy as a stale-while-revalidate cache and `INITIAL_PRODUCTS` as the last-resort fallback. Gate it behind `VITE_CATALOG_SOURCE=supabase|local` so you can flip back instantly.

**1.5 Remove product CRUD from the website admin.** Delete the products/inventory tabs from `AdminDashboard.tsx` and replace with a link to the Flutter admin — the app admin is now the only place products are edited, which is exactly the goal.

**Exit criteria:** change a price in the Flutter admin → hard-refresh the website → new price shows in listing, PDP, cart and checkout. Mobile app unaffected.

**Rollback:** set `VITE_CATALOG_SOURCE=local`, redeploy. Nothing was written.

---

## Phase 2 — Unified customer identity *(~1.5 weeks)*

**Goal:** one customer record across app, website and admin. This is where Phase 1's safety ends, so it needs the most care.

**2.1 Decide the identity authority** — from Phase 0 results:

- If the app uses **Supabase Auth** (`auth.users` non-empty): adopt it. Replace the website's custom scrypt auth with Supabase Auth via `@supabase/supabase-js`, and treat `igo_customers` as a profile table keyed to `auth.uid()`. Strongly preferred.
- If the app uses **a custom users table**: keep `server.ts` as the auth broker but have it read/write the app's table, and reduce `igo_customers` to website-only extras.

**2.2 Reconcile duplicates.** Any customer who used both app and website has two records. Match on phone (already `unique` on `igo_customers`), then email. Produce a reconciliation report **before** merging anything; expect manual review of conflicts.

**2.3 Backfill.** Migrate `igo_customers` rows into the canonical table, preserving wallet balance and reward points. Keep `igo_customers` as a shadow copy for one release cycle — do not drop it.

**2.4 Fix F4.** Real sessions: httpOnly cookie or Supabase JWT. Guard `/admin` on the server. Delete the `email.includes('admin')` role assignment entirely.

**Exit criteria:** sign up on the website → the customer appears in the Flutter admin's customer list. Log in with app credentials on the website → works. App login unaffected.

**Rollback:** feature-flag the auth path; `igo_customers` shadow copy makes reversal possible for one cycle.

---

## Phase 3 — Order unification *(~1.5 weeks)*

**Goal:** website orders appear in the admin's order queue alongside app orders, and admin status changes reflect on the website.

**3.1 Extend the write.** `POST /api/orders` currently upserts `igo_orders` only. Make it **dual-write**: app orders table (canonical) + `igo_orders` (shadow), inside one logical operation. Tag website orders with `source = 'web'` **only if** such a column already exists — otherwise carry the flag in `igo_order_web_meta` rather than altering the app's table.

**3.2 Add the missing read.** There is currently no `GET /api/orders`. Add:

```
GET /api/orders?customerId=…     → order history
GET /api/orders/:id              → single order + live status
```

Repoint `UserAccountPage` and `LiveOrderTracking` at these instead of localStorage.

**3.3 Fix F7 — stop failing silently.** Supabase write failure must return a non-200 and surface in the UI. Add a retry queue (`igo_order_sync_queue`) so a transient outage doesn't lose the order, and alert on queue depth.

**3.4 Verify the status loop.** Admin marks an order "Out for delivery" → website's `LiveOrderTracking` reflects it. Poll every 30s, or use Supabase Realtime if the app already does.

**Exit criteria:** place a website order → visible in the Flutter admin within seconds → change its status there → website tracking updates. App order flow untouched.

**Rollback:** highest-risk phase. Keep the `igo_orders` shadow write permanently — it's your reconciliation ledger and costs nothing.

---

## Phase 4 — Commerce configuration *(~1 week)*

Move the remaining admin-controllable entities out of localStorage.

| Entity | Destination | Rationale |
|---|---|---|
| Coupons | App's `coupons` table if it exists, else `igo_coupons` | Discounts should be consistent app↔web |
| Combos | `igo_combos` (already exists, currently unused) | Website-only concept |
| Offers / banners | `igo_site_content` (new) | Website-only |
| Subscriptions | `igo_subscriptions` (already exists) | Reconcile with app plans if any |
| Support tickets | `igo_support_tickets` (new) | Website-only unless app has support |
| Notifications | App's notification table if it exists | Push should be unified |
| Delivery partners | App's table — the app certainly owns riders | Read-only from website |

Where the destination is `igo_*`, those entities stay in the website admin (Phase 5 keeps a thin shell). Where it's an app table, the Flutter admin takes over.

---

## Phase 5 — Retire the website admin *(~3 days)*

By this point `AdminDashboard.tsx` (774 lines) manages almost nothing the Flutter admin doesn't manage better.

- **Delete:** products, inventory, orders, delivery, customers, audit tabs
- **Keep as a thin "Website Content" shell:** combos, offers/banners, SEO metadata, support tickets — the genuinely website-only surface
- **Guard it properly:** server-side session + role check, no client-side role inference
- Or, if you'd rather have exactly one admin: build those four screens into the Flutter admin later, and delete `/admin` from the website entirely

---

## Phase 6 — Hardening *(ongoing, start in parallel at Phase 1)*

- **F6:** rotate the service-role key; confirm `.gitignore` covers `.env`; move secrets to Vercel env vars
- **F8:** delete or rename `0001_orders.sql`
- **F9:** adopt React Router, `React.lazy` the admin and three.js hero, add an error boundary
- **F10:** Vitest on `pricing.ts` and `catalogAdapter.ts` first (they're pure and they're where money bugs live), then Playwright on the order flow; add Sentry; add a CI job running `tsc --noEmit` + tests on every PR
- **F5:** keep RLS as-is. Do **not** add anon policies to app tables — server-side service-role access is the correct pattern here

---

# PART 5 — SEQUENCING & EFFORT

| Phase | Work | Est. | Risk to app | Blocks |
|---|---|---|---|---|
| 0 | Discovery + schema mapping | 1 day | None | Everything |
| 1 | Catalog read-only | 1 wk | **None** (read-only) | 0 |
| 2 | Customer identity | 1.5 wk | Medium | 0, 1 |
| 3 | Order unification | 1.5 wk | **High** | 0, 2 |
| 4 | Commerce config | 1 wk | Low | 0 |
| 5 | Retire website admin | 3 days | None | 1–4 |
| 6 | Hardening | ongoing | None | — |

**Total: ~6 weeks** for one developer, assuming Phase 0 doesn't uncover a fundamentally incompatible schema.

**Fastest visible win:** Phase 1 alone. In roughly a week your existing Flutter admin controls the website's entire catalog, with literally zero risk to the mobile app because nothing is written.

## Suggested order

```
Week 1   Phase 0 + start Phase 1     ← do Phase 6 key rotation immediately
Week 2   Finish Phase 1  ✅ admin now controls website catalog
Week 3-4 Phase 2  (staging first, then production behind a flag)
Week 4   Phase 4 in parallel  (independent of 2 and 3)
Week 5-6 Phase 3  (most dangerous — do it last, on a Supabase branch first)
Week 6   Phase 5
```

---

# PART 6 — OPEN QUESTIONS FOR PHASE 0

1. Does the Flutter admin point at `aweevhgnbjuxcvnvjeie`, or a different Supabase project entirely? *(If different, this becomes a cross-project integration and the plan changes substantially.)*
2. Does the app use Supabase Auth or a custom users table? *(Determines Phase 2's shape.)*
3. Does the app's `products` table carry weight variants and nutrition, or is it flat? *(Determines how much lands in `igo_product_web_meta`.)*
4. Is the app's catalog the same 83 SKUs as the website, a superset, or a different set entirely?
5. Does the admin have an RBAC model the website should inherit?
6. Are there Edge Functions or database triggers the app relies on that a website write could fire unexpectedly? *(Critical for Phase 3.)*

---

## What I need from you to finalise this

You said "both" — so:

1. **Connect Supabase project `aweevhgnbjuxcvnvjeie`** to the connector (only `ktgaqyooycmgxmlpuefk` / INDIA_GREEN_APP is connected today), **or** paste the output of the Phase 0.1 queries
2. **Put the `protein_cuts_admin` Flutter source in a folder I can read**

With those, I'll replace every *TBD* in Part 4 with real table and column names, and turn Phase 1 into actual code.
