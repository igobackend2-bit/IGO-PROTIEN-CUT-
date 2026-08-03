import { supabase, isSupabaseConfigured } from '../supabase';
import { getCurrentUser } from './auth';

/**
 * ORDER / DELIVERY FEEDBACK — the "how was your delivery" half of the
 * post-order feedback form. Product-quality feedback goes through the
 * existing `submitReview()` in reviews.ts (per-product, shows on the PDP
 * once an admin approves it); this file is the separate delivery-experience
 * half, stored in the website-owned `igo_order_feedback` table (see
 * 0018_order_feedback.sql — brand-new table, no changes to any app table).
 */

export interface SubmitOrderFeedbackResult {
  ok: boolean;
  error?: string;
}

export async function submitOrderFeedback(
  orderId: string,
  deliveryRating: number,
  comment: string
): Promise<SubmitOrderFeedbackResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Feedback is unavailable right now. Please try again shortly.' };
  }
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: 'Please sign in to leave feedback.' };
  }
  const { error } = await supabase.from('igo_order_feedback').insert({
    order_id: orderId,
    user_id: user.id,
    delivery_rating: deliveryRating,
    comment: comment.trim() || null
  });
  if (error) {
    // Unique constraint on (order_id, user_id) — already submitted before.
    if (error.message.toLowerCase().includes('duplicate') || error.code === '23505') {
      return { ok: false, error: "You've already sent feedback for this order — thank you!" };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export interface MyOrderFeedback {
  id: string;
  deliveryRating: number;
  comment: string;
}

/** Used to hide the "Rate Your Order" prompt once already submitted. */
export async function fetchMyOrderFeedback(orderId: string): Promise<MyOrderFeedback | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('igo_order_feedback')
    .select('id, delivery_rating, comment')
    .eq('order_id', orderId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as { id: string; delivery_rating: number; comment: string | null };
  return { id: row.id, deliveryRating: row.delivery_rating, comment: row.comment ?? '' };
}
