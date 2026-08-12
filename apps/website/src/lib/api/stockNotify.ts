import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * STOCK NOTIFY REQUESTS — backed by `igo_stock_notify_requests`
 * (see supabase/migrations/0020_stock_notify_requests.sql).
 *
 * Lets a customer ask to be told when an out-of-stock product is restocked.
 * Insert is public (signed in or guest); reading the list back is
 * admin-only via RLS, same pattern as igo_leads / igo_batch_trace.
 *
 * Not fully automatic: product stock status only ever changes in the
 * separate Flutter admin app, which this website is not allowed to touch
 * (see CLAUDE.md). So there's no trigger that fires the moment an item is
 * restocked — instead the website's own /admin surfaces the waiting list
 * per product (with that product's live stock status) so staff can reach
 * out directly once they've restocked it.
 */

export interface Result<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

function noBackend<T>(): Result<T> {
  return { ok: false, error: 'Backend not configured.' };
}

export interface StockNotifyRequestRow {
  id: string;
  product_id: string;
  product_name: string;
  customer_email: string;
  customer_phone: string | null;
  user_id: string | null;
  notified_at: string | null;
  created_at: string;
}

/** Public: submit a "notify me" request for an out-of-stock product. */
export async function requestStockNotify(input: {
  productId: string;
  productName: string;
  email: string;
  phone?: string;
}): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('igo_stock_notify_requests').insert({
    product_id: input.productId,
    product_name: input.productName,
    customer_email: input.email.trim(),
    customer_phone: input.phone?.trim() || null,
    user_id: userData.user?.id ?? null
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Admin-only: every pending (not-yet-notified) request, newest first. */
export async function listPendingStockNotifyRequests(): Promise<Result<StockNotifyRequestRow[]>> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { data, error } = await supabase
    .from('igo_stock_notify_requests')
    .select('*')
    .is('notified_at', null)
    .order('created_at', { ascending: false });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: (data ?? []) as unknown as StockNotifyRequestRow[] };
}

/** Admin-only: mark a single request as handled. */
export async function markStockNotifyRequestSent(id: string): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { error } = await supabase
    .from('igo_stock_notify_requests')
    .update({ notified_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Admin-only: mark every pending request for one product as handled (after emailing them all). */
export async function markProductStockNotifyRequestsSent(productId: string): Promise<Result> {
  if (!isSupabaseConfigured || !supabase) return noBackend();
  const { error } = await supabase
    .from('igo_stock_notify_requests')
    .update({ notified_at: new Date().toISOString() })
    .eq('product_id', productId)
    .is('notified_at', null);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
