import '../../../../models/subscription_schedule.dart';
import '../entities/subscription.dart';
import '../entities/subscription_history_entry.dart';

abstract class SubscriptionRepository {
  Future<List<Subscription>> fetchSubscriptions();
  Future<Subscription?> fetchSubscriptionById(String id);
  Future<List<SubscriptionHistoryEntry>> fetchHistory(String subscriptionId);

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
  });

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
  });

  Future<void> pause(String id);
  Future<void> resume(String id, {required DateTime nextDelivery});
  Future<void> cancel(String id);
  Future<void> skipNextDelivery(Subscription subscription);

  /// Returns how many orders were generated this pass.
  Future<int> processDueSubscriptions();
  Future<void> sendUpcomingDeliveryReminders();
}
