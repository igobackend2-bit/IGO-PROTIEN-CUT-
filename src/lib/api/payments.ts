import { supabase, isSupabaseConfigured } from '../supabase';

/**
 * PAYMENT HISTORY — read-only view over the CANONICAL `payments` table
 * (written to by `placeOrder()` in orders.ts, same table the app/admin use
 * for refund/payment status). RLS restricts rows to the signed-in customer.
 */
export interface PaymentRecord {
  id: string;
  orderId: string | null;
  amount: number;
  paymentMethod: string | null;
  status: string;
  createdAt: string;
}

export async function fetchMyPayments(): Promise<PaymentRecord[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from('payments')
    .select('id, order_id, amount, payment_method, status, created_at')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[payments] fetch failed:', error.message);
    return null;
  }
  return (data ?? []).map((row) => ({
    id: String(row.id),
    orderId: row.order_id ? String(row.order_id) : null,
    amount: Number(row.amount ?? 0),
    paymentMethod: row.payment_method ?? null,
    status: row.status ?? 'Pending',
    createdAt: row.created_at ?? ''
  }));
}
