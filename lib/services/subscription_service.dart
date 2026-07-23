import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/subscription_schedule.dart';
import 'order_service.dart';

/// Shared subscription service, following the same plain-Supabase-wrapper
/// pattern as OrderService/PaymentService/LoyaltyService. Order generation
/// (`processDueSubscriptions`) deliberately calls the existing OrderService
/// directly rather than re-implementing order-insert logic — "reuse
/// OrderService, don't duplicate order logic" from the brief, taken
/// literally.
class SubscriptionService {
  final SupabaseClient _client = Supabase.instance.client;
  final OrderService _orderService = OrderService();

  static const _richSelect = '''
    *, products(*), addresses(*)
  ''';

  Future<List<Map<String, dynamic>>> fetchSubscriptions() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];
    try {
      final response = await _client
          .from('subscriptions')
          .select(_richSelect)
          .eq('user_id', user.id)
          .order('created_at', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  Future<Map<String, dynamic>?> fetchSubscriptionById(String id) async {
    final user = _client.auth.currentUser;
    if (user == null) return null;
    try {
      return await _client.from('subscriptions').select(_richSelect).eq('id', id).eq('user_id', user.id).maybeSingle();
    } catch (_) {
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> fetchHistory(String subscriptionId) async {
    try {
      final response = await _client
          .from('subscription_history')
          .select()
          .eq('subscription_id', subscriptionId)
          .order('created_at', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  Future<String> createSubscription({
    required String productId,
    String? addressId,
    required int quantity,
    String? variantId,
    required ScheduleType scheduleType,
    List<int>? weekdays,
    required int interval,
    required DateTime startDate,
    String? deliverySlot,
    required String paymentMethod,
  }) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to subscribe.');

    final row = await _client
        .from('subscriptions')
        .insert({
          'user_id': user.id,
          'product_id': productId,
          'address_id': addressId,
          'quantity': quantity,
          'variant_id': variantId,
          'schedule_type': scheduleType.code,
          'weekdays': weekdays,
          'interval': interval,
          'next_delivery': _dateString(startDate),
          'delivery_slot': deliverySlot,
          'payment_method': paymentMethod,
          'status': 'active',
        })
        .select('id')
        .single();

    final id = row['id'].toString();
    await _logHistory(id, 'created');
    await _notify(
      title: 'Subscription Created',
      message: 'Your ${scheduleType.label.toLowerCase()} subscription has been set up.',
      subscriptionId: id,
    );
    return id;
  }

  Future<void> updateSubscription(
    String id, {
    int? quantity,
    String? addressId,
    String? deliverySlot,
    String? paymentMethod,
    ScheduleType? scheduleType,
    List<int>? weekdays,
    int? interval,
    DateTime? nextDelivery,
  }) async {
    final payload = <String, dynamic>{
      if (quantity != null) 'quantity': quantity,
      if (addressId != null) 'address_id': addressId,
      if (deliverySlot != null) 'delivery_slot': deliverySlot,
      if (paymentMethod != null) 'payment_method': paymentMethod,
      if (scheduleType != null) 'schedule_type': scheduleType.code,
      if (weekdays != null) 'weekdays': weekdays,
      if (interval != null) 'interval': interval,
      if (nextDelivery != null) 'next_delivery': _dateString(nextDelivery),
    };
    if (payload.isEmpty) return;
    await _client.from('subscriptions').update(payload).eq('id', id);
    await _logHistory(id, 'edited');
  }

  Future<void> pause(String id) async {
    await _client.from('subscriptions').update({'status': 'paused'}).eq('id', id);
    await _logHistory(id, 'paused');
    await _notify(title: 'Subscription Paused', message: 'Your subscription has been paused.', subscriptionId: id);
  }

  Future<void> resume(String id, {required DateTime nextDelivery}) async {
    await _client.from('subscriptions').update({'status': 'active', 'next_delivery': _dateString(nextDelivery)}).eq('id', id);
    await _logHistory(id, 'resumed');
    await _notify(title: 'Subscription Resumed', message: 'Your subscription is active again.', subscriptionId: id);
  }

  Future<void> cancel(String id) async {
    await _client.from('subscriptions').update({'status': 'cancelled'}).eq('id', id);
    await _logHistory(id, 'cancelled');
    await _notify(title: 'Subscription Cancelled', message: 'Your subscription has been cancelled.', subscriptionId: id);
  }

  Future<void> skipNextDelivery({
    required String id,
    required ScheduleType scheduleType,
    required int interval,
    List<int>? weekdays,
    required DateTime currentNextDelivery,
  }) async {
    final newNext = computeNextDelivery(scheduleType: scheduleType, interval: interval, weekdays: weekdays, from: currentNextDelivery);
    await _client.from('subscriptions').update({'next_delivery': _dateString(newNext)}).eq('id', id);
    await _logHistory(id, 'skipped');
    await _notify(title: 'Delivery Skipped', message: 'Your next delivery has been skipped.', subscriptionId: id);
  }

  /// The core "reuse OrderService" mechanic — checked once per app session
  /// (there's no backend to run this on a real schedule). For every active
  /// subscription due today or earlier, places a real order the exact same
  /// way Checkout does, then advances next_delivery. Because it goes
  /// through OrderService.createOrder(), the existing order-placed
  /// notification and loyalty/cashback triggers fire automatically.
  Future<int> processDueSubscriptions() async {
    final user = _client.auth.currentUser;
    if (user == null) return 0;

    final todayDate = _dateOnly(DateTime.now());
    List<Map<String, dynamic>> due;
    try {
      due = List<Map<String, dynamic>>.from(
        await _client
            .from('subscriptions')
            .select(_richSelect)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .lte('next_delivery', _dateString(todayDate))
            .order('next_delivery'),
      );
    } catch (_) {
      return 0;
    }

    var processed = 0;
    for (final row in due) {
      try {
        final productData = row['products'];
        if (productData is! Map) continue;
        final price = (productData['price'] as num?)?.toDouble() ?? 0;
        final productId = row['product_id'].toString();
        final quantity = (row['quantity'] as num?)?.toInt() ?? 1;
        final subscriptionId = row['id'].toString();

        await _orderService.createOrder(
          items: [OrderLineInput(productId: productId, quantity: quantity, price: price)],
          totalPrice: price * quantity,
          addressId: row['address_id']?.toString(),
          deliverySlotLabel: row['delivery_slot'] as String?,
          paymentMethod: row['payment_method'] as String?,
        );

        final scheduleType = ScheduleTypeX.fromCode(row['schedule_type'] as String?);
        final interval = (row['interval'] as num?)?.toInt() ?? 1;
        final weekdays = (row['weekdays'] as List?)?.map((e) => (e as num).toInt()).toList();
        final nextDelivery = computeNextDelivery(
          scheduleType: scheduleType,
          interval: interval,
          weekdays: weekdays,
          from: DateTime.tryParse(row['next_delivery']?.toString() ?? '') ?? todayDate,
        );

        await _client.from('subscriptions').update({'next_delivery': _dateString(nextDelivery)}).eq('id', subscriptionId);
        await _logHistory(subscriptionId, 'order_created');
        processed++;
      } catch (_) {
        // One subscription failing (e.g. address deleted) shouldn't block
        // the rest from processing this pass.
        continue;
      }
    }
    return processed;
  }

  /// Sends a one-per-day "delivery tomorrow" reminder for subscriptions due
  /// tomorrow, deduped via subscription_history so re-running this on
  /// every app open in the same day doesn't spam.
  Future<void> sendUpcomingDeliveryReminders() async {
    final user = _client.auth.currentUser;
    if (user == null) return;
    final tomorrowDate = _dateOnly(DateTime.now().add(const Duration(days: 1)));

    List<Map<String, dynamic>> dueTomorrow;
    try {
      dueTomorrow = List<Map<String, dynamic>>.from(
        await _client
            .from('subscriptions')
            .select('id, products(name)')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .eq('next_delivery', _dateString(tomorrowDate)),
      );
    } catch (_) {
      return;
    }

    for (final row in dueTomorrow) {
      final id = row['id'].toString();
      final alreadyRemindedToday = await _remindedToday(id);
      if (alreadyRemindedToday) continue;

      final productName = (row['products'] is Map ? row['products']['name'] : null)?.toString() ?? 'your product';
      await _logHistory(id, 'reminder_sent');
      await _notify(title: 'Upcoming Delivery', message: '$productName arrives tomorrow.', subscriptionId: id);
    }
  }

  Future<bool> _remindedToday(String subscriptionId) async {
    final startOfDay = _dateOnly(DateTime.now());
    try {
      final response = await _client
          .from('subscription_history')
          .select('id')
          .eq('subscription_id', subscriptionId)
          .eq('action', 'reminder_sent')
          .gte('created_at', startOfDay.toIso8601String())
          .maybeSingle();
      return response != null;
    } catch (_) {
      return false;
    }
  }

  Future<void> _logHistory(String subscriptionId, String action) async {
    try {
      await _client.from('subscription_history').insert({'subscription_id': subscriptionId, 'action': action});
    } catch (_) {
      // Non-fatal — the subscription state change itself already succeeded.
    }
  }

  Future<void> _notify({required String title, required String message, required String subscriptionId}) async {
    final user = _client.auth.currentUser;
    if (user == null) return;
    try {
      await _client.from('notifications').insert({
        'user_id': user.id,
        'type': 'subscription',
        'title': title,
        'message': message,
        'data': {'subscription_id': subscriptionId},
      });
    } catch (_) {
      // Non-fatal — the underlying subscription action already succeeded.
    }
  }

  DateTime _dateOnly(DateTime dt) => DateTime(dt.year, dt.month, dt.day);

  /// Postgres `date` columns need a plain 'yyyy-MM-dd' value — a raw
  /// DateTime isn't JSON-encodable and a full ISO datetime string would be
  /// the wrong shape for filters/inserts against a date column.
  String _dateString(DateTime dt) => dt.toIso8601String().split('T').first;
}
