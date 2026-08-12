# Pushing to GitHub & deploying

## First, the thing that surprised me

**Your live site is on Hostinger, not Vercel.**

`.github/workflows/deploy.yml` in your monorepo runs on every push to `main`
that touches `apps/website/**`. It builds with Vite and FTPs `dist/` to
`148.135.140.223`. That's what serves `igoproteincuts.com`.

That matters because Hostinger serves **static files only** — no Node, no
serverless functions. Anything under `/api/` returns 404 there.

## Your repo is a monorepo

```
IGO-PROTIEN-CUT-/
├── apps/admin      ← Flutter admin dashboard   DO NOT TOUCH
├── apps/mobile     ← Flutter customer app      DO NOT TOUCH
├── apps/website    ← replace this one
├── supabase/       ← 15 Edge Functions          DO NOT TOUCH
└── .github/workflows/deploy.yml
```

A plain `git init` + push from this folder would have replaced the whole repo
and deleted the app, the admin and every Edge Function. Follow the steps below
instead.

---

## What I fixed so the swap won't break your deploy

**`static/`** — the workflow does `cp static/.htaccess dist/.htaccess` at step 6.
This project had no `static/` folder, so the build would have failed and your
site would have silently stayed on the old version. Created it with the
`.htaccess` from your existing site (SPA routing, HTTPS redirect, security
headers, gzip, cache rules) plus `manifest.json`, `robots.txt`, `sitemap.xml`
and `llms.txt`.

Without `.htaccess`, refreshing on `/offers` or `/cart` would 404 on Apache.

**`src/lib/aiSearchFallback.ts`** — AI Search called `/api/ai-search`, which
doesn't exist on static hosting, so it showed "Failed to connect to AI server".
It now tries the endpoint first and falls back to ranking your real catalog by
keyword, protein content, bone type and prep time. Real products, real prices,
and it doesn't claim to be AI.

**`vercel.json` + `api/ai-search.ts`** — kept, harmless on Hostinger. If you
ever move to Vercel, they make it work there with a real Gemini call.

---

## Push it — copy/paste

### 1. Clone the monorepo somewhere new

```
cd /d D:\Igo-websites
git clone https://github.com/igobackend2-bit/IGO-PROTIEN-CUT-.git igo-monorepo
cd igo-monorepo
```

### 2. Tag the current state so this is reversible

```
git tag backup-before-website-swap
git push origin backup-before-website-swap
```

If anything goes wrong: `git reset --hard backup-before-website-swap`.

### 3. Remove the old website

```
git rm -r --quiet apps/website
```

### 4. Copy the new one in

```
robocopy "D:\Igo-websites\Protein cuts website" "apps\website" /E /XD node_modules dist .git /XF .env
```

`robocopy` exits with code 1 on success — that's normal, not an error.

**Confirm `.env` did not come along:**

```
dir apps\website\.env
```

Should say *File Not Found*. If it exists, delete it before committing — it
holds your `SUPABASE_SERVICE_ROLE_KEY`.

### 5. Review before committing

```
git add apps/website
git status
```

Check that **only `apps/website/...` paths** are listed. If you see
`apps/mobile`, `apps/admin` or `supabase/`, stop and tell me.

### 6. Commit and push

```
git commit -m "Replace website with Supabase-connected build (catalog, auth, orders)"
git push origin main
```

---

## 7. GitHub Secrets — check these exist

Repo → **Settings → Secrets and variables → Actions**. The workflow writes
`.env` from these at build time:

| Secret | Needed? |
|---|---|
| `VITE_SUPABASE_URL` | **Yes** — without it the site falls back to demo data |
| `VITE_SUPABASE_ANON_KEY` | **Yes** — same |
| `VITE_RAZORPAY_KEY_ID` | Only if taking live payments |
| `VITE_GEMINI_API_KEY` | Not used by this build |
| `FTP_USERNAME` / `FTP_PASSWORD` | **Yes** — already set, that's how it deploys |

`VITE_CATALOG_SOURCE` isn't in the workflow, which is fine — the code defaults
to `supabase`. Add it as `local` only if you need an emergency rollback to the
bundled demo catalog.

**If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are missing, the site
will build and load perfectly and quietly show the 83 demo products with no
login and no orders.** No error — just not connected. This is the one failure
mode to watch for.

---

## 8. Watch the deploy

Repo → **Actions** tab. "Build & Deploy to Hostinger" should run for 2–3
minutes and go green. If it fails at "Copy static SEO files", the `static/`
folder didn't make it — re-check step 4.

## 9. Verify the live site

1. Open `https://igoproteincuts.com`, then DevTools console (**F12**)
2. **No `[supabase] ... not set` warning** → connected
3. Products match your admin — change a price in the admin, hard-refresh, confirm
4. Navigate to `/offers`, then **hard-refresh**. It should load, not 404 — that's `.htaccess` working
5. Sign in, place a test order, confirm it appears in the Flutter admin
6. Try AI Search — should return products, not a connection error

---

## Supabase Auth redirect URLs

Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://igoproteincuts.com`
- **Redirect URLs:** `https://igoproteincuts.com/**`

Skip this and password-reset emails send people to `localhost`.

---

## Known caveats

**`server.ts` is dev-only.** It runs `npm run dev` locally. It is not deployed
and nothing calls its `/api/auth/*` routes any more — auth is Supabase Auth.

**Product images depend on `igoproteincuts.com`.** The 44 products added by
migration 0006 point at absolute URLs on that domain. Moving the domain breaks
them in the mobile app; re-run `0007_fix_website_image_urls.sql` with the new
host, or upload photos through the Flutter admin so they live in Supabase
Storage.

**Two `supabase/migrations` folders exist** after the swap — the monorepo root
one (app + Edge Functions) and `apps/website/supabase/migrations` (mine,
0002–0008). They don't conflict; mine are all `igo_*` plus the two product
scripts you already ran. Worth consolidating eventually.

**No `channel` column on orders.** Website orders look identical to app orders
in the admin. The `igo_orders` shadow row keeps the link if you want to split
them later.
