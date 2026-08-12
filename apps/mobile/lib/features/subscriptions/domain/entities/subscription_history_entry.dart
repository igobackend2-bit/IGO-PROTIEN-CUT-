class SubscriptionHistoryEntry {
  final String id;
  final String subscriptionId;
  final String action;
  final DateTime createdAt;

  const SubscriptionHistoryEntry({
    required this.id,
    required this.subscriptionId,
    required this.action,
    required this.createdAt,
  });

  String get label => switch (action) {
        'created' => 'Subscription created',
        'paused' => 'Paused',
        'resumed' => 'Resumed',
        'skipped' => 'Delivery skipped',
        'edited' => 'Schedule updated',
        'order_created' => 'Order placed',
        'cancelled' => 'Cancelled',
        'reminder_sent' => 'Delivery reminder sent',
        _ => action,
      };

  factory SubscriptionHistoryEntry.fromMap(Map<String, dynamic> map) {
    return SubscriptionHistoryEntry(
      id: (map['id'] ?? '').toString(),
      subscriptionId: (map['subscription_id'] ?? '').toString(),
      action: (map['action'] ?? '').toString(),
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
    );
  }
}
