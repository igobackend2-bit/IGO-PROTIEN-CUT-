import 'package:flutter/material.dart';

/// Matches `support_tickets.category` — Order Help's issue types plus a
/// general 'other' bucket for tickets not tied to a specific order problem.
/// 'return' doubles as the Returns flow's category (see [SupportTicket] doc).
enum TicketCategory {
  missingItem,
  wrongItem,
  damagedItem,
  deliveryIssue,
  paymentIssue,
  returnRequest,
  other;

  static TicketCategory fromString(String? value) => switch (value) {
        'missing_item' => TicketCategory.missingItem,
        'wrong_item' => TicketCategory.wrongItem,
        'damaged_item' => TicketCategory.damagedItem,
        'delivery_issue' => TicketCategory.deliveryIssue,
        'payment_issue' => TicketCategory.paymentIssue,
        'return' => TicketCategory.returnRequest,
        _ => TicketCategory.other,
      };

  String get value => switch (this) {
        TicketCategory.missingItem => 'missing_item',
        TicketCategory.wrongItem => 'wrong_item',
        TicketCategory.damagedItem => 'damaged_item',
        TicketCategory.deliveryIssue => 'delivery_issue',
        TicketCategory.paymentIssue => 'payment_issue',
        TicketCategory.returnRequest => 'return',
        TicketCategory.other => 'other',
      };

  String get label => switch (this) {
        TicketCategory.missingItem => 'Missing Item',
        TicketCategory.wrongItem => 'Wrong Item',
        TicketCategory.damagedItem => 'Damaged Item',
        TicketCategory.deliveryIssue => 'Delivery Issue',
        TicketCategory.paymentIssue => 'Payment Issue',
        TicketCategory.returnRequest => 'Return Request',
        TicketCategory.other => 'Something Else',
      };

  IconData get icon => switch (this) {
        TicketCategory.missingItem => Icons.remove_shopping_cart_rounded,
        TicketCategory.wrongItem => Icons.swap_horiz_rounded,
        TicketCategory.damagedItem => Icons.broken_image_rounded,
        TicketCategory.deliveryIssue => Icons.delivery_dining_rounded,
        TicketCategory.paymentIssue => Icons.payments_rounded,
        TicketCategory.returnRequest => Icons.assignment_return_rounded,
        TicketCategory.other => Icons.help_outline_rounded,
      };

  /// The five real "Order Help" issue types shown when reporting a problem
  /// with a specific order (excludes `other`/`returnRequest`, which have
  /// their own dedicated entry points).
  static const orderIssueTypes = [
    TicketCategory.missingItem,
    TicketCategory.wrongItem,
    TicketCategory.damagedItem,
    TicketCategory.deliveryIssue,
    TicketCategory.paymentIssue,
  ];
}
