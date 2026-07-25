import 'package:supabase_flutter/supabase_flutter.dart';

/// One cart line ready to be persisted as an `order_items` row. Deliberately
/// a plain data holder (not the Cart feature's `CartLineItem`) so this
/// shared, top-level service doesn't depend on a feature module.
class OrderLineInput {
  final String productId;
  final int quantity;
  final double price;

  const OrderLineInput({required this.productId, required this.quantity, required this.price});
}

class CreatedOrder {
  final String id;
  final double totalPrice;
  final String status;

  const CreatedOrder({required this.id, required this.totalPrice, required this.status});
}

class OrderService {
  final SupabaseClient _client = Supabase.instance.client;

  /// Fetches the order history for the currently logged-in user.
  Future<List<Map<String, dynamic>>> fetchOrders() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];

    try {
      final response = await _client
          .from('orders')
          .select('''
            id,
            total_price,
            status,
            created_at,
            order_items (
              id,
              quantity,
              price,
              product_id,
              products (
                id,
                name,
                image_url,
                category
              )
            )
          ''')
          .eq('user_id', user.id)
          .order('created_at', ascending: false);

      final data = List<Map<String, dynamic>>.from(response);

      // Normalize Supabase nested product responses (in case they return as single-item lists)
      for (final order in data) {
        final items = order['order_items'] as List?;
        if (items != null) {
          for (final item in items) {
            if (item['products'] is List && (item['products'] as List).isNotEmpty) {
              item['products'] = (item['products'] as List).first;
            }
          }
        }
      }

      return data;
    } catch (e) {
      // Return empty list on failure or log it
      return [];
    }
  }

  /// Places an order. Tries the full checkout payload (address, delivery
  /// slot, payment method, coupon, instructions, gift note) first; if the
  /// `orders` table hasn't been migrated with those optional columns yet,
  /// falls back to the baseline insert (user_id/total_price/status only —
  /// the same shape the app used before Checkout existed) so placing an
  /// order never hard-fails on a missing column.
  Future<CreatedOrder> createOrder({
    required List<OrderLineInput> items,
    required double totalPrice,
    String? addressId,
    String? deliverySlotLabel,
    String? paymentMethod,
    String? deliveryInstructions,
    String? giftNote,
    String? couponCode,
    double? discountAmount,
    double? deliveryFee,
    double? taxAmount,
  }) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to place an order.');
    if (items.isEmpty) throw Exception('Cannot place an order with no items.');

    final richPayload = {
      'user_id': user.id,
      'total_price': totalPrice,
      'status': 'Pending',
      if (addressId != null) 'address_id': addressId,
      if (deliverySlotLabel != null) 'delivery_slot': deliverySlotLabel,
      if (paymentMethod != null) 'payment_method': paymentMethod,
      if (deliveryInstructions != null && deliveryInstructions.trim().isNotEmpty)
        'delivery_instructions': deliveryInstructions.trim(),
      if (giftNote != null && giftNote.trim().isNotEmpty) 'gift_note': giftNote.trim(),
      if (couponCode != null) 'coupon_code': couponCode,
      if (discountAmount != null) 'discount_amount': discountAmount,
      if (deliveryFee != null) 'delivery_fee': deliveryFee,
      if (taxAmount != null) 'tax_amount': taxAmount,
    };

    Map<String, dynamic> orderRow;
    try {
      orderRow = await _client.from('orders').insert(richPayload).select().single();
    } catch (_) {
      orderRow = await _client
          .from('orders')
          .insert({'user_id': user.id, 'total_price': totalPrice, 'status': 'Pending'})
          .select()
          .single();
    }

    final orderId = orderRow['id'] as String;

    final orderItemsPayload = items
        .map((i) => {
              'order_id': orderId,
              'product_id': i.productId,
              'quantity': i.quantity,
              'price': i.price,
            })
        .toList();
    await _client.from('order_items').insert(orderItemsPayload);

    return CreatedOrder(
      id: orderId,
      totalPrice: totalPrice,
      status: (orderRow['status'] as String?) ?? 'Pending',
    );
  }

  static const _richOrderSelect = '''
    id, total_price, status, created_at,
    delivery_slot, payment_method, delivery_instructions, gift_note,
    coupon_code, discount_amount, delivery_fee, tax_amount,
    address_id, delivery_partner_id, delivery_otp, cancelled_at, cancel_reason,
    addresses ( full_name, phone, house, street, area, landmark, city, state, pincode, latitude, longitude ),
    delivery_partners ( name, phone, vehicle_number, rating ),
    order_items ( id, quantity, price, product_id, products ( id, name, image_url, category ) )
  ''';

  static const _baselineOrderSelect = '''
    id, total_price, status, created_at,
    order_items ( id, quantity, price, product_id, products ( id, name, image_url, category ) )
  ''';

  /// Single order, joined with delivery address/partner when those columns
  /// exist — falls back to the baseline shape (same as before Phase 6/8)
  /// if they don't, same resilience pattern used elsewhere in the app.
  Future<Map<String, dynamic>?> fetchOrderById(String orderId) async {
    final user = _client.auth.currentUser;
    if (user == null) return null;

    try {
      final row = await _client
          .from('orders')
          .select(_richOrderSelect)
          .eq('id', orderId)
          .eq('user_id', user.id)
          .maybeSingle();
      return row == null ? null : _normalizeOrder(row);
    } catch (_) {
      final row = await _client
          .from('orders')
          .select(_baselineOrderSelect)
          .eq('id', orderId)
          .eq('user_id', user.id)
          .maybeSingle();
      return row == null ? null : _normalizeOrder(row);
    }
  }

  Map<String, dynamic> _normalizeOrder(Map<String, dynamic> order) {
    final normalized = Map<String, dynamic>.from(order);

    for (final key in ['addresses', 'delivery_partners']) {
      final value = normalized[key];
      if (value is List && value.isNotEmpty) normalized[key] = value.first;
      if (value is List && value.isEmpty) normalized[key] = null;
    }

    final items = normalized['order_items'] as List?;
    if (items != null) {
      for (final item in items) {
        if (item['products'] is List && (item['products'] as List).isNotEmpty) {
          item['products'] = (item['products'] as List).first;
        }
      }
    }
    return normalized;
  }

  /// Live updates for one order: Supabase Realtime signals *that* the row
  /// changed, then the full joined view is re-fetched (`.stream()` itself
  /// can't express joins) so the UI always has complete, current data.
  Stream<Map<String, dynamic>?> watchOrder(String orderId) {
    return _client
        .from('orders')
        .stream(primaryKey: ['id'])
        .eq('id', orderId)
        .asyncMap((_) => fetchOrderById(orderId));
  }

  /// Only allowed while the order is still in an early, cancellable state —
  /// enforced in the UI via [OrderStatus.isCancellable]; enforced here too
  /// via RLS on the backend once configured.
  Future<void> cancelOrder(String orderId, {String? reason}) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in.');

    try {
      await _client.from('orders').update({
        'status': 'Cancelled',
        'cancelled_at': DateTime.now().toIso8601String(),
        if (reason != null && reason.trim().isNotEmpty) 'cancel_reason': reason.trim(),
      }).eq('id', orderId).eq('user_id', user.id);
    } catch (_) {
      await _client.from('orders').update({'status': 'Cancelled'}).eq('id', orderId).eq('user_id', user.id);
    }
  }

  Future<void> submitRating(String orderId, {required int rating, String? comment}) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to rate this order.');

    await _client.from('order_ratings').insert({
      'order_id': orderId,
      'user_id': user.id,
      'rating': rating.clamp(1, 5),
      if (comment != null && comment.trim().isNotEmpty) 'comment': comment.trim(),
    });
  }

  Future<Map<String, dynamic>?> fetchRating(String orderId) async {
    final user = _client.auth.currentUser;
    if (user == null) return null;
    try {
      return await _client
          .from('order_ratings')
          .select()
          .eq('order_id', orderId)
          .eq('user_id', user.id)
          .maybeSingle();
    } catch (_) {
      return null;
    }
  }
}
