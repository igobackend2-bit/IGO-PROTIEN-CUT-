import { supabase, isSupabaseConfigured } from '../supabase';
import { getCurrentUser } from './auth';

/**
 * WISHLIST — synced to the CANONICAL `wishlist_items` table, using the
 * signed-in customer's own session (`auth.uid() = user_id` RLS), the same
 * table the Flutter app reads/writes.
 *
 * Before this file existed, `StoreService.toggleWishlist` in `storage.ts`
 * only ever touched `localStorage` — a customer's wishlist didn't survive
 * clearing site data and never appeared in the app on another device.
 *
 * This module is deliberately just three small functions rather than a
 * class; `storage.ts` still owns the localStorage cache (per CLAUDE.md rule
 * #4: localStorage is a cache, never the source of truth) and calls these
 * as a best-effort background sync, so nothing here has to change how the
 * ~7 existing call sites (`BrowseProductCard`, `ProductCard`, `ProductModal`,
 * `ComboCardsGrid`, `WishlistPage`, `Navbar`, `ProductDetailPage`) already
 * call `StoreService.getWishlist()` / `toggleWishlist()`.
 */

/** The signed-in customer's wishlisted product ids, or null if not signed in / unreachable. */
export async function fetchWishlistIds(): Promise<string[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase.from('wishlist_items').select('product_id').eq('user_id', user.id);

  if (error) {
    console.error('[wishlist] fetch failed:', error.message);
    return null;
  }
  return (data ?? []).map((row) => String((row as { product_id: unknown }).product_id));
}

/** Fire-and-forget add; safe to call even when signed out (silently no-ops). */
export async function addWishlistItemRemote(productId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const user = await getCurrentUser();
  if (!user) return;

  const { error } = await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: productId });
  // A duplicate-key error just means it's already wishlisted server-side —
  // treat that as success rather than logging it as a failure. Avoids
  // depending on a specific named unique-constraint via upsert's onConflict,
  // which this file can't verify exists without direct database access.
  if (error && error.code !== '23505') console.error('[wishlist] add failed:', error.message);
}

/** Fire-and-forget remove; safe to call even when signed out (silently no-ops). */
export async function removeWishlistItemRemote(productId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const user = await getCurrentUser();
  if (!user) return;

  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);
  if (error) console.error('[wishlist] remove failed:', error.message);
}
