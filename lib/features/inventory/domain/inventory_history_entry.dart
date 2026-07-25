class InventoryHistoryEntry {
  final String id;
  final String productId;
  final String changeType;
  final int quantityChange;
  final int resultingStock;
  final String? reason;
  final DateTime? createdAt;

  const InventoryHistoryEntry({
    required this.id,
    required this.productId,
    required this.changeType,
    required this.quantityChange,
    required this.resultingStock,
    this.reason,
    required this.createdAt,
  });

  factory InventoryHistoryEntry.fromJson(Map<String, dynamic> json) => InventoryHistoryEntry(
        id: json['id'].toString(),
        productId: json['product_id']?.toString() ?? '',
        changeType: json['change_type']?.toString() ?? '',
        quantityChange: (json['quantity_change'] as num?)?.toInt() ?? 0,
        resultingStock: (json['resulting_stock'] as num?)?.toInt() ?? 0,
        reason: json['reason']?.toString(),
        createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      );
}
