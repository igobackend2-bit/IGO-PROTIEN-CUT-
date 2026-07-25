import 'package:intl/intl.dart';

import '../../domain/entities/delivery_slot.dart';
import '../../domain/repositories/delivery_slot_repository.dart';

/// No live logistics/capacity backend — slots are generated from fixed
/// 2-hour windows, same as the "Estimated Delivery" pattern used elsewhere
/// in the app. Today's slots need at least 90 minutes' lead time from now;
/// tomorrow's are all open.
class DeliverySlotRepositoryImpl implements DeliverySlotRepository {
  static const _windows = [
    (9, 11),
    (11, 13),
    (13, 15),
    (15, 17),
    (17, 19),
    (19, 21),
  ];
  static const _leadTime = Duration(minutes: 90);

  @override
  List<DeliverySlot> generateSlots() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = today.add(const Duration(days: 1));

    final slots = <DeliverySlot>[];

    for (final (startHour, endHour) in _windows) {
      final start = DateTime(today.year, today.month, today.day, startHour);
      final end = DateTime(today.year, today.month, today.day, endHour);
      final isAvailable = start.isAfter(now.add(_leadTime));
      slots.add(DeliverySlot(
        id: 'today-$startHour-$endHour',
        dayLabel: 'Today',
        date: today,
        timeRangeLabel: '${_formatHour(start)} - ${_formatHour(end)}',
        isAvailable: isAvailable,
      ));
    }

    for (final (startHour, endHour) in _windows) {
      final start = DateTime(tomorrow.year, tomorrow.month, tomorrow.day, startHour);
      final end = DateTime(tomorrow.year, tomorrow.month, tomorrow.day, endHour);
      slots.add(DeliverySlot(
        id: 'tomorrow-$startHour-$endHour',
        dayLabel: 'Tomorrow',
        date: tomorrow,
        timeRangeLabel: '${_formatHour(start)} - ${_formatHour(end)}',
        isAvailable: true,
      ));
    }

    return slots;
  }

  String _formatHour(DateTime time) => DateFormat('h:mm a').format(time);
}
