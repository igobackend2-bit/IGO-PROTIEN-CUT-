import '../../../../models/product_model.dart';

enum ComboBundleType { fixed, mixMatch }

class ComboPackItem {
  final String id;
  final String productId;
  final int quantity;
  final Product? product;

  const ComboPackItem({required this.id, required this.productId, required this.quantity, this.product});

  factory ComboPackItem.fromMap(Map<String, dynamic> map) {
    final productMap = map['products'];
    return ComboPackItem(
      id: (map['id'] ?? '').toString(),
      productId: (map['product_id'] ?? '').toString(),
      quantity: (map['quantity'] as num?)?.toInt() ?? 1,
      product: (productMap is Map<String, dynamic>) ? Product.fromMap(productMap) : null,
    );
  }
}

class ComboPack {
  final String id;
  final String title;
  final String description;
  final double discount;
  final ComboBundleType bundleType;
  final int? pickCount;
  final String? bannerImageUrl;
  final bool active;
  final List<ComboPackItem> items;

  const ComboPack({
    required this.id,
    required this.title,
    required this.description,
    required this.discount,
    required this.bundleType,
    required this.active,
    required this.items,
    this.pickCount,
    this.bannerImageUrl,
  });

  /// Sum of each item's product price × quantity, before the combo
  /// discount — the "was" price shown struck through next to the deal.
  double get fullPrice => items.fold(0, (sum, item) => sum + ((item.product?.price ?? 0) * item.quantity));

  double get bundlePrice => (fullPrice - discount).clamp(0, fullPrice);

  factory ComboPack.fromMap(Map<String, dynamic> map) {
    final rawItems = map['combo_pack_items'];
    return ComboPack(
      id: (map['id'] ?? '').toString(),
      title: (map['title'] ?? '').toString(),
      description: (map['description'] ?? '').toString(),
      discount: (map['discount'] as num?)?.toDouble() ?? 0,
      bundleType: (map['bundle_type'] == 'mix_match') ? ComboBundleType.mixMatch : ComboBundleType.fixed,
      pickCount: (map['pick_count'] as num?)?.toInt(),
      bannerImageUrl: map['banner_image_url'] as String?,
      active: (map['active'] as bool?) ?? false,
      items: rawItems is List
          ? rawItems.whereType<Map<String, dynamic>>().map(ComboPackItem.fromMap).toList()
          : const [],
    );
  }
}
