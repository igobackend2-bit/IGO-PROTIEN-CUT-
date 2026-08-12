-- ============================================================================
-- Phase 18c — Clear external product image links
--
-- One-off data cleanup, not a schema change: every product's `image_url`
-- (and gallery `image_urls`) is reset to empty so nothing in the app is
-- displaying an externally-hosted website image anymore. The customer app
-- already has a real, designed empty state for this — ProductGridCard
-- renders a bag-icon placeholder whenever `imageUrl.isEmpty` (see
-- lib/shared/widgets/product_grid_card.dart) — so this doesn't introduce a
-- broken-image state, it puts every product into the same honest
-- "no photo yet" placeholder until a real one is uploaded to the new
-- `product-images` Storage bucket (phase18b) and set via admin-products.
-- ============================================================================

update public.products
set image_url = '',
    image_urls = array[]::text[];
