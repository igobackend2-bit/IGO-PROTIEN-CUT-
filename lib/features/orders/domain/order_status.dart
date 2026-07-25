/// Order lifecycle values used across admin-orders (see status transitions
/// in supabase/functions/admin-orders/index.ts and the `Delivered` status
/// referenced by admin-users' totalSpent calculation).
class OrderStatus {
  OrderStatus._();

  static const pending = 'Pending';
  static const accepted = 'Accepted';
  static const packing = 'Packing';
  static const ready = 'Ready';
  static const outForDelivery = 'Out For Delivery';
  static const delivered = 'Delivered';
  static const cancelled = 'Cancelled';
  static const refunded = 'Refunded';

  static const all = <String>[
    pending,
    accepted,
    packing,
    ready,
    outForDelivery,
    delivered,
    cancelled,
    refunded,
  ];
}
