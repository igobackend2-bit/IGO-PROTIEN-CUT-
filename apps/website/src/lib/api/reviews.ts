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
    comment: comment.trim()
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
