# IGO Protein Cuts — Hostinger Deployment Guide

## Step 1: Build the Project

```bash
# In your project folder:
npm install
npm run build
# Output: /dist folder
```

## Step 2: Upload to Hostinger

1. Login to https://hpanel.hostinger.com
2. Go to: **Websites → Add Website → Static Website** (or use existing hosting)
3. Open **File Manager** → navigate to `public_html`
4. Upload ALL contents of your local `/dist` folder into `public_html`
   - ⚠️ Upload the CONTENTS (not the dist folder itself)
5. The `.htaccess` file (already inside `/public`) will be included in the build — it fixes SPA routing

## Step 3: Connect Your Domain

1. In hPanel → **Domains** → Add/connect your domain
2. Recommended domain: `igoproteincuts.in` or `igoproteincuts.com`
3. If domain is from GoDaddy/Namecheap: update nameservers to:
   - `ns1.dns-parking.com`
   - `ns2.dns-parking.com`
4. In hPanel → **SSL** → Install Free SSL (Let's Encrypt)
5. Enable **Force HTTPS** redirect

## Step 4: Environment Variables

Before running `npm run build`, create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GEMINI_API_KEY=your-gemini-key-here
```

⚠️ **Never commit `.env` to Git!** It's already in `.gitignore`.

## Step 5: Verify the Deployment

- [ ] Home page loads at your domain
- [ ] Refreshing `/blog` works (not 404) — .htaccess is working
- [ ] HTTPS is active (green padlock in browser)
- [ ] Footer shows with content (not blank)
- [ ] BrandNarrative section appears before Newsletter

## SPA Routing Fix (Apache / Hostinger)

The `public/.htaccess` file handles this automatically. Contents:

```
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

## Recommended Hostinger Plan

| Item | Recommendation | Cost |
|------|---------------|------|
| Hosting | Business Web Hosting | ₹249/month |
| Domain | igoproteincuts.in | ₹599/year |
| SSL | Free (Let's Encrypt) | Included |
| Email | support@igoproteincuts.in | Included |

## Keep Vercel as Staging

- Vercel: auto-deploys on Git push → use as staging/preview
- Hostinger: production site with your custom domain

## Next Steps After Deployment

1. Submit sitemap to Google Search Console: https://search.google.com/search-console
2. Verify domain ownership in GSC
3. Add Google Analytics 4 tag
4. Set up Razorpay account and integrate payment
5. Enable Supabase for real product/order storage
