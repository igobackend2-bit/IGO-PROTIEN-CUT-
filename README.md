# IGO Protein Cuts — Website

Public marketing site and storefront, built with React 19, TypeScript, Vite 6 and Tailwind 4. Also ships a React admin panel at `/admin`.

Part of a monorepo — read the [root README](../../README.md) first, especially the note about there being two separate backends. **This app does not share a database with `apps/mobile` or `apps/admin`.**

Live at [igoproteincuts.com](https://igoproteincuts.com).

## Run it

```bash
npm install
npm run dev
```

Other scripts: `npm run build` (Vite build + bundles `server.ts` for Node hosting), `npm start` (run the built server), `npm run preview`, `npm run lint` (`tsc --noEmit`).

## Where it deploys — and why that matters

**The live site is served by Hostinger, not Vercel.** `.github/workflows/deploy.yml` in the monorepo root builds this app with Vite on every push to `main` that touches `apps/website/**`, then FTPs `dist/` to a static host. Static hosting means **no Node, no serverless functions** — anything under `/api/` 404s in production, even though `vercel.json` and `api/ai-search.ts` exist for a possible future move to Vercel.

Static assets live in `static/`, not Vite's default `public/` — the monorepo's root `.gitignore` excludes `apps/website/public/`, so anything placed there is silently never committed. `static/` also holds `.htaccess` (SPA routing, HTTPS redirect, security headers, gzip, cache rules), `manifest.json`, `robots.txt`, `sitemap.xml` and `llms.txt`, all of which the deploy workflow copies into `dist/`. See `DEPLOY.md` for the full push/deploy walkthrough.

## Backend

Reads and writes go directly to Supabase project `aweevhgnbjuxcvnvjeie` (shared with `apps/mobile` and `apps/admin`) using the client SDK — there's no API layer in front of it for the app's own tables:

- **Reads** — `products`, `categories`, `coupons`, `offers`, `combo_packs`, `combo_pack_items`, `faq_items`, `delivery_partners`, `achievements` are public-read and fetched with the anon key.
- **Writes** — `orders`, `order_items`, `profiles`, `support_tickets`, `ticket_messages`, `subscriptions`, `wishlist_items`, `product_reviews`, `payments`, `stock_alerts`, `order_ratings` are user-scoped RLS tables, written through an authenticated Supabase Auth session.
- **Website-only data** (banners, SEO, weight-variant ladders, B2B/franchise leads) lives in separate `igo_*` tables and is never added as a column on an app-owned table.
- Admin-owned data — prices, stock, catalog, coupons, offers, combos — is **read-only** from the website; the Flutter admin (`apps/admin`) is the only writer.

Full rules are in `CLAUDE.md`; the current work-in-progress state is tracked in `PROGRESS.md`.

## Layout
