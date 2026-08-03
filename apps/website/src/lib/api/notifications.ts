import { supabase, isSupabaseConfigured } from '../supabase';
import { AppNotification } from '../../types';

/**
 * NOTIFICATIONS — reads/updates the CANONICAL `notifications` table (see
 * supabase/migrations/phase11_notifications.sql in the app repo), using the
 * signed-in customer's own session.
 *
 * Rows are only ever INSERTed by SECURITY DEFINER triggers on `orders` (order
 * placed / status changed) and `products` (wishlisted item back in stock) —
 * there is no INSERT policy for regular users, so the website only ever
 * reads and marks-as-read here, it never creates notifications itself.
 * Coupon/offer/flash-sale/referral/general-announcement types have no real
 * generating event yet (no admin tool writes them), so the list will simply
 * be empty of those types until a real source starts inserting rows — this
 * mirrors the Flutter app's notification_repository_impl.dart exactly.
 *
 * Before this file existed, the bell icon (Navbar.tsx) and the notification
 * center (NotificationCenterModal.tsx) both read from the legacy 100%-local
 * `SupabaseService.getNotifications()` in supabaseClient.ts — real order and
 * restock notifications were silently piling up in the database with
 * nothing on the site ever showing them to the customer.
 */

const DB_TYPE_TO_UI: Record<string, AppNotification['type']> = {
  order_update: 'order',
  delivery_update: 'delivery',
  wishlist_stock_alert: 'order',
  offer: 'coupon',
  coupon: 'coupon',
  flash_sale: 'flash_sale',
  referral_reward: 'referral',
  general_announcement: 'support'
};

function mapRow(row: Record<string, any>): AppNotification {
  const data = row.data ?? {};
  let deepLink: string | undefined;
  // Order/delivery notifications ("Order Ready", "Delivery Partner Assigned",
  // etc.) now open that specific order's live tracking page — the real
  // /tracking/<orderId> route already wired up in App.tsx for exactly this —
  // instead of dumping the customer on the generic Orders tab where they'd
  // have to hunt for the right order themselves.
  if (data.order_id) deepLink = `/tracking/${encodeURIComponent(data.order_id)}`;
  else if (data.product_id) deepLink = `/product/${data.product_id}`;
  else if (data.subscription_id) deepLink = '/account?tab=subscriptions';

  return {
    id: String(row.id),
    title: row.title,
    message: row.message,
    type: DB_TYPE_TO_UI[row.type] ?? 'support',
    createdAt: row.created_at,
    isRead: Boolean(row.is_read),
    deepLink
  };
}

/** The signed-in customer's own notifications, newest first. RLS restricts this to their rows. */
export async function fetchNotifications(): Promise<AppNotification[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, data, is_read, created_at')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[notifications] fetch failed:', error.message);
    return [];
  }
  return (data ?? []).map(mapRow);
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', userData.user.id);
}

export async function markAllNotificationsRead(): Promise<void> {
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userData.user.id)
    .eq('is_read', false);
}
