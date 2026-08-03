-- ============================================================================
-- IGO Protein Cuts — Review moderation RLS policies on product_reviews
--
-- WHY
-- The website's /admin → Reviews tab (Approve / Reject / Delete) and the
-- product page's "delete my review" button were both built against
-- `product_reviews` assuming RLS would allow them — but that table's row-level
-- security lives in the app repo, not this one, and no policy there currently
-- lets an admin moderate someone else's review or lets a customer remove
-- their own. Without this, every Approve/Reject/Delete/Delete-mine action
-- silently matches zero rows (Postgres RLS returns `error: null` on a
-- zero-row update/delete, not a visible failure) — see
-- src/lib/api/websiteAdmin.ts's mutateReviewRow() for the client-side
-- workaround that detects this and reports an honest error instead of a
-- false "success".
--
-- SCOPE — READ THIS BEFORE RUNNING
-- `product_reviews` is a table owned by the Flutter app/admin, NOT one of
-- this website's own `igo_*` tables — see CLAUDE.md's scope rules. This
-- migration is intentionally the smallest possible touch on it:
--
--   • NO new column, NO ALTER TABLE. `is_hidden` already exists on this
--     table (the app/admin created it) and the website already reads/writes
--     it (catalog.ts filters `.eq('is_hidden', false)`, reviews.ts sets
--     `is_hidden: true` on insert) — nothing here changes that.
--   • NO change to the existing SELECT policy, whatever it is. Only ADDS two
--     new policies (UPDATE/DELETE for admins, DELETE for a customer's own
--     row). RLS policies are permissive and OR together, so this can only
--     GRANT new capability — it cannot remove or restrict anything the
--     Flutter app currently relies on.
--   • Reuses `public.igo_is_active_admin()`, the exact same admin-check
--     function already created in 0008_website_admin_policies.sql for the
--     website's own igo_* tables — one definition of "is an admin" everywhere,
--     not a second one invented here.
--
-- If you'd rather the app team own this instead, do not run this file —
-- everything else on the website already degrades safely without it (reviews
-- just stay pending forever with an honest error shown to the admin/customer
-- instead of a silent no-op).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Admins can approve (is_hidden -> false), reject (is_hidden stays true /
-- gets re-hidden), and delete any review.
-- ---------------------------------------------------------------------------
drop policy if exists "Admins moderate reviews" on public.product_reviews;
create policy "Admins moderate reviews"
  on public.product_reviews for update
  using (public.igo_is_active_admin())
  with check (public.igo_is_active_admin());

drop policy if exists "Admins delete reviews" on public.product_reviews;
create policy "Admins delete reviews"
  on public.product_reviews for delete
  using (public.igo_is_active_admin());

-- ---------------------------------------------------------------------------
-- A signed-in customer can delete their OWN review (and only their own —
-- `user_id = auth.uid()` scopes it, same as every other customer-owned row
-- in this project).
-- ---------------------------------------------------------------------------
drop policy if exists "Customers delete own review" on public.product_reviews;
create policy "Customers delete own review"
  on public.product_reviews for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- VERIFY
-- ============================================================================
-- Confirm the three new policies exist alongside whatever already was there:
--   select policyname, cmd, roles
--   from pg_policies
--   where schemaname = 'public' and tablename = 'product_reviews'
--   order by policyname;
--
-- Confirm the column this all depends on is really already there (should
-- already return a row — this migration does not create it):
--   select column_name, data_type, column_default
--   from information_schema.columns
--   where table_schema = 'public' and table_name = 'product_reviews'
--     and column_name = 'is_hidden';
-- ============================================================================
