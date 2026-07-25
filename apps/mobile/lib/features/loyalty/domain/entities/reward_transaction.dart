class RewardTransaction {
  final String id;
  final String type; // order | referral | promotion | bonus
  final int points;
  final String? description;
  final DateTime createdAt;
  final DateTime? expiresAt;

  const RewardTransaction({
    required this.id,
    required this.type,
    required this.points,
    this.description,
    required this.createdAt,
    this.expiresAt,
  });

  bool get isExpired => expiresAt != null && expiresAt!.isBefore(DateTime.now());
  bool get isExpiringSoon => !isExpired && expiresAt != null && expiresAt!.isBefore(DateTime.now().add(const Duration(days: 30)));

  factory RewardTransaction.fromMap(Map<String, dynamic> map) {
    return RewardTransaction(
      id: (map['id'] ?? '').toString(),
      type: (map['type'] ?? 'bonus').toString(),
      points: (map['points'] as num?)?.toInt() ?? 0,
      description: map['description'] as String?,
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
      expiresAt: DateTime.tryParse(map['expires_at']?.toString() ?? '')?.toLocal(),
    );
  }
}
