import '../../../../models/address_model.dart';
import '../../../../models/product_model.dart';
import '../../../../models/subscription_schedule.dart';

enum SubscriptionStatus { active, paused, completed, cancelled }

extension SubscriptionStatusX on SubscriptionStatus {
  String get code => name;
  String get label => switch (this) {
        SubscriptionStatus.active => 'Active',
        SubscriptionStatus.paused => 'Paused',
        SubscriptionStatus.completed => 'Completed',
        SubscriptionStatus.cancelled => 'Cancelled',
      };

  static SubscriptionStatus fromCode(String? code) => switch (code) {
        'paused' => SubscriptionStatus.paused,
        'completed' => SubscriptionStatus.completed,
        'cancelled' => SubscriptionStatus.cancelled,
        _ => SubscriptionStatus.active,
      };
}

class Subscription {
  final String id;
  final String userId;
  final Product product;
  final Address? address;
  final int quantity;
  final String? variantId;
  final ScheduleType scheduleType;
  final List<int> weekdays;
  final int interval;
  final DateTime nextDelivery;
  final String? deliverySlot;
  final String paymentMethod;
  final SubscriptionStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Subscription({
    required this.id,
    required this.userId,
    required this.product,
    this.address,
    required this.quantity,
    this.variantId,
    required this.scheduleType,
    this.weekdays = const [],
    required this.interval,
    required this.nextDelivery,
    this.deliverySlot,
    required this.paymentMethod,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  /// "Upcoming" = active and not yet due; distinct from an active
  /// subscription whose delivery is due today or overdue.
  bool get isUpcoming => status == SubscriptionStatus.active && nextDelivery.isAfter(_today);
  bool get isDueForDelivery => status == SubscriptionStatus.active && !nextDelivery.isAfter(_today);

  static DateTime get _today {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day);
  }

  String get scheduleDescription {
    switch (scheduleType) {
      case ScheduleType.daily:
        return interval == 1 ? 'Every day' : 'Every $interval days';
      case ScheduleType.weekly:
        return interval == 1 ? 'Every week' : 'Every $interval weeks';
      case ScheduleType.monthly:
        return interval == 1 ? 'Every month' : 'Every $interval months';
      case ScheduleType.custom:
        if (weekdays.isEmpty) return 'Custom schedule';
        final sorted = [...weekdays]..sort();
        return sorted.map((d) => weekdayLabels[d - 1]).join(', ');
    }
  }

  factory Subscription.fromMap(Map<String, dynamic> map) {
    final productData = map['products'];
    final addressData = map['addresses'];
    return Subscription(
      id: (map['id'] ?? '').toString(),
      userId: (map['user_id'] ?? '').toString(),
      product: Product.fromMap(productData is Map ? Map<String, dynamic>.from(productData) : const {}),
      address: addressData is Map ? Address.fromMap(Map<String, dynamic>.from(addressData)) : null,
      quantity: (map['quantity'] as num?)?.toInt() ?? 1,
      variantId: map['variant_id'] as String?,
      scheduleType: ScheduleTypeX.fromCode(map['schedule_type'] as String?),
      weekdays: (map['weekdays'] as List?)?.map((e) => (e as num).toInt()).toList() ?? const [],
      interval: (map['interval'] as num?)?.toInt() ?? 1,
      nextDelivery: DateTime.tryParse(map['next_delivery']?.toString() ?? '') ?? DateTime.now(),
      deliverySlot: map['delivery_slot'] as String?,
      paymentMethod: (map['payment_method'] ?? 'Cash on Delivery').toString(),
      status: SubscriptionStatusX.fromCode(map['status'] as String?),
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
      updatedAt: DateTime.tryParse(map['updated_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
    );
  }
}
