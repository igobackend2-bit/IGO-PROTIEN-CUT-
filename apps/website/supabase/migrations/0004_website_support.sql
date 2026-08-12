-- ============================================================================
-- IGO Protein Cuts — Website support tables (Website-owned namespace)
--
-- SCOPE RULE: this file creates NEW `igo_*` tables only. It contains no
-- ALTER, DROP or policy change against ANY pre-existing table. The Flutter
-- customer app and the Flutter admin dashboard never read these tables, so
-- running this file cannot affect either of them.
--
-- Run once in the SQL editor:
-- https://supabase.com/dashboard/project/aweevhgnbjuxcvnvjeie/sql/new
--
-- WHY THESE EXIST
-- The website now reads its catalog from the canonical, admin-controlled
-- `products` / `categories` / `coupons` / `offers` / `combo_packs` tables.
-- The three things below are the only website concepts that have no home in
-- the app's schema, and since app tables must not be altered, they live here:
--
--   igo_product_variants  — the weight ladder (500g / 1kg / …). The app sells
--                           one weight per product; the website sells several.
--   igo_product_web_meta  — presentation-only fields (subcategory, bone type,
--                           SEO, extra nutrition) the app has no column for.
--   igo_site_content      — homepage banners / hero / marketing sections.
--   igo_leads             — B2B and franchise enquiry forms.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- igo_product_variants — weight ladder per product
--
-- PRICING MODEL (important):
--   effective price = products.price × price_multiplier
--   …unless price_override is set, in which case price_override wins.
--
-- The multiplier is the default on purpose: `products.price` is owned by the
-- admin dashboard, so an admin price change flows through every weight
-- automatically and the website can never drift from the admin. Use
-- price_override only when a specific weight needs an exact price point that
-- isn't a clean multiple of the base.
--
-- product_id references products.id BY CONVENTION, with no foreign key. A real
-- FK would add a dependency from a website table onto an app table; without it
-- this table can never block an admin delete or interfere with app writes.
-- Rows whose product no longer exists are simply ignored by the website.
-- ---------------------------------------------------------------------------
create table if not exists public.igo_product_variants (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null,
  label            text not null,              -- '500g', '1kg', 'Pack of 6'
  weight_grams     int  not null,
  net_weight_grams int,                        -- edible weight (shell-on seafood)
  price_multiplier numeric not null default 1,
  price_override   numeric,                    -- null => base × multiplier
  servings         text,
  pieces           text,
  display_order    int  not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (product_id, label)
);

create index if not exists igo_product_variants_product_id_idx
  on public.igo_product_variants (product_id);

alter table public.igo_product_variants enable row level security;

drop policy if exists "Product variants are publicly readable"
  on public.igo_product_variants;
create policy "Product variants are publicly readable"
  on public.igo_product_variants for select using (true);


-- ---------------------------------------------------------------------------
-- igo_product_web_meta — website-only presentation fields
--
-- Everything here is cosmetic or SEO. Nothing here affects price, stock or
-- availability — those stay canonical and admin-owned.
-- ---------------------------------------------------------------------------
create table if not exists public.igo_product_web_meta (
  product_id         uuid primary key,
  subcategory        text,
  bone_type          text,     -- Boneless | With Bone | Cleaned & Gutted | Whole
  freshness_grade    text,     -- 100% Antibiotic-Free | Deep Sea Fresh | …
  calories_per_100g  numeric,
  carbs_per_100g     numeric,
  iron_per_100g      numeric,
  prep_time_minutes  int,
  recipe_pairing     text,
  slug               text unique,
  seo_title          text,
  seo_description    text,
  is_best_seller     boolean not null default false,
  is_today_fresh     boolean not null default false,
  is_flash_offer     boolean not null default false,
  updated_at         timestamptz not null default now()
);

alter table public.igo_product_web_meta enable row level security;

drop policy if exists "Product web meta is publicly readable"
  on public.igo_product_web_meta;
create policy "Product web meta is publicly readable"
  on public.igo_product_web_meta for select using (true);


-- ---------------------------------------------------------------------------
-- igo_site_content — homepage banners, hero, marketing sections
--
-- Keyed by a stable string ('home.hero', 'home.trust_badges') so the website
-- can ask for exactly the block it needs. `payload` is jsonb so each content
-- type carries its own shape without needing a migration per block.
-- ---------------------------------------------------------------------------
create table if not exists public.igo_site_content (
  id            uuid primary key default gen_random_uuid(),
  key           text not null unique,
  content_type  text not null,              -- banner | hero | text | json | image
  payload       jsonb not null default '{}'::jsonb,
  is_active     boolean not null default true,
  display_order int not null default 0,
  updated_at    timestamptz not null default now()
);

alter table public.igo_site_content enable row level security;

drop policy if exists "Active site content is publicly readable"
  on public.igo_site_content;
create policy "Active site content is publicly readable"
  on public.igo_site_content for select using (is_active = true);


-- ---------------------------------------------------------------------------
-- igo_leads — B2B / franchise / corporate enquiries
--
-- Insert is open (it's a public contact form). Select is deliberately NOT
-- granted to anon — leads contain personal contact details and must only be
-- readable by an authenticated admin, checked against the app's existing
-- `admin_users` table. That table already carries a self-read policy, and
-- reading it here does not modify it in any way.
-- ---------------------------------------------------------------------------
create table if not exists public.igo_leads (
  id          uuid primary key default gen_random_uuid(),
  lead_type   text not null default 'franchise',   -- franchise | b2b | corporate
  full_name   text,
  email       text,
  phone       text,
  city        text,
  state       text,
  budget      text,
  preferred_location text,
  experience  text,
  message     text,
  status      text not null default 'New',         -- New | In Discussion | Closed
  created_at  timestamptz not null default now()
);

create index if not exists igo_leads_created_at_idx
  on public.igo_leads (created_at desc);

alter table public.igo_leads enable row level security;

drop policy if exists "Anyone can submit a lead" on public.igo_leads;
create policy "Anyone can submit a lead"
  on public.igo_leads for insert with check (true);

drop policy if exists "Admins can read leads" on public.igo_leads;
create policy "Admins can read leads"
  on public.igo_leads for select
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid() and au.is_active = true
    )
  );

drop policy if exists "Admins can update leads" on public.igo_leads;
create policy "Admins can update leads"
  on public.igo_leads for update
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid() and au.is_active = true
    )
  );


-- ---------------------------------------------------------------------------
-- updated_at triggers (reuses the function created by 0002; redefined here
-- with `create or replace` so this file is safe to run standalone)
-- ---------------------------------------------------------------------------
create or replace function public.igo_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists igo_product_variants_set_updated_at on public.igo_product_variants;
create trigger igo_product_variants_set_updated_at
  before update on public.igo_product_variants
  for each row execute function public.igo_set_updated_at();

drop trigger if exists igo_product_web_meta_set_updated_at on public.igo_product_web_meta;
create trigger igo_product_web_meta_set_updated_at
  before update on public.igo_product_web_meta
  for each row execute function public.igo_set_updated_at();

drop trigger if exists igo_site_content_set_updated_at on public.igo_site_content;
create trigger igo_site_content_set_updated_at
  before update on public.igo_site_content
  for each row execute function public.igo_set_updated_at();
