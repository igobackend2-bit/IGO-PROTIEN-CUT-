# IGO Protein Cuts — Monorepo

Farm-to-fork fresh meat and seafood delivery for Coimbatore. Customers order fresh chicken, mutton, fish, seafood and eggs with 60–90 minute delivery, batch-level QR traceability back to the source farm, and an FSSAI-certified, never-frozen supply chain.

Live website: [igoproteincuts.com](https://igoproteincuts.com)

This repository holds all three client surfaces plus the shared backend:

| Path | What it is | Stack | Status |
| --- | --- | --- | --- |
| [`apps/website`](apps/website) | Public marketing site + storefront + a React admin panel at `/admin` | React 19, TypeScript, Vite 6, Tailwind 4 | Live in production |
| [`apps/mobile`](apps/mobile) | Customer mobile app (Android, iOS, Windows) | Flutter, Riverpod 2, Supabase | Feature-complete, not shipped to stores |
| [`apps/admin`](apps/admin) | Internal admin dashboard (Flutter Web) | Flutter Web, Riverpod 3, go_router 17 | Built, deploys to Vercel |
| [`supabase`](supabase) | Shared backend — 18 migrations, 15 Edge Functions | Postgres, RLS, Deno Edge Functions | Backs `apps/mobile` + `apps/admin` |
| [`docs`](docs) | Website audit + planning documents (`.docx`) | — | Reference only |

## ⚠️ Read this first: there are two separate backends

**`apps/website` and the two Flutter apps do not share a database.** This is the single most important thing to understand before changing anything here.

- The last committed production bundle of the website (`apps/website/public_html`) points at Supabase project **`rwasfuhrvqscqnpwqooq`**, using its own 6-table schema in [`apps/website/supabase_setup.sql`](apps/website/supabase_setup.sql) (`profiles`, `products`, `orders`, `delivery_slots`, `inbox_messages`, `customer_queries`).
- Both Flutter apps hardcode Supabase project **`aweevhgnbjuxcvnvjeie`** (see `apps/mobile/lib/utils/supabase_config.dart` and `apps/admin/lib/core/config/supabase_config.dart`), backed by the ~38-table schema under [`supabase/migrations`](supabase/migrations).

Consequences, in plain terms:

- A customer who signs up on the website does **not** exist in the mobile app, and vice versa.
- An order placed on the website never appears in the Flutter admin dashboard. An order placed in the mobile app never appears in the website's `/admin`.
- The two schemas disagree on the shape of the tables they share names for (`products`, `orders`, `profiles`), so you cannot simply repoint one at the other's project without a migration.
- There are effectively **two admin panels** governing two different datasets — the React one at `apps/website/src/pages/admin` and the Flutter one in `apps/admin`.

Unifying these is the biggest outstanding architectural decision in this repo. See [Roadmap](#roadmap--the-real-punch-list).

## Architecture

```
                     ┌──────────────────────────┐
 apps/website  ─────► Supabase rwasfuhr…  (6 tables, own schema)
 (React, live)       │ + /api serverless fns    │
                     │   send-email, send-otp,  │
                     │   ai-chat (Gemini proxy) │
                     └──────────────────────────┘

 apps/mobile   ─────┐
 (Flutter)          │  ┌────────────────────────────────────────┐
                    ├──► Supabase aweevhgn…  (~38 tables, RLS)  │
 apps/admin    ─────┘  │  supabase/migrations  phase7 → phase20 │
 (Flutter Web)         │  supabase/functions   admin-* (10)     │
                       │                       delivery (5)     │
                       └────────────────────────────────────────┘
```

The Flutter side follows a strict rule worth preserving: **no business logic in Flutter.** Customers read their own rows through RLS-restricted `SELECT`s; every privileged write goes through an Edge Function running with the service role. `apps/admin` never touches tables directly — all of its reads and writes go through the `admin-*` functions via a single call site, `apps/admin/lib/core/network/edge_function_client.dart`.

### Shared backend layout

- **`supabase/migrations`** — 18 migrations, named by development phase (`phase7_8_payments_orders` → `phase20_delivery_partner_app`). Apply in filename order. Covers products/categories, payments, wishlist, profiles, notifications, reviews, loyalty, subscriptions, offers/coupons, support tickets, delivery tracking, and the admin RBAC system.
- **`supabase/functions`** — 15 Edge Functions plus `_shared` helpers:
  - `admin-analytics`, `admin-coupons`, `admin-delivery`, `admin-inventory`, `admin-notifications`, `admin-orders`, `admin-products`, `admin-reports`, `admin-support`, `admin-users` — the admin API. Every one takes `{ action, ...params }` and returns JSON or `{ error }`.
  - `assign-delivery`, `complete-delivery`, `estimate-eta`, `update-location`, `verify-delivery-otp` — the delivery pipeline.
- **Admin RBAC** — `admin_users` grants membership, and the `admin_has_permission` RPC is the single source of truth for the 17 permission codes mirrored in `apps/admin/lib/core/permissions/permission_codes.dart` (`products.manage`, `orders.manage`, `roles.manage`, …). The dashboard hides nav items and gates screens on these.

## Getting started

Clone once, then work in whichever app you need. Node 20+ for the website; Flutter 3.x with Dart SDK 3.12+ for the two Flutter apps.

### apps/website

```bash
cd apps/website && npm install && npm run dev
```

Runs at `http://localhost:5173`. Needs a `.env` — copy `apps/website/.env.example` and fill it in. Without `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` the storefront falls back to a static catalog, and support-query features silently do nothing.

### apps/mobile

```bash
cd apps/mobile && flutter pub get && flutter run
```

Supabase credentials are compiled in from `lib/utils/supabase_config.dart` — there is no `.env` step. Targets Android, iOS and Windows.

### apps/admin

```bash
cd apps/admin && flutter pub get && flutter run -d chrome
```

Login requires a real Supabase Auth user that also has an active row in `admin_users`. Without one, the router bounces you straight back to `/login` — create the membership row in Supabase first.

### supabase

```bash
supabase link --project-ref <your-project-ref>
supabase db push
supabase functions deploy
```

Run from the repo root. Local CLI link state (`supabase/.temp`) is gitignored — you will need to `link` on a fresh clone.

## Deployment

| Target | How | Notes |
| --- | --- | --- |
| Website → Hostinger | `.github/workflows/deploy.yml` on push to `main` | Builds `apps/website`, copies SEO files, FTP-uploads `dist/`. Only fires on changes under `apps/website/**`. |
| Website → Vercel | `apps/website/vercel.json` | Set the Vercel project's **Root Directory** to `apps/website`. |
| Admin → Vercel | `apps/admin/vercel.json` | Set **Root Directory** to `apps/admin`. The build clones the Flutter SDK inline and runs `flutter build web --release`. |
| Mobile | `flutter build apk` / `flutter build ipa` | No CI pipeline yet. |
| Backend | `supabase db push` + `supabase functions deploy` | Manual, from the repo root. |

Secrets live in the hosting provider (Vercel project settings, GitHub Actions secrets) — never in the repo. The Hostinger workflow expects `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_RAZORPAY_KEY_ID`, `VITE_GEMINI_API_KEY`, `FTP_USERNAME`, `FTP_PASSWORD`.

Website environment variables are documented in full in [`apps/website/README.md`](apps/website/README.md). Anything prefixed `VITE_` is bundled into client JS and publicly visible — that is fine for the Supabase anon key and Razorpay key ID, and must never happen to a genuinely secret key.

## What's real vs. what looks real

Verified by reading the source, not assumed. The per-app READMEs go deeper; this is the cross-cutting summary.

**Real and working:**
- Website storefront, cart, checkout, and the order/OTP/support emails through `/api/send-email` (Resend, falling back to Gmail SMTP).
- `apps/admin` — every screen reads live data from the `admin-*` Edge Functions. The dashboard fans out to eight of them in parallel. Nothing on it is a hardcoded placeholder.
- `apps/mobile` — real Supabase Auth (email + password), and 17 feature modules across 49 screens covering discovery, cart, checkout, orders, tracking, invoices, subscriptions, loyalty, wallet, support tickets, wishlist, offers and profile.
- Admin RBAC, enforced server-side via `admin_has_permission` rather than trusted from the client.

**Payments are not fully wired anywhere:**
- `apps/mobile` supports **Cash on Delivery only**. `RazorpayPaymentGateway` throws `UnimplementedError` — the interface is there, the key is not.
- The website's last committed production bundle contains the Razorpay key `rzp_test_placeholder`. Confirm what is actually set in the live host's environment before assuming card payments work in production.

**Website-only placeholders** (detailed in [`apps/website/README.md`](apps/website/README.md)): the React admin's "Inventory Alerts", "Live System Feed", "Predictive Demand" and "Inventory Health" widgets are hardcoded arrays; IGO Rewards points and referral codes are static; cart/wishlist are in-memory and reset on refresh; customer reviews save to `localStorage` only.

**Built but unused:**
- Phase 20 shipped the full backend for a **delivery partner app** — partner auth identity, RLS, Edge Functions. No such app exists in this repo yet.
- `apps/mobile/lib/services/admin_service.dart` is a complete typed client for the admin Edge Functions, left over from before `apps/admin` existed. The mobile app's only admin surface today is a product-photo upload screen.

## Security issues to fix before scaling up

These are known and load-bearing — treat them as blockers, not nits.

1. **The website's admin login is not authentication.** `apps/website/src/pages/admin/AdminLogin.tsx` compares against a hardcoded plaintext password in client-side code and sets a `localStorage` flag; `AdminGuard.tsx` checks only that flag. The password is readable in the shipped JS bundle. There is no server-side session check. `apps/admin` does this correctly — real Supabase Auth plus a server-checked membership row — and is the model to follow.
2. **The website's customer OTP is not verified server-side.** `AuthModal.tsx` compares the typed code against a value held in browser state, and a hardcoded bypass code authenticates any email address.
3. **The website's RLS policies don't match how it authenticates.** `apps/website/supabase_setup.sql` gates admin writes on `auth.uid()` resolving to a `profiles.role = 'admin'` row, but the website never establishes a Supabase Auth session, so `auth.uid()` is always null. On a fresh project with those policies applied, website admin writes will be rejected.
4. Supabase anon keys are committed in the Flutter sources. Anon keys are public by design, so this is not a leak — but it does mean pointing an app at a different project requires a code change and a rebuild.

## Roadmap — the real punch list

Roughly in dependency order:

1. **Decide the backend question.** Either migrate the website onto the `aweevhgn…` schema (one database, one customer base, one admin panel) or formally accept two products. Everything below is cheaper after this call.
2. **Replace the website's admin auth and OTP with real Supabase Auth**, then reconcile its RLS policies with the result. Reuse the pattern in `apps/admin`.
3. **Retire one of the two admin panels.** `apps/admin` is the more complete and more secure of the two.
4. **Wire a real payment gateway** — the mobile `PaymentGateway` interface is ready for it, and the website's live Razorpay key needs verifying.
5. **Ship the mobile app.** It is feature-complete but has no store release or CI pipeline.
6. Build the delivery partner app the Phase 20 backend is already waiting for.
7. Fix the website's cosmetic-but-labelled-live admin widgets, or relabel them as illustrative.

## Repository notes

- History from all three original repositories is preserved. `apps/mobile` and `apps/admin` were merged with `git subtree`, so `git log` covers everything; their standalone GitHub remotes (`igobackend6/Protein-Cuts-App`, `igobackend6/Protein-cuts-admin`) still exist as separate mirrors.
- `apps/website/public_html`, `apps/website/.next` and `apps/website/public` are committed **build output** mirrors for different hosting targets, generated by `npm run build`. They are not source — do not edit them by hand.
- `apps/website/supabase_setup_website_variant.sql` is a second, drifted copy of the website schema that predated this merge. Reconcile it against `supabase_setup.sql` before trusting either.
- There is no automated test suite in any of the three apps. `npm run lint` in `apps/website` is a TypeScript type-check; the Flutter projects have only the default generated test file.

## License

Proprietary — all rights reserved.
