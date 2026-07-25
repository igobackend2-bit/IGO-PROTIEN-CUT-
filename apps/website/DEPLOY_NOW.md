# 🚀 Deploy to GitHub + Hostinger — Run These Steps Once

All code changes are saved locally. You just need to run the commands below.

---

## Step 1 — Push to GitHub (run in your project folder terminal)

Open terminal in `D:\Igo-websites\Igo-Protein Cuts\` and run:

```bash
git add -A
git commit -m "SEO: all-India keywords, fix canonical, sitemap, manifest, security headers, GitHub Actions deploy"
git push neworigin main
```

If that gives an error, try:
```bash
git push origin main
```

---

## Step 2 — Add Secrets to GitHub (for auto-deploy to work)

Go to: **https://github.com/igobackend2-bit/IGO-PROTIEN-CUT-/settings/secrets/actions**

Click **New repository secret** and add these 5 secrets:

| Secret Name | Value | Where to get it |
|---|---|---|
| `FTP_HOST` | e.g. `ftp.igoproteincuts.com` or Hostinger FTP hostname | Hostinger → Hosting → FTP Accounts |
| `FTP_USERNAME` | Your FTP username | Hostinger → Hosting → FTP Accounts |
| `FTP_PASSWORD` | Your FTP password | Hostinger → Hosting → FTP Accounts |
| `VITE_SUPABASE_URL` | `https://rwasfuhrvqscqnpwqooq.supabase.co` | Already in your .env |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Already in your .env |

### Where to find Hostinger FTP credentials:
1. Login to **hpanel.hostinger.com**
2. Go to **Hosting → Manage**
3. Click **FTP Accounts** in the left menu
4. Your FTP host is usually `ftp.yourdomain.com`

---

## Step 3 — Trigger First Deploy

After adding secrets, every `git push` to `main` will **automatically build and deploy** to Hostinger.

To trigger immediately:
```bash
git commit --allow-empty -m "trigger deploy"
git push neworigin main
```

Or go to: **GitHub repo → Actions tab → Run workflow manually**

---

## Step 4 — Verify Live Site

After deploy completes (~3–5 minutes), check:
- https://igoproteincuts.com/ — should show new title with "India"
- https://igoproteincuts.com/sitemap.xml — should show valid XML
- https://igoproteincuts.com/manifest.json — should return JSON (not HTML)

---

## What Was Changed & Deployed

| File | Change |
|---|---|
| `public_html/index.html` | Fixed canonical, og:url, 47 India keywords, 5 structured data blocks |
| `public_html/sitemap.xml` | Fixed (was corrupted null bytes) |
| `public_html/manifest.json` | Added (was missing, causing 404) |
| `public_html/.htaccess` | HSTS, security headers, gzip, cache headers |
| `src/pages/Checkout.tsx` | Added per-page SEO meta |
| `api/send-email.ts` | Fixed copyright year 2024 → 2026 |
| `vercel.json` | Fixed outputDirectory: public → dist |
| `.github/workflows/deploy.yml` | NEW: auto-build + FTP deploy on every push |
