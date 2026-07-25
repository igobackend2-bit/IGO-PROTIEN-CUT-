import '../../../../models/subscription_schedule.dart';
import '../../../../services/subscription_service.dart';
import '../../domain/entities/subscription.dart';
import '../../domain/entities/subscription_history_entry.dart';
import '../../domain/repositories/subscription_repository.dart';

class SubscriptionRepositoryImpl implements SubscriptionRepository {
  final SubscriptionService _service;
  SubscriptionRepositoryImpl({SubscriptionService? service}) : _service = service ?? SubscriptionService();

  @override
  Future<List<Subscription>> fetchSubscriptions() async {
    final raw = await _service.fetchSubscriptions();
    return raw.map(Subscription.fromMap).toList();
  }

  @override
  Future<Subscription?> fetchSubscriptionById(String id) async {
    final row = await _service.fetchSubscriptionById(id);
    return row == null ? null : Subscription.fromMap(row);
  }

  @override
  Future<List<SubscriptionHistoryEntry>> fetchHistory(String subscriptionId) async {
    final raw = await _service.fetchHistory(subscriptionId);
    return raw.map(SubscriptionHistoryEntry.fromMap).toList();
  }

  @override
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
  }) {
    return _service.createSubscription(
      productId: productId,
      addressId: addressId,
      quantity: quantity,
      variantId: variantId,
      scheduleType: scheduleType,
      weekdays: weekdays,
      interval: interval,
      startDate: startDate,
      deliverySlot: deliverySlot,
      paymentMethod: paymentMethod,
    );
  }

  @override
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
  }) {
    return _service.updateSubscription(
      id,
      quantity: quantity,
      addressId: addressId,
      deliverySlot: deliverySlot,
      paymentMethod: paymentMethod,
      scheduleType: scheduleType,
      weekdays: weekdays,
      interval: interval,
      nextDelivery: nextDelivery,
    );
  }

  @override
  Future<void> pause(String id) => _service.pause(id);

  @override
  Future<void> resume(String id, {required DateTime nextDelivery}) => _service.resume(id, nextDelivery: nextDelivery);

  @override
  Future<void> cancel(String id) => _service.cancel(id);

  @override
  Future<void> skipNextDelivery(Subscription subscription) {
    return _service.skipNextDelivery(
      id: subscription.id,
      scheduleType: subscription.scheduleType,
      interval: subscription.interval,
      weekdays: subscription.weekdays,
      currentNextDelivery: subscription.nextDelivery,
    );
  }

  @override
  Future<int> processDueSubscriptions() => _service.processDueSubscriptions();

  @override
  Future<void> sendUpcomingDeliveryReminders() => _service.sendUpcomingDeliveryReminders();
}
