class WalletTransaction {
  final String id;
  final String type; // cashback | reward_credit | referral_bonus | debit | other
  final double amount;
  final String status; // pending | credited
  final String? description;
  final DateTime createdAt;

  const WalletTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.status,
    this.description,
    required this.createdAt,
  });

  bool get isCredit => amount >= 0;
  bool get isPending => status == 'pending';

  factory WalletTransaction.fromMap(Map<String, dynamic> map) {
    return WalletTransaction(
      id: (map['id'] ?? '').toString(),
      type: (map['type'] ?? 'other').toString(),
      amount: (map['amount'] as num?)?.toDouble() ?? 0,
      status: (map['status'] ?? 'credited').toString(),
      description: map['description'] as String?,
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
    );
  }
}
