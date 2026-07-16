# IGO Protein Cuts

A farm-to-fork fresh meat and seafood delivery platform for Coimbatore. Customers browse and order fresh chicken, mutton, fish, seafood, and eggs with 60–90 minute delivery, batch-level QR traceability back to the source farm, and an FSSAI-certified, never-frozen supply chain.

Live site: [igoproteincuts.com](https://igoproteincuts.com)

This README is written for whoever picks this codebase up next. Section 6 ("Known Issues & What's Real vs. Mocked") is the most important part — read it before you assume any number on the admin dashboard is live data.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 6
- **Styling:** Tailwind CSS 4
- **Animation:** Motion (Framer Motion)
- **3D:** Three.js / React Three Fiber (hero visuals, traceability scene)
- **Routing:** React Router v7
- **Backend/data:** Supabase (Postgres, auth, row-level security)
- **Payments:** Razorpay
- **Email:** Resend (primary) with Nodemailer/Gmail fallback
- **AI:** Google Gemini, called only from a serverless proxy — key never reaches the browser
- **Icons:** Lucide React

## Features

- **Product catalog & cart** — category browsing, quick-view modals, custom protein-box builder, cross-sell suggestions, wishlist toggle.
- **Checkout** — Razorpay (UPI/cards/net banking) and Cash on Delivery, delivery slot picker, one-click checkout for returning customers, subscribe & save recurring orders, one working coupon code (`IGO10`, 10% off).
- **IGO Prime membership** — paid annual membership (Razorpay) with free-delivery and priority-slot benefits, membership status persisted in Supabase (`profiles.is_prime_member`).
- **Traceability** — QR-code scan flow tying a product back to its source farm batch, with a 3D visualization.
- **AI shopping assistant** — chat widget backed by a server-side Gemini proxy (`/api/ai-chat`).
- **Customer accounts** — email + OTP sign-in, order history, saved addresses, wishlist, in-app inbox for order/support notifications.
- **Admin dashboard** (`/admin`) — order management, product/inventory management, customer management, customer support queries, analytics.
- **B2B / wholesale** — bulk ordering section for restaurants and businesses.

## Project Structure

```
src/
  components/     Shared UI (Navbar, modals, AuthModal, AdminGuard, cart drawer, etc.)
  sections/       Homepage sections (Hero, ProductGrid, IGOPrime, Testimonials, etc.)
  pages/          Routed pages: Checkout, Blog, OrderReview, NotFound, admin/*
  pages/admin/    Admin dashboard pages (Dashboard, Products, Orders, Customers, Analytics, Queries, Settings)
  context/        CartContext — cart, wishlist, delivery slot state (in-memory, see section 6)
  services/       Data layer — orderService, productService, authService, queryService, productStore
  lib/            Supabase client setup (src/lib/supabase.ts)
  data/           Static product catalog fallback (used when Supabase isn't configured)
  types/          Shared TypeScript types (Product, etc.)
api/              Serverless functions: send-email.ts, send-otp.ts, ai-chat.ts
static/           Deployed static assets — this is Vite's publicDir (see vite.config.ts), NOT /public
supabase_setup.sql  Full database schema + RLS policies — run this in the Supabase SQL editor
```

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- A Razorpay account (test keys are fine for development)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env template and fill in your own keys (see the table below for what each one does):
   ```bash
   cp .env.example .env
   ```
3. Run `supabase_setup.sql` in your Supabase project's SQL editor. It creates all six tables (`profiles`, `products`, `orders`, `delivery_slots`, `inbox_messages`, `customer_queries`) and their RLS policies, and is safe to re-run (uses `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`).
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Runs at `http://localhost:5173`.

### Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build to `dist/`, then mirrored into `.next/`, `public/`, `public_html/`, and `build/` for different hosting targets |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | TypeScript type-check (`tsc --noEmit`) — there is no automated test suite in this repo |
| `npm run clean` | Remove the `dist/` build output |

## Environment Variables

Set these in `.env` locally, and in your hosting provider's dashboard for production (Vercel Project Settings, or Hostinger's environment config — they are not read from a committed `.env` file in production).

| Variable | Used for | Exposed to browser? |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes (public by design) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes (public by design) |
| `SUPABASE_SERVICE_ROLE_KEY` | Reserved for server-side admin Supabase access | **No — not currently used anywhere in `src/`; never reference it from client code** |
| `VITE_RAZORPAY_KEY_ID` | Razorpay checkout widget | Yes (public by design) |
| `VITE_GEMINI_API_KEY` (or `GEMINI_API_KEY`) | Gemini AI, read server-side only by `api/ai-chat.ts` (proxy) | No — despite the `VITE_` prefix, it's only read inside the serverless function, never in browser code |
| `RESEND_API_KEY` | Transactional email (OTP, order updates) — checked first | No — stays server-side |
| `GMAIL_USER` / `GMAIL_PASS` | Nodemailer/Gmail SMTP fallback if Resend isn't configured or fails | No — stays server-side |

Anything prefixed `VITE_` is bundled into the client-side JavaScript and visible to anyone who views the page source — expected for public keys (Supabase anon key, Razorpay key ID), but a genuinely secret key must never get a `VITE_` prefix.

## Known Issues & What's Real vs. Mocked

This section exists so the next developer doesn't have to reverse-engineer what's actually wired up. Everything below was verified by reading the source, not assumed.

**Real / live data:**
- Orders, revenue, active-order count, average order value, and category mix on the admin dashboard and Analytics page are computed from real orders (Supabase `orders` table, with a localStorage cache as an offline fallback).
- Order confirmation, status-update, and support-reply emails all send for real via `/api/send-email` (Resend, falling back to Gmail SMTP).
- IGO Prime membership purchase runs a real Razorpay charge and persists `is_prime_member` to Supabase.
- Customer support queries (`customer_queries`, `inbox_messages`) are fully Supabase-backed — **but silently do nothing if `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` aren't configured** (no localStorage fallback for these two).

**Cosmetic / hardcoded — looks live, isn't:**
- Admin Dashboard → "Inventory Alerts" (Chicken Breast 2kg, Vanjaram Steaks 5kg, etc.) and "Live System Feed" are static hardcoded arrays in `DashboardOverview.tsx`, not read from real stock or activity data.
- Analytics page → "Predictive Demand" (labeled "AI-powered sales forecast") and "Inventory Health" (labeled "Real-time stock level monitoring") are static hardcoded arrays in `orderService.ts::getAnalytics()`. "Batch Health: 100%" is a fixed string, not a calculation.
- "IGO Rewards" points balance (250 pts) and referral code (`FRESH-IGO-100`) in the profile menu are static, not tied to any account or ledger. The "IGO Prime — Cashback Rewards, 5% instant credit" benefit listed on the homepage has no implementation anywhere in the code.
- Order review flow (`/review/:orderId`) awards "50 IGO Reward Points" — this message displays unconditionally; there's no points system to actually credit.
- The photo-upload box on the review page is decorative — it isn't wired to a file input or any upload handler.

**Functional gaps:**
- Product stock (`stockLeft` / `stock_left`) is not decremented when an order is placed. Admin can only toggle a product fully in-stock (50) or out-of-stock (0) — there's no per-unit inventory tracking tied to real sales.
- Cart and wishlist live in React state only (`CartContext.tsx`), not persisted to `localStorage` or Supabase — a page refresh clears both.
- Customer reviews submitted at `/review/:orderId` are saved to `localStorage` (`igo_reviews`) only, never to Supabase. They won't survive a cleared browser or show up on another device, and the homepage testimonials section reads from this same local-only store.
- Only one coupon code exists (`IGO10`, hardcoded 10% off in `Checkout.tsx`) — there's no coupon table or admin UI to manage codes.

**Security notes worth fixing before this goes further into production use:**
- Admin login (`AdminLogin.tsx`) checks a hardcoded plaintext password (`Admin@123`) in client-side code and sets a `localStorage` flag — this is visible to anyone who reads the bundled JS and is not real authentication. `AdminGuard.tsx` only checks that same localStorage flag; there's no server-side session check.
- Customer OTP verification (`AuthModal.tsx`) compares the code the user types against a value generated and held in browser state — plus a permanent hardcoded bypass code `1234` that authenticates any email. There is no server-side OTP verification.
- `supabase_setup.sql`'s RLS policies restrict admin writes (`products`, `orders` UPDATE/ALL) to rows where `auth.uid()` resolves to a `profiles.role = 'admin'` row — but the app never signs users into Supabase Auth (it uses the custom OTP flow above), so `auth.uid()` is always null for requests from this app. On a fresh Supabase project with these exact policies applied, admin panel writes (editing a product, updating an order's status) will likely be rejected by RLS. Either relax those specific policies or wire real Supabase Auth sessions for the admin flow — right now there's a mismatch between the schema's security model and how the app actually authenticates.

## SQL Files in This Repo

- `supabase_setup.sql` — the only schema file to run. Creates `profiles`, `products`, `orders`, `delivery_slots`, `inbox_messages`, `customer_queries`, enables RLS on all of them, and defines the policies referenced above. Safe to re-run.
- `supabase/` directory — check here for any migration history before assuming `supabase_setup.sql` is the sole source of truth; reconcile the two if they've drifted.

## Deployment

Builds to static files, deployable to Vercel or a traditional host (Hostinger). See `DEPLOY_NOW.md` and `HOSTINGER_DEPLOY.md` for provider-specific steps. Set environment variables in the hosting provider's dashboard in both cases — they don't travel with the build.

## Project Status

This is a working, actively developed storefront with real checkout, real payments, and real order/email flows — it is not a static demo. But large parts of the admin dashboard's "intelligence" (forecasting, inventory health, live activity feed) are placeholder visuals, and the admin/OTP auth described above is not production-grade security. Treat the "Known Issues" section as the punch list before a serious production launch.

## Suggested Next Steps for Whoever Picks This Up

1. Replace the hardcoded admin password with real Supabase Auth (or another proper auth provider) and update the RLS policies to match how the app actually authenticates.
2. Move OTP verification server-side and remove the `1234` bypass code.
3. Decide whether cart/wishlist/reviews should persist to Supabase — right now all three are either in-memory or localStorage-only.
4. Either wire the Analytics "Predictive Demand" / "Inventory Health" widgets to real data or relabel them as illustrative.
5. Add stock decrement logic to `createOrder` (or a Supabase trigger) if inventory tracking needs to be accurate.
6. Add a coupon table + admin UI if more discount codes are needed beyond the one hardcoded `IGO10`.

## License

Proprietary — all rights reserved.
