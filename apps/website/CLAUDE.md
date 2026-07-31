# Project Rules — IGO Protein Cuts Website

> **Resuming work? Read `PROGRESS.md` first.** It records exactly what's done,
> what's mid-flight, which migrations have been run, and what the next action
> is. Then come back here for the scope rules below.


## ⛔ HARD SCOPE BOUNDARY — READ BEFORE ANY CHANGE

Work on **the website only**. The mobile app and the admin dashboard are live and
must not be disturbed in any way.

### May be modified
- `D:\Igo-websites\Protein cuts website` — all website source
- The website's own `igo_*` Supabase tables (its private namespace)
- New `igo_*` tables, if genuinely needed

### MUST NOT be modified — no exceptions
- The Flutter customer app repo (`Protein-Cuts-App`)
- The Flutter admin repo (`Protein-cuts-admin`)
- Any `supabase/functions/admin-*` Edge Function
- Any `supabase/functions/_shared/*` file
- Any existing app table — **no `ALTER TABLE`, no new columns, no policy changes**
  on `products`, `orders`, `order_items`, `profiles`, `coupons`, `offers`,
  `combo_packs`, `categories`, `support_tickets`, `notifications`,
  `subscriptions`, `wallet_transactions`, `reward_transactions`,
  `wishlist_items`, `admin_*`, or any other pre-existing table
- Any existing migration in the app repo

If a task appears to require touching any of the above: **stop and ask.**
Do not proceed and do not work around it.

## How the website talks to the backend

Supabase project `aweevhgnbjuxcvnvjeie` — shared by app, admin and website.

**Reads (allowed, no changes needed):** `products`, `categories`, `coupons`,
`offers`, `combo_packs`, `combo_pack_items`, `faq_items`, `delivery_partners`,
`achievements` all have `for select using (true)` policies. Read them directly
with the **anon key**, exactly as the Flutter app does.

**Writes (allowed, no changes needed):** `orders`, `order_items`, `profiles`,
`support_tickets`, `ticket_messages`, `subscriptions`, `wishlist_items`,
`product_reviews`, `payments`, `stock_alerts`, `order_ratings` all carry
user-scoped RLS (`auth.uid() = user_id`). Write via an **authenticated user
session** — never a service-role key in the browser.

**Website-only data** (banners, SEO, weight-variant ladders, B2B/franchise
leads) lives in `igo_*` tables. Never add it as a column on an app table.

## Non-negotiables
1. Never put `SUPABASE_SERVICE_ROLE_KEY` in client code or the Vite bundle.
2. Auth is **Supabase Auth**. Never mint sessions client-side.
3. Admin-owned data (prices, stock, catalog, coupons, offers, combos) is
   **read-only** from the website. The admin is the only writer.
4. Keep localStorage as a cache only — never as the source of truth.
5. Verify the app and admin still work after every change.
