import { supabase, isSupabaseConfigured } from '../supabase';
import { CartItem, Order, OrderStatus, SavedAddress } from '../../types';
import { getBulkUnitPrice } from '../pricing';

/**
 * ORDERS — written to and read from the CANONICAL `orders` / `order_items` /
 * `addresses` / `payments` tables, using the signed-in customer's own session.
 *
 * This is the same path the Flutter app takes in lib/services/order_service.dart
 * (`_client.from('orders').insert(...)`), permitted by the existing
 * `auth.uid() = user_id` RLS policies. No service-role key, no Edge Function,
 * no backend change.
 *
 * The practical payoff: an order placed on the website lands in the same table
 * the app writes to, so it appears in the Flutter admin's Orders screen
 * immediately — assignable to a delivery partner, refundable, and covered by
 * the Realtime publication the app already enabled on `orders`.
 *
 * KNOWN LIMITATION (documented in STEP_BY_STEP_PLAN.md, trade-off T1): there
 * is no `channel` column on `orders`, and adding one would mean altering an
 * app table, which is out of scope. Web orders are therefore indistinguishable
 * from app orders in the admin. The website keeps a shadow row in its own
 * `igo_orders` table holding the canonical order id, so a web-vs-app split is
 * still recoverable by joining, should you want it later.
 */

// ── Status mapping ──────────────────────────────────────────────────────────

/**
 * The canonical `orders.status` values used by the app and admin, mapped to
 * the website's more descriptive labels. Unknown values pass through as
 * 'Placed' rather than crashing the tracker.
 */
const STATUS_FROM_DB: Record<string, OrderStatus> = {
  Pending: 'Placed',
  Placed: 'Placed',
  Confirmed: 'Placed',
  Accepted: 'Placed',
  Preparing: 'Freshly Cut',
  Packed: 'Quality Passed',
  Ready: 'Quality Passed',
  'Out for Delivery': 'Out for Express Delivery',
  Shipped: 'Out for Express Delivery',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled'
};

export function statusFromDb(dbStatus: string | null): OrderStatus {
  if (!dbStatus) return 'Placed';
  return STATUS_FROM_DB[dbStatus] ?? 'Placed';
}

export function trackingStepFor(status: OrderStatus): number {
  switch (status) {
    case 'Placed':
      return 1;
    case 'Freshly Cut':
    case 'Quality Passed':
      return 2;
    case 'Out for Express Delivery':
      return 3;
    case 'Delivered':
      return 4;
    default:
      return 1;
  }
}

// ── Address ─────────────────────────────────────────────────────────────────

/**
 * Ensures an `addresses` row exists for this order and returns its id.
 * `orders.address_id` is a FK, so the address must be persisted first.
 */
/**
 * Persists the delivery address and returns its id.
 *
 * Returns an `error` rather than null-on-failure. The previous version
 * swallowed the error and returned null, so the order was still created with
 * `address_id: null` — the customer saw a confirmation, and the admin received
 * an order nobody could deliver because it had no name, phone or address.
 *
 * An order without a deliverable address is worse than no order, so the caller
 * now aborts instead.
 */
export async function ensureAddress(
  userId: string,
  address: SavedAddress
): Promise<{ id: string | null; error?: string }> {
  if (!supabase) return { id: null, error: 'Backend not configured.' };

  const payload = {
    user_id: userId,
    full_name: address.name,
    phone: address.phone,
    house: address.flatNo,
    street: address.street,
    area: address.fullAddress ?? address.street,
    landmark: address.landmark,
    city: address.city,
    // `addresses.state` is NOT NULL on the app's shared table (confirmed by
    // the actual Postgres error: 'null value in column "state" ... violates
    // not-null constraint'). Nothing on the website ever collects a state —
    // the "Add Address" form (UserAccountPage.tsx) has no field for it — so
    // `address.state` is always undefined and every order was failing here.
    // Falling back to Karnataka, matching this site's default city/pincode
    // (Bengaluru / 560038), unblocks orders immediately without touching the
    // address form or any other file. The real fix — actually collecting
    // state per address — is a follow-up for whoever owns that form.
    state: address.state ?? 'Karnataka',
    pincode: address.pincode
  };

  const { data, error } = await supabase
    .from('addresses')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    console.error('[orders] address insert failed:', error.message);
    return { id: null, error: error.message };
  }
  return { id: data.id as string };
}

// ── Place order ─────────────────────────────────────────────────────────────

export interface PlaceOrderInput {
  items: CartItem[];
  shippingAddress: SavedAddress;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  paymentMethod: Order['paymentMethod'];
  paymentStatus: Order['paymentStatus'];
  deliverySlot: string;
  couponCode?: string | null;
}

export interface PlaceOrderResult {
  ok: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Inserts orders → order_items → payments.
 *
 * IMPORTANT — this REPLACES the old fire-and-forget `fetch('/api/orders')`
 * behaviour, which swallowed every failure and still reported success to the
 * customer, so an order could vanish silently. Here a failure returns
 * `{ ok: false, error }` and the caller must surface it.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Backend not configured.' };
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    return { ok: false, error: 'Please sign in to place an order.' };
  }

  // Save the delivery address FIRST and abort if it fails. Creating the order
  // anyway would produce an undeliverable record with no name, phone or
  // address — which is exactly what happened before this guard existed.
  const addressResult = await ensureAddress(user.id, input.shippingAddress);
  if (!addressResult.id) {
    // This message used to be fully generic, discarding whatever Postgres
    // actually said (ensureAddress already captures it as addressResult.error
    // and logs it to the console) — which made "still failing after adding
    // an address" impossible to diagnose from the customer-facing message
    // alone. Appending the real reason turns a dead end into an actionable
    // one, without needing separate console access to see what broke.
    return {
      ok: false,
      error:
        'Could not save your delivery address, so the order was not placed. ' +
        (addressResult.error ? `Reason: ${addressResult.error}` : 'Please check the address details and try again.')
    };
  }
  const addressId = addressResult.id;

  // Keep the customer's profile name and phone current, so the admin's
  // Customers screen and the order list show a real person rather than a blank.
  await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        full_name: input.shippingAddress.name,
        phone_number: input.shippingAddress.phone
      },
      { onConflict: 'id' }
    )
    .then(({ error }) => {
      if (error) console.warn('[orders] profile sync failed (non-fatal):', error.message);
    });

  // 1. The order header.
  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_price: input.totalAmount,
      status: 'Pending',
      delivery_slot: input.deliverySlot,
      payment_method: input.paymentMethod,
      coupon_code: input.couponCode ?? null,
      discount_amount: input.discountAmount,
      delivery_fee: input.deliveryFee,
      tax_amount: input.tax,
      address_id: addressId
    })
    .select('id, created_at')
    .single();

  if (orderError || !orderRow) {
    console.error('[orders] order insert failed:', orderError?.message);
    return { ok: false, error: orderError?.message ?? 'Could not place the order.' };
  }

  const orderId = orderRow.id as string;

  // 2. Line items. Price stored is the per-unit price actually charged for
  //    the chosen weight — this must be the bulk-discounted unit price
  //    (getBulkUnitPrice), not the raw catalog price. The order header's
  //    totalAmount already reflects the bulk discount (see CartPage), so
  //    storing the undiscounted price here made `quantity * price` on every
  //    bulk-discounted line item fail to reconcile against the order total.
  const itemsPayload = input.items.map((item) => ({
    order_id: orderId,
    product_id: item.product.id,
    quantity: item.quantity,
    price: getBulkUnitPrice(item.selectedWeight.price, item.quantity)
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload);
  if (itemsError) {
    console.error('[orders] order_items insert failed:', itemsError.message);
    // The header exists but has no lines — surface it rather than pretending
    // the order is fine. Support can reconcile from the id we return.
    return {
      ok: false,
      orderId,
      error: 'Order was created but its items could not be saved. Please contact support.'
    };
  }

  // 3. Payment record. Non-fatal: the order itself is valid without it, and
  //    the admin can reconcile. Logged loudly rather than swallowed.
  const { error: paymentError } = await supabase.from('payments').insert({
    order_id: orderId,
    user_id: user.id,
    amount: input.totalAmount,
    payment_method: input.paymentMethod,
    status: input.paymentStatus === 'Paid' ? 'Success' : 'Pending'
  });
  if (paymentError) {
    console.error('[orders] payment insert failed (non-fatal):', paymentError.message);
  }

  // 4. Website shadow row (trade-off T1). Best-effort only — never blocks a
  //    successful order.
  try {
    await supabase.from('igo_orders').insert({
      id: orderId,
      order_number: orderId.slice(0, 8).toUpperCase(),
      customer_name: input.shippingAddress.name,
      customer_phone: input.shippingAddress.phone,
      items: itemsPayload,
      subtotal: input.subtotal,
      discount_amount: input.discountAmount,
      delivery_fee: input.deliveryFee,
      tax: input.tax,
      total_amount: input.totalAmount,
      payment_method: input.paymentMethod,
      payment_status: input.paymentStatus,
      status: 'Placed',
      delivery_slot: input.deliverySlot,
      tracking_step: 1
    });
  } catch {
    // Shadow ledger is a reporting convenience, not a system of record.
  }

  return { ok: true, orderId };
}

// ── Read orders ─────────────────────────────────────────────────────────────

// `delivery_partners` is publicly readable per CLAUDE.md (`for select using (true)`),
// same as the app's own rich order select in order_service.dart. Joining it here
// replaces the placeholder "Assigned rider" / blank phone the website used to
// show — the customer now sees the actual rider name, phone and vehicle.
const ORDER_SELECT = `
  id, user_id, total_price, status, created_at, delivery_slot, payment_method,
  coupon_code, discount_amount, delivery_fee, tax_amount, address_id,
  delivery_partner_id, delivery_otp, cancelled_at, cancel_reason,
  addresses ( full_name, phone, house, street, area, landmark, city, state, pincode ),
  delivery_partners ( name, phone, vehicle_number, rating ),
  order_items ( id, quantity, price, product_id, products ( id, name, image_url, weight ) )
`;

export interface WebsiteOrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  trackingStep: number;
  totalAmount: number;
  discountAmount: number;
  deliveryFee: number;
  tax: number;
  deliverySlot: string | null;
  paymentMethod: string | null;
  couponCode: string | null;
  itemCount: number;
  items: {
    productId: string | null;
    name: string;
    imageUrl: string | null;
    quantity: number;
    price: number;
  }[];
  address: {
    name: string;
    phone: string;
    line: string;
    city: string;
    pincode: string;
  } | null;
  deliveryOtp: string | null;
  deliveryPartner: {
    name: string;
    phone: string;
    vehicleNo: string;
    rating: number;
  } | null;
}

function mapOrderRow(row: Record<string, any>): WebsiteOrderSummary {
  const status = statusFromDb(row.status);
  const address = row.addresses
    ? {
        name: row.addresses.full_name ?? '',
        phone: row.addresses.phone ?? '',
        line: [row.addresses.house, row.addresses.street, row.addresses.area, row.addresses.landmark]
          .filter(Boolean)
          .join(', '),
        city: row.addresses.city ?? '',
        pincode: row.addresses.pincode ?? ''
      }
    : null;

  const deliveryPartner = row.delivery_partners
    ? {
        name: row.delivery_partners.name ?? 'Assigned rider',
        phone: row.delivery_partners.phone ?? '',
        vehicleNo: row.delivery_partners.vehicle_number ?? '',
        rating: Number(row.delivery_partners.rating ?? 0)
      }
    : null;

  const items = (row.order_items ?? []).map((item: Record<string, any>) => ({
    productId: item.product_id ?? null,
    name: item.products?.name ?? 'Item',
    imageUrl: item.products?.image_url ?? null,
    quantity: Number(item.quantity ?? 0),
    price: Number(item.price ?? 0)
  }));

  return {
    id: row.id,
    // `orders` has no order_number column; the app displays a short id. Same
    // convention here so the customer sees the same reference the admin does.
    orderNumber: String(row.id).slice(0, 8).toUpperCase(),
    createdAt: row.created_at,
    status,
    trackingStep: trackingStepFor(status),
    totalAmount: Number(row.total_price ?? 0),
    discountAmount: Number(row.discount_amount ?? 0),
    deliveryFee: Number(row.delivery_fee ?? 0),
    tax: Number(row.tax_amount ?? 0),
    deliverySlot: row.delivery_slot ?? null,
    paymentMethod: row.payment_method ?? null,
    couponCode: row.coupon_code ?? null,
    itemCount: items.length,
    items,
    address,
    deliveryOtp: row.delivery_otp ?? null,
    deliveryPartner
  };
}

/** The signed-in customer's own orders. RLS restricts this to their rows. */
export async function fetchMyOrders(): Promise<WebsiteOrderSummary[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[orders] fetchMyOrders failed:', error.message);
    return null;
  }
  return (data ?? []).map(mapOrderRow);
}

export async function fetchOrder(orderId: string): Promise<WebsiteOrderSummary | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', orderId)
    .maybeSingle();
  if (error || !data) return null;
  return mapOrderRow(data);
}

/**
 * Live order tracking via Realtime.
 *
 * `orders` was added to the `supabase_realtime` publication by the app's
 * phase7_8_payments_orders.sql, so this needs no backend change and gives the
 * website the same instant status updates the app gets when an admin moves an
 * order along. Returns an unsubscribe function.
 */
export function subscribeToOrder(
  orderId: string,
  onChange: (order: WebsiteOrderSummary) => void
): () => void {
  if (!isSupabaseConfigured || !supabase) return () => {};

  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
      async () => {
        const fresh = await fetchOrder(orderId);
        if (fresh) onChange(fresh);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Customer-initiated cancellation. Mirrors the app's own guard: a customer may
 * only cancel their own order. Any other status transition is the admin's job
 * and the website must never attempt it.
 */
export async function cancelOrder(
  orderId: string,
  reason: string
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Backend not configured.' };
  }
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: 'Not signed in.' };

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'Cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason
    })
    .eq('id', orderId)
    .eq('user_id', userData.user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
