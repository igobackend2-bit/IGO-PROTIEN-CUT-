import 'package:flutter/material.dart';

/// Canonical order lifecycle used everywhere an order's status is shown
/// (Orders list, Order Detail, Tracking, Timeline) — replaces the ad hoc
/// string comparisons the old order screens each did independently.
enum OrderStatus {
  pending('Pending', Icons.receipt_long_rounded, Color(0xFFBA4A00)),
  accepted('Accepted', Icons.thumb_up_alt_rounded, Color(0xFF2471A3)),
  packing('Packing', Icons.inventory_2_rounded, Color(0xFFB7950B)),
  ready('Ready', Icons.check_circle_outline_rounded, Color(0xFF117A65)),
  outForDelivery('Out For Delivery', Icons.delivery_dining_rounded, Color(0xFF2471A3)),
  delivered('Delivered', Icons.home_work_rounded, Color(0xFF117A65)),
  cancelled('Cancelled', Icons.cancel_rounded, Color(0xFFC0392B)),
  refunded('Refunded', Icons.currency_exchange_rounded, Color(0xFF7D3C98));

  final String label;
  final IconData icon;
  final Color color;

  const OrderStatus(this.label, this.icon, this.color);

  static OrderStatus fromString(String? value) {
    final normalized = (value ?? '').trim().toLowerCase();
    for (final status in OrderStatus.values) {
      if (status.label.toLowerCase() == normalized) return status;
    }
    // Backward-compatible with statuses written by the pre-Phase-8 flow.
    switch (normalized) {
      case 'out for delivery':
      case 'dispatched':
        return OrderStatus.outForDelivery;
      case '':
        return OrderStatus.pending;
      default:
        return OrderStatus.pending;
    }
  }

  bool get isActive => this != OrderStatus.delivered && this != OrderStatus.cancelled && this != OrderStatus.refunded;

  bool get isCancellable => this == OrderStatus.pending || this == OrderStatus.accepted || this == OrderStatus.packing;

  /// Position in the "happy path" timeline (cancelled/refunded aren't part
  /// of the linear progress track — handled separately in the UI).
  int get timelineIndex {
    switch (this) {
      case OrderStatus.pending:
        return 0;
      case OrderStatus.accepted:
        return 1;
      case OrderStatus.packing:
        return 2;
      case OrderStatus.ready:
        return 3;
      case OrderStatus.outForDelivery:
        return 4;
      case OrderStatus.delivered:
        return 5;
      case OrderStatus.cancelled:
      case OrderStatus.refunded:
        return -1;
    }
  }

  static const List<OrderStatus> timelineSteps = [
    OrderStatus.pending,
    OrderStatus.accepted,
    OrderStatus.packing,
    OrderStatus.ready,
    OrderStatus.outForDelivery,
    OrderStatus.delivered,
  ];
}
