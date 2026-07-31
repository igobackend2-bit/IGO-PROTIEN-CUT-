import { supabase, isSupabaseConfigured } from '../supabase';
import { ensureAddress } from './orders';
import { SavedAddress } from '../../types';

/**
 * SUBSCRIPTIONS — written to and read from the CANONICAL `subscriptions` /
 * `subscription_history` / `notifications` tables, using the signed-in
 * customer's own session. Mirrors lib/services/subscription_service.dart in
 * the Flutter app exactly (same column names, same 'active'/'paused'/
 * 'cancelled' status strings, same history/notification side-writes), so a
 * subscription created here shows up in the app and vice versa.
 *
 * Before this file existed, the account page's "Subscriptions" tab
 * (`SupabaseService.getSubscriptions` in the legacy `supabaseClient.ts`) was
 * pure localStorage with a hard-coded fake sample row — nothing was ever
 * sent to Supabase, and Pause/Resume only flipped a local flag.
 */

export type ScheduleType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface RemoteSubscription {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  addressId: string | null;
  quantity: number;
  variantId: string | null;
  scheduleType: ScheduleType;
  weekdays: number[] | null;
  interval: number;
  nextDelivery: string; // yyyy-MM-dd
  deliverySlot: string | null;
  paymentMethod: string | null;
  status: SubscriptionStatus;
  createdAt: string;
  pricePerDelivery: number;
}

const RICH_SELECT = `
  id, product_id, address_id, quantity, variant_id, schedule_type, weekdays,
  interval, next_delivery, delivery_slot, payment_method, status, created_at,
  products ( name, image_url, price )
`;

function mapRow(row: Record<string, any>): RemoteSubscription {
  const product = row.products ?? {};
  return {
    id: String(row.id),
    productId: row.product_id ? String(row.product_id) : '',
    productName: product.name ?? 'Subscription Item',
    productImage: product.image_url ?? null,
    addressId: row.address_id ? String(row.address_id) : null,
    quantity: Number(row.quantity ?? 1),
    variantId: row.variant_id ? String(row.variant_id) : null,
    scheduleType: (row.schedule_type as ScheduleType) ?? 'weekly',
    weekdays: Array.isArray(row.weekdays) ? row.weekdays.map((n: any) => Number(n)) : null,
    interval: Number(row.interval ?? 1),
    nextDelivery: row.next_delivery ?? '',
    deliverySlot: row.delivery_slot ?? null,
    paymentMethod: row.payment_method ?? null,
    status: (row.status as SubscriptionStatus) ?? 'active',
    createdAt: row.created_at ?? '',
    pricePerDelivery: Number(product.price ?? 0) * Number(row.quantity ?? 1)
  };
}

/** yyyy-MM-dd for a Date, matching the app's `_dateString()` (Postgres `date` columns). */
function dateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** The signed-in customer's own subscriptions. RLS restricts this to their rows. */
export async function fetchMySubscriptions(): Promise<RemoteSubscription[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from('subscriptions')
    .select(RICH_SELECT)
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[subscriptions] fetch failed:', error.message);
    return null;
  }
  return (data ?? []).map(mapRow);
}

async function logHistory(subscriptionId: string, action: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('subscription_history').insert({ subscription_id: subscriptionId, action });
  } catch {
    // Non-fatal — the subscription state change itself already succeeded.
  }
}

async function notify(userId: string, title: string, message: string, subscriptionId: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'subscription',
      title,
      message,
      data: { subscription_id: subscriptionId }
    });
  } catch {
    // Non-fatal — the underlying subscription action already succeeded.
  }
}

export interface CreateSubscriptionInput {
  productId: string;
  quantity: number;
  address: SavedAddress;
  scheduleType: ScheduleType;
  weekdays?: number[]; // 1=Mon..7=Sun, only for 'custom'
  interval: number;
  startDate: Date;
  deliverySlot?: string;
  paymentMethod: string;
}

export interface SubscriptionResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/** Creates one subscription row for one product. */
export async function createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Backend not configured.' };
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false, error: 'Please sign in to subscribe.' };

  // Persist the delivery address first, same pattern as regular Checkout —
  // `subscriptions.address_id` is a FK, so it must exist before the insert.
  const addressResult = await ensureAddress(user.id, input.address);
  if (!addressResult.id) {
    return { ok: false, error: addressResult.error ?? 'Could not save the delivery address.' };
  }

  const { data: row, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      product_id: input.productId,
      address_id: addressResult.id,
      quantity: input.quantity,
      schedule_type: input.scheduleType,
      weekdays: input.weekdays ?? null,
      interval: input.interval,
      next_delivery: dateString(input.startDate),
      delivery_slot: input.deliverySlot ?? null,
      payment_method: input.paymentMethod,
      status: 'active'
    })
    .select('id')
    .single();

  if (error || !row) {
    console.error('[subscriptions] create failed:', error?.message);
    return { ok: false, error: error?.message ?? 'Could not create the subscription.' };
  }

  const id = String(row.id);
  await logHistory(id, 'created');
  await notify(user.id, 'Subscription Created', 'Your subscription has been set up.', id);
  return { ok: true, id };
}

async function setStatus(
  id: string,
  status: SubscriptionStatus,
  historyAction: string,
  notifyTitle: string,
  notifyMessage: string,
  extra?: Record<string, unknown>
): Promise<SubscriptionResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Backend not configured.' };
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false, error: 'Not signed in.' };

  const { error } = await supabase
    .from('subscriptions')
    .update({ status, ...extra })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { ok: false, error: error.message };

  await logHistory(id, historyAction);
  await notify(user.id, notifyTitle, notifyMessage, id);
  return { ok: true, id };
}

export async function pauseSubscription(id: string): Promise<SubscriptionResult> {
  return setStatus(id, 'paused', 'paused', 'Subscription Paused', 'Your subscription has been paused.');
}

export async function resumeSubscription(id: string, nextDelivery: Date): Promise<SubscriptionResult> {
  return setStatus(id, 'active', 'resumed', 'Subscription Resumed', 'Your subscription is active again.', {
    next_delivery: dateString(nextDelivery)
  });
}

export async function cancelSubscription(id: string): Promise<SubscriptionResult> {
  return setStatus(id, 'cancelled', 'cancelled', 'Subscription Cancelled', 'Your subscription has been cancelled.');
}

/** Advances next_delivery by one cycle without changing status — "skip this one." */
export async function skipNextDelivery(sub: RemoteSubscription): Promise<SubscriptionResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Backend not configured.' };
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false, error: 'Not signed in.' };

  const from = new Date(sub.nextDelivery || dateString(new Date()));
  const newNext = computeNextDelivery(sub.scheduleType, sub.interval, sub.weekdays, from);

  const { error } = await supabase
    .from('subscriptions')
    .update({ next_delivery: dateString(newNext) })
    .eq('id', sub.id)
    .eq('user_id', user.id);

  if (error) return { ok: false, error: error.message };
  await logHistory(sub.id, 'skipped');
  await notify(user.id, 'Delivery Skipped', 'Your next delivery has been skipped.', sub.id);
  return { ok: true, id: sub.id };
}

/** Same cycle math as the app's `computeNextDelivery()` in subscription_schedule.dart. */
export function computeNextDelivery(
  scheduleType: ScheduleType,
  interval: number,
  weekdays: number[] | null | undefined,
  from: Date
): Date {
  switch (scheduleType) {
    case 'daily':
      return addDays(from, interval);
    case 'weekly':
      return addDays(from, 7 * interval);
    case 'monthly': {
      const targetMonth = from.getMonth() + interval;
      const year = from.getFullYear() + Math.floor(targetMonth / 12);
      const month = ((targetMonth % 12) + 12) % 12;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const day = Math.min(from.getDate(), lastDay);
      return new Date(year, month, day);
    }
    case 'custom':
    default: {
      if (!weekdays || weekdays.length === 0) return addDays(from, 7);
      let candidate = addDays(from, 1);
      let guard = 0;
      while (!weekdays.includes(isoWeekday(candidate)) && guard < 14) {
        candidate = addDays(candidate, 1);
        guard++;
      }
      return candidate;
    }
  }
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** 1=Mon..7=Sun, matching the app's Dart DateTime.weekday numbering. */
function isoWeekday(d: Date): number {
  const day = d.getDay(); // 0=Sun..6=Sat
  return day === 0 ? 7 : day;
}
