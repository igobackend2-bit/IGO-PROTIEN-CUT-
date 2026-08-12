class OrderItem {
  final String id;
  final int quantity;
  final num price;
  final String? productId;
  final String? productName;
  final String? productImageUrl;

  const OrderItem({
    required this.id,
    required this.quantity,
    required this.price,
    this.productId,
    this.productName,
    this.productImageUrl,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    final product = json['products'] as Map?;
    return OrderItem(
      id: json['id'].toString(),
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      price: json['price'] as num? ?? 0,
      productId: json['product_id']?.toString(),
      productName: product?['name']?.toString(),
      productImageUrl: product?['image_url']?.toString(),
    );
  }
}
