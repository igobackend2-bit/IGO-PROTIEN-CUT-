import '../../../../models/product_model.dart';

class WishlistItem {
  final String id;
  final Product product;
  final DateTime createdAt;

  const WishlistItem({required this.id, required this.product, required this.createdAt});

  factory WishlistItem.fromMap(Map<String, dynamic> map) {
    final productData = map['products'];
    final productMap = productData is Map ? Map<String, dynamic>.from(productData) : <String, dynamic>{};
    return WishlistItem(
      id: (map['id'] ?? '').toString(),
      product: Product.fromMap(productMap),
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
    );
  }
}
