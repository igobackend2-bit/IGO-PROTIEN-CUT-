import { supabase, isSupabaseConfigured } from '../supabase';
import { getCurrentUser } from './auth';

/**
 * PRODUCT REVIEWS — written to the CANONICAL `product_reviews` table using
 * the signed-in customer's own session, the same path the Flutter app takes.
 *
 * Before this file existed, the "Write a Verified Review" form on the
 * product page (`ProductDetailPage.tsx`) only ever called `setReviewsList`
 * on local React state — nothing was sent to Supabase, so a submitted
 * review vanished on refresh and never reached the admin or the app.
 *
 * `product_reviews` already carries an `enforce_verified_purchase_review`
 * trigger (see the comment in `fetchProduct` below / `catalog.ts`), so the
 * database itself rejects a review from someone who hasn't actually bought
 * the product — this file doesn't need to re-implement that check, only
 * surface the resulting error in a readable way.
 */

export interface SubmitReviewResult {
  ok: boolean;
  error?: string;
}

export async function submitReview(
  productId: string,
  rating: number,
  comment: string
): Promise<SubmitReviewResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Reviews are unavailable right now. Please try again shortly.' };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: 'Please sign in from the menu above to write a review.' };
  }

  const { error } = await supabase.from('product_reviews').insert({
    product_id: productId,
    user_id: user.id,
    rating,
    comment: comment.trim(),
    // New reviews start hidden and wait for an admin to approve them in
    // /admin → Reviews. Public listings and rating averages already filter
    // on `is_hidden = false` (catalog.ts), so this is the only change needed
    // to make every review go through moderation instead of appearing
    // instantly — no schema change, `is_hidden` already existed and was
    // already being read, just never set explicitly on write before.
    is_hidden: true
  });

  if (error) {
    // The verified-purchase trigger raises a Postgres error rather than
    // silently rejecting — surface it as a plain-English message instead of
    // the raw database text.
    const message = error.message.toLowerCase();
    if (message.includes('verifi') || message.includes('purchase')) {
      return {
        ok: false,
        error: "You can review this product once you've received an order that includes it."
      };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export interface MyReview {
  id: string;
  rating: number;
  comment: string;
  isHidden: boolean;
}

/**
 * The signed-in customer's own review for this product, regardless of
 * approval state — used to keep the "Write a Verified Review" form from
 * being shown a second time once they've already submitted one, and to tell
 * them whether it's still awaiting admin approval or already live.
 */
export async function fetchMyReview(productId: string): Promise<MyReview | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('product_reviews')
    .select('id, rating, comment, is_hidden')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as { id: string; rating: number; comment: string | null; is_hidden: boolean };
  return { id: row.id, rating: row.rating, comment: row.comment ?? '', isHidden: row.is_hidden };
}

/**
 * Lets a customer take down their own review. Scoped to `user_id = auth.uid()`
 * on the client side; the actual guarantee still comes from `product_reviews`'
 * own RLS policy (this table is owned by the app, not this repo).
 *
 * A delete blocked by RLS matches zero rows and comes back with `error: null`
 * — Postgres never sees a row to complain about, so a naive `if (error)`
 * check would report success while nothing was actually deleted. Asking for
 * the deleted row back via `.select()` and checking it's non-empty is what
 * catches that.
 */
export async function deleteMyReview(reviewId: string): Promise<SubmitReviewResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Reviews are unavailable right now. Please try again shortly.' };
  }
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: 'Please sign in from the menu above.' };
  }
  const { data, error } = await supabase
    .from('product_reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .select('id');
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return { ok: false, error: 'Could not delete your review. Please try again or contact support.' };
  }
  return { ok: true };
}
