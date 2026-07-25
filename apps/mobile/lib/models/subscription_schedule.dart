enum ScheduleType { daily, weekly, monthly, custom }

extension ScheduleTypeX on ScheduleType {
  String get label => switch (this) {
        ScheduleType.daily => 'Daily',
        ScheduleType.weekly => 'Weekly',
        ScheduleType.monthly => 'Monthly',
        ScheduleType.custom => 'Custom Schedule',
      };

  String get code => switch (this) {
        ScheduleType.daily => 'daily',
        ScheduleType.weekly => 'weekly',
        ScheduleType.monthly => 'monthly',
        ScheduleType.custom => 'custom',
      };

  static ScheduleType fromCode(String? code) => switch (code) {
        'daily' => ScheduleType.daily,
        'weekly' => ScheduleType.weekly,
        'monthly' => ScheduleType.monthly,
        _ => ScheduleType.custom,
      };
}

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/// Recurring time windows for subscription deliveries — distinct from
/// Checkout's date-specific DeliverySlot (which is tied to one calendar
/// date), since a subscription's slot repeats indefinitely with no date.
const subscriptionDeliverySlots = ['Morning (6 AM - 9 AM)', 'Afternoon (12 PM - 3 PM)', 'Evening (5 PM - 8 PM)'];

/// Computes the next delivery date strictly after [from], per the schedule.
/// Weekdays use Dart's DateTime.weekday numbering (1=Mon .. 7=Sun), matching
/// how they're stored on the subscription row.
DateTime computeNextDelivery({
  required ScheduleType scheduleType,
  required int interval,
  List<int>? weekdays,
  required DateTime from,
}) {
  switch (scheduleType) {
    case ScheduleType.daily:
      return from.add(Duration(days: interval));
    case ScheduleType.weekly:
      return from.add(Duration(days: 7 * interval));
    case ScheduleType.monthly:
      final targetMonth = from.month + interval;
      final year = from.year + (targetMonth - 1) ~/ 12;
      final month = ((targetMonth - 1) % 12) + 1;
      final lastDayOfTargetMonth = DateTime(year, month + 1, 0).day;
      final day = from.day > lastDayOfTargetMonth ? lastDayOfTargetMonth : from.day;
      return DateTime(year, month, day);
    case ScheduleType.custom:
      if (weekdays == null || weekdays.isEmpty) return from.add(const Duration(days: 7));
      var candidate = from.add(const Duration(days: 1));
      // Weekdays are always a small fixed set (max 7), so this loop is bounded.
      while (!weekdays.contains(candidate.weekday)) {
        candidate = candidate.add(const Duration(days: 1));
      }
      return candidate;
  }
}
