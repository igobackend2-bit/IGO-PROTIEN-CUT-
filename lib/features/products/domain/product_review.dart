class ProductReview {
  final int id;
  final String productId;
  final int rating;
  final String? comment;
  final bool isHidden;
  final DateTime? createdAt;

  const ProductReview({
    required this.id,
    required this.productId,
    required this.rating,
    this.comment,
    required this.isHidden,
    required this.createdAt,
  });

  factory ProductReview.fromJson(Map<String, dynamic> json) => ProductReview(
        id: (json['id'] as num).toInt(),
        productId: json['product_id']?.toString() ?? '',
        rating: (json['rating'] as num?)?.toInt() ?? 0,
        comment: json['comment']?.toString(),
        isHidden: json['is_hidden'] as bool? ?? false,
        createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      );
}
