-- ============================================================================
-- Phase 18b — Product image storage
--
-- Real Supabase Storage bucket for product photos, so `products.image_url`
-- / `image_urls` can point at images the store actually owns instead of
-- external website links. Upload itself happens the same way every other
-- upload in this app already works (avatars, review photos, support
-- attachments) — direct client → Storage call, gated by RLS — rather than
-- routing binary data through an Edge Function. What's new here is that
-- the write policy is tied directly to the Phase 18 RBAC system via
-- `admin_has_permission`, not a per-user folder convention, since this is
-- admin-owned catalog content, not a customer's own upload.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Product images are publicly readable" on storage.objects;
create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.admin_has_permission(auth.uid(), 'products.manage'));

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.admin_has_permission(auth.uid(), 'products.manage'));

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.admin_has_permission(auth.uid(), 'products.manage'));
