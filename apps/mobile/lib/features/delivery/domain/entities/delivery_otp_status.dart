class DeliveryOtpStatus {
  final String id;
  final String orderId;
  final String otpCode;
  final bool isVerified;
  final DateTime? verifiedAt;
  final int attempts;
  final DateTime? expiresAt;

  const DeliveryOtpStatus({
    required this.id,
    required this.orderId,
    required this.otpCode,
    required this.isVerified,
    required this.attempts,
    this.verifiedAt,
    this.expiresAt,
  });

  bool get isExpired => expiresAt != null && expiresAt!.isBefore(DateTime.now());

  factory DeliveryOtpStatus.fromMap(Map<String, dynamic> map) {
    return DeliveryOtpStatus(
      id: (map['id'] ?? '').toString(),
      orderId: (map['order_id'] ?? '').toString(),
      otpCode: (map['otp_code'] ?? '').toString(),
      isVerified: (map['is_verified'] as bool?) ?? false,
      attempts: (map['attempts'] as num?)?.toInt() ?? 0,
      verifiedAt: DateTime.tryParse(map['verified_at']?.toString() ?? '')?.toLocal(),
      expiresAt: DateTime.tryParse(map['expires_at']?.toString() ?? '')?.toLocal(),
    );
  }
}
