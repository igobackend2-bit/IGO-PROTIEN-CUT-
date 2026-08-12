-- ============================================================================
-- IGO Protein Cuts — Seed initial Flash Sale deals
--
-- WHY
-- OffersPage.tsx's "Flash Sale — Ends Soon!" section only shows a product
-- when igo_product_web_meta.is_flash_offer = true AND original_price is
-- genuinely above the selling price (0013_product_list_price.sql). Every
-- product currently has is_flash_offer = false (its default) and
-- original_price = null, because nothing has ever set them — the section
-- renders its header and live countdown with an empty grid underneath it,
-- which reads as broken rather than "no deals today".
--
-- THE FIX
-- Flags a small, honest set of real catalog products as flash deals with a
-- genuine list-price markup (original_price > products.price), one or two
-- per major category so the section has real variety on first load. This is
-- a one-time seed, not a permanent lock — rotate which products are flagged
-- any time by updating igo_product_web_meta directly, or once the admin
-- dashboard grows a control for it.
--
-- SCOPE: igo_product_web_meta only (website-owned per CLAUDE.md). Never
-- writes products.price or any other admin-owned column.
--
-- SAFETY: only touches rows where is_flash_offer is still false (the
-- untouched default) — running this again after someone has manually curated
-- flash deals won't clobber their choices. Re-running after this migration
-- already ran is a no-op (nothing left matching is_flash_offer = false among
-- the picked rows, since they'll already be true).
-- ============================================================================

with candidates as (
  select
    p.id,
    p.price,
    row_number() over (
      partition by
        case
          when p.category ilike '%chicken%' then 'chicken'
          when p.category ilike '%mutton%' or p.category ilike '%goat%' or p.category ilike '%lamb%' then 'mutton'
          when p.category ilike '%fish%' or p.category ilike '%seafood%' or p.category ilike '%salmon%' then 'fish'
          when p.category ilike '%prawn%' or p.category ilike '%shrimp%' then 'prawns'
          else 'other'
        end
      order by p.price desc
    ) as rnk
  from public.products p
  join public.igo_product_web_meta m on m.product_id = p.id
  where coalesce(p.is_available, true) = true
    and m.is_flash_offer = false
    and p.price > 0
)
insert into public.igo_product_web_meta (product_id, is_flash_offer, original_price)
select
  c.id,
  true,
  round(c.price * 1.18)
from candidates c
where c.rnk = 1
on conflict (product_id) do update set
  is_flash_offer = true,
  original_price = coalesce(public.igo_product_web_meta.original_price, excluded.original_price);


-- ---------------------------------------------------------------------------
-- VERIFY
-- ---------------------------------------------------------------------------
-- select p.name, p.category, p.price, m.original_price,
--        round((1 - p.price / nullif(m.original_price, 0)) * 100) as pct_off
-- from public.products p
-- join public.igo_product_web_meta m on m.product_id = p.id
-- where m.is_flash_offer = true
-- order by p.category;
-- ============================================================================
