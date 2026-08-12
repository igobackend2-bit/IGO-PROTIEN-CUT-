import 'package:flutter/foundation.dart';

@immutable
class DeliverySlot {
  final String id;
  final String dayLabel; // "Today" | "Tomorrow"
  final DateTime date;
  final String timeRangeLabel; // "9:00 AM - 11:00 AM"
  final bool isAvailable;

  const DeliverySlot({
    required this.id,
    required this.dayLabel,
    required this.date,
    required this.timeRangeLabel,
    required this.isAvailable,
  });
}
