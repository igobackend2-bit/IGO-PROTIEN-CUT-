-- ============================================================================
-- IGO Protein Cuts — Admin write policies for the website-owned tables
--
-- WHY
-- 0004 created igo_product_variants, igo_product_web_meta and igo_site_content
-- with public SELECT only. That's correct for shoppers, but it means the
-- website's own /admin page cannot save anything — every write silently fails
-- the RLS check.
--
-- WHAT THIS ADDS
-- INSERT / UPDATE / DELETE for authenticated users who hold an active row in
-- the app's `admin_users` table. That is the same membership the Flutter admin
-- dashboard checks at login, so there is exactly one definition of "is an
-- admin" across all three surfaces.
--
-- SCOPE
-- Policies are created ONLY on igo_* tables. `admin_users` is read inside the
-- policy expressions and is never modified. No app table is altered.
--
-- NOTE ON PERMISSIONS
-- This is a coarse "is an active admin" check rather than a per-permission one
-- (products.manage, content.manage…). Fine-grained checks live in the Edge
-- Functions via admin_has_permission(), and adding a permission argument here
-- would mean duplicating that logic in RLS. Anyone with an admin account can
-- edit website content; operational data stays gated by the Edge Functions.
-- ============================================================================

-- Reusable predicate. `security definer` so it can read admin_users regardless
-- of the caller's own visibility into that table.
create or replace function public.igo_is_active_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admin_users au
    where au.user_id = auth.uid() and au.is_active = true
  );
$$;


-- ---------------------------------------------------------------------------
-- igo_product_variants — weight ladders
-- ---------------------------------------------------------------------------
drop policy if exists "Admins manage variants" on public.igo_product_variants;
create policy "Admins manage variants"
  on public.igo_product_variants for all
  using (public.igo_is_active_admin())
  with check (public.igo_is_active_admin());


-- ---------------------------------------------------------------------------
-- igo_product_web_meta — SEO and presentation fields
-- ---------------------------------------------------------------------------
drop policy if exists "Admins manage web meta" on public.igo_product_web_meta;
create policy "Admins manage web meta"
  on public.igo_product_web_meta for all
  using (public.igo_is_active_admin())
  with check (public.igo_is_active_admin());


-- ---------------------------------------------------------------------------
-- igo_site_content — homepage banners and marketing blocks
--
-- The existing public policy only exposes rows where is_active = true, so an
-- admin also needs to be able to SEE inactive drafts. `for all` covers that.
-- ---------------------------------------------------------------------------
drop policy if exists "Admins manage site content" on public.igo_site_content;
create policy "Admins manage site content"
  on public.igo_site_content for all
  using (public.igo_is_active_admin())
  with check (public.igo_is_active_admin());


-- ---------------------------------------------------------------------------
-- igo_leads — already had admin SELECT and UPDATE from 0004; add DELETE so
-- spam submissions can be cleared.
-- ---------------------------------------------------------------------------
drop policy if exists "Admins can delete leads" on public.igo_leads;
create policy "Admins can delete leads"
  on public.igo_leads for delete
  using (public.igo_is_active_admin());


-- ============================================================================
-- VERIFY
-- ============================================================================
-- Confirm the policies exist:
--   select tablename, policyname, cmd
--   from pg_policies
--   where schemaname = 'public' and tablename like 'igo_%'
--   order by tablename, policyname;
--
-- Confirm YOUR account is recognised as an admin (run while signed in as
-- yourself via the API, not the SQL editor — in the SQL editor auth.uid() is
-- null, so this correctly returns false):
--   select public.igo_is_active_admin();
-- ============================================================================
