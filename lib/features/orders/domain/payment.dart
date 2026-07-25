class Payment {
  final String id;
  final String? orderId;
  final num amount;
  final String status;
  final String? paymentMethod;
  final String? refundStatus;
  final num? refundAmount;
  final DateTime? createdAt;

  const Payment({
    required this.id,
    this.orderId,
    required this.amount,
    required this.status,
    this.paymentMethod,
    this.refundStatus,
    this.refundAmount,
    required this.createdAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) => Payment(
        id: json['id'].toString(),
        orderId: json['order_id']?.toString(),
        amount: json['amount'] as num? ?? 0,
        status: json['status']?.toString() ?? 'Unknown',
        paymentMethod: json['payment_method']?.toString(),
        refundStatus: json['refund_status']?.toString(),
        refundAmount: json['refund_amount'] as num?,
        createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      );
}
