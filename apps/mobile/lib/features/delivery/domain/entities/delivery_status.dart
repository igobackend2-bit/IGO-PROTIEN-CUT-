import 'package:flutter/material.dart';

/// Matches `delivery_assignments.status` exactly — set only by the Edge
/// Functions (assign-delivery / update-location / complete-delivery), never
/// written directly from Flutter.
enum DeliveryStatus {
  accepted('Accepted', Icons.receipt_long_rounded, Color(0xFFBA4A00)),
  partnerAssigned('Partner Assigned', Icons.person_pin_circle_rounded, Color(0xFF2471A3)),
  pickedUp('Picked Up', Icons.inventory_2_rounded, Color(0xFFB7950B)),
  onTheWay('On The Way', Icons.two_wheeler_rounded, Color(0xFF2471A3)),
  nearYou('Near You', Icons.near_me_rounded, Color(0xFF117A65)),
  delivered('Delivered', Icons.home_work_rounded, Color(0xFF117A65)),
  cancelled('Cancelled', Icons.cancel_rounded, Color(0xFFC0392B)),
  failed('Failed', Icons.error_outline_rounded, Color(0xFFC0392B));

  final String label;
  final IconData icon;
  final Color color;
  const DeliveryStatus(this.label, this.icon, this.color);

  static DeliveryStatus fromString(String? value) {
    final normalized = (value ?? '').trim().toLowerCase();
    return DeliveryStatus.values.firstWhere(
      (s) => s.label.toLowerCase() == normalized,
      orElse: () => DeliveryStatus.accepted,
    );
  }

  bool get isTerminal => this == DeliveryStatus.delivered || this == DeliveryStatus.cancelled || this == DeliveryStatus.failed;
  bool get isActive => !isTerminal;

  /// Position in the happy-path timeline — cancelled/failed aren't part of
  /// the linear track, same convention as OrderStatus.timelineIndex.
  int get timelineIndex {
    switch (this) {
      case DeliveryStatus.accepted:
        return 0;
      case DeliveryStatus.partnerAssigned:
        return 1;
      case DeliveryStatus.pickedUp:
        return 2;
      case DeliveryStatus.onTheWay:
        return 3;
      case DeliveryStatus.nearYou:
        return 4;
      case DeliveryStatus.delivered:
        return 5;
      case DeliveryStatus.cancelled:
      case DeliveryStatus.failed:
        return -1;
    }
  }

  static const List<DeliveryStatus> timelineSteps = [
    DeliveryStatus.accepted,
    DeliveryStatus.partnerAssigned,
    DeliveryStatus.pickedUp,
    DeliveryStatus.onTheWay,
    DeliveryStatus.nearYou,
    DeliveryStatus.delivered,
  ];
}
