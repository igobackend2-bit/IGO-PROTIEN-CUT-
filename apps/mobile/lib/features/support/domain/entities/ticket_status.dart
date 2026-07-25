import 'package:flutter/material.dart';

/// Matches `support_tickets.status`. Also reused, with return-specific
/// labels, to represent the return/pickup progress for `return`-category
/// tickets ([TicketStatus.returnLabel]) rather than introducing a second,
/// independently-tracked status field with nothing real driving it.
enum TicketStatus {
  open('Open', Color(0xFF2471A3)),
  inProgress('In Progress', Color(0xFFB7950B)),
  waiting('Waiting', Color(0xFFBA4A00)),
  resolved('Resolved', Color(0xFF117A65)),
  closed('Closed', Color(0xFF7F8C8D));

  final String label;
  final Color color;
  const TicketStatus(this.label, this.color);

  static TicketStatus fromString(String? value) {
    final normalized = (value ?? '').trim().toLowerCase();
    return TicketStatus.values.firstWhere(
      (s) => s.label.toLowerCase() == normalized,
      orElse: () => TicketStatus.open,
    );
  }

  bool get isClosed => this == TicketStatus.closed || this == TicketStatus.resolved;

  int get timelineIndex => switch (this) {
        TicketStatus.open => 0,
        TicketStatus.inProgress => 1,
        TicketStatus.waiting => 2,
        TicketStatus.resolved => 3,
        TicketStatus.closed => 4,
      };

  static const List<TicketStatus> timelineSteps = [
    TicketStatus.open,
    TicketStatus.inProgress,
    TicketStatus.waiting,
    TicketStatus.resolved,
    TicketStatus.closed,
  ];

  /// Same underlying status, relabelled for a return's pickup/refund
  /// journey so Returns doesn't need its own status column.
  String get returnLabel => switch (this) {
        TicketStatus.open => 'Return Requested',
        TicketStatus.inProgress => 'Pickup Being Arranged',
        TicketStatus.waiting => 'Awaiting Pickup',
        TicketStatus.resolved => 'Picked Up / Refunded',
        TicketStatus.closed => 'Return Closed',
      };
}
