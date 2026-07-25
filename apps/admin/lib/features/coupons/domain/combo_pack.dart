class ComboPackItem {
  final String productId;
  final int quantity;

  const ComboPackItem({required this.productId, required this.quantity});

  factory ComboPackItem.fromJson(Map<String, dynamic> json) => ComboPackItem(
        productId: json['product_id']?.toString() ?? '',
        quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      );

  Map<String, dynamic> toPayload() => {'productId': productId, 'quantity': quantity};
}

class ComboPack {
  final String id;
  final String title;
  final String? description;
  final num discount;
  final String bundleType;
  final int? pickCount;
  final String? bannerImageUrl;
  final bool active;
  final List<ComboPackItem> items;

  const ComboPack({
    required this.id,
    required this.title,
    this.description,
    required this.discount,
    required this.bundleType,
    this.pickCount,
    this.bannerImageUrl,
    required this.active,
    this.items = const [],
  });

  factory ComboPack.fromJson(Map<String, dynamic> json) {
    final itemsJson = json['combo_pack_items'] as List?;
    return ComboPack(
      id: json['id'].toString(),
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      discount: json['discount'] as num? ?? 0,
      bundleType: json['bundle_type']?.toString() ?? 'fixed',
      pickCount: (json['pick_count'] as num?)?.toInt(),
      bannerImageUrl: json['banner_image_url']?.toString(),
      active: json['active'] as bool? ?? true,
      items: (itemsJson ?? const [])
          .map((e) => ComboPackItem.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }
}
