import 'package:flutter/foundation.dart';

import '../../../../models/product_model.dart';

/// Typed wrapper around a raw `cart_items` row (+ joined product) returned
/// by [CartService], so presentation code works with a real [Product]
/// instead of re-indexing maps everywhere.
@immutable
class CartLineItem {
  final int id;
  final Product product;
  final int quantity;
  final bool isSavedForLater;

  const CartLineItem({
    required this.id,
    required this.product,
    required this.quantity,
    required this.isSavedForLater,
  });

  double get subtotal => product.price * quantity;

  factory CartLineItem.fromRow(Map<String, dynamic> row) {
    final productMap = row['products'];
    final product = Product.fromMap(productMap is Map ? Map<String, dynamic>.from(productMap) : const {});
    return CartLineItem(
      id: row['id'] as int,
      product: product,
      quantity: (row['quantity'] as num?)?.toInt() ?? 0,
      isSavedForLater: row['is_saved_for_later'] == true,
    );
  }
}
