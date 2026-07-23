import 'package:flutter/material.dart';

enum PaymentStatus {
  pending('Pending', Color(0xFFBA4A00)),
  processing('Processing', Color(0xFF2471A3)),
  success('Success', Color(0xFF117A65)),
  failed('Failed', Color(0xFFC0392B)),
  cancelled('Cancelled', Color(0xFF7F8C8D)),
  refunded('Refunded', Color(0xFF7D3C98));

  final String label;
  final Color color;
  const PaymentStatus(this.label, this.color);

  static PaymentStatus fromString(String? value) {
    final normalized = (value ?? '').trim().toLowerCase();
    return PaymentStatus.values.firstWhere(
      (s) => s.label.toLowerCase() == normalized,
      orElse: () => PaymentStatus.pending,
    );
  }
}

class Payment {
  final String id;
  final String orderId;
  final String userId;
  final String? transactionId;
  final double amount;
  final String paymentMethod;
  final PaymentStatus status;
  final String? gatewayReference;
  final String? refundStatus;
  final String? refundReason;
  final double? refundAmount;
  final DateTime? refundRequestedAt;
  final DateTime? refundCompletedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Payment({
    required this.id,
    required this.orderId,
    required this.userId,
    this.transactionId,
    required this.amount,
    required this.paymentMethod,
    required this.status,
    this.gatewayReference,
    this.refundStatus,
    this.refundReason,
    this.refundAmount,
    this.refundRequestedAt,
    this.refundCompletedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isRetryable => status == PaymentStatus.failed;
  bool get hasRefund => refundStatus != null;

  factory Payment.fromMap(Map<String, dynamic> map) {
    return Payment(
      id: (map['id'] ?? '').toString(),
      orderId: (map['order_id'] ?? '').toString(),
      userId: (map['user_id'] ?? '').toString(),
      transactionId: map['transaction_id'] as String?,
      amount: ((map['amount'] ?? 0) as num).toDouble(),
      paymentMethod: (map['payment_method'] ?? 'Cash on Delivery').toString(),
      status: PaymentStatus.fromString(map['status'] as String?),
      gatewayReference: map['gateway_reference'] as String?,
      refundStatus: map['refund_status'] as String?,
      refundReason: map['refund_reason'] as String?,
      refundAmount: (map['refund_amount'] as num?)?.toDouble(),
      refundRequestedAt: DateTime.tryParse(map['refund_requested_at']?.toString() ?? ''),
      refundCompletedAt: DateTime.tryParse(map['refund_completed_at']?.toString() ?? ''),
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(map['updated_at']?.toString() ?? '') ?? DateTime.now(),
    );
  }
}
