class ReviewReply {
  final String id;
  final String reviewId;
  final String reply;
  final String repliedBy;
  final DateTime createdAt;

  const ReviewReply({
    required this.id,
    required this.reviewId,
    required this.reply,
    required this.repliedBy,
    required this.createdAt,
  });

  factory ReviewReply.fromMap(Map<String, dynamic> map) {
    return ReviewReply(
      id: (map['id'] ?? '').toString(),
      reviewId: (map['review_id'] ?? '').toString(),
      reply: (map['reply'] ?? '').toString(),
      repliedBy: (map['replied_by'] ?? 'Protein Cuts Team').toString(),
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
    );
  }
}

class ProductReview {
  final String id;
  final String productId;
  final String userId;
  final String userName;
  final String? orderId;
  final int rating;
  final String? title;
  final String comment;
  final List<String> photos;
  final bool verifiedPurchase;
  final int helpfulCount;
  final bool isHelpfulByMe;
  final ReviewReply? reply;
  final DateTime createdAt;
  final DateTime updatedAt;

  const ProductReview({
    required this.id,
    required this.productId,
    required this.userId,
    required this.userName,
    this.orderId,
    required this.rating,
    this.title,
    required this.comment,
    this.photos = const [],
    this.verifiedPurchase = false,
    this.helpfulCount = 0,
    this.isHelpfulByMe = false,
    this.reply,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ProductReview.fromMap(Map<String, dynamic> map, {bool isHelpfulByMe = false, ReviewReply? reply}) {
    return ProductReview(
      id: (map['id'] ?? '').toString(),
      productId: map['product_id'].toString(),
      userId: (map['user_id'] ?? '').toString(),
      userName: (map['user_name'] as String?)?.trim().isNotEmpty == true
          ? map['user_name'] as String
          : 'Verified Buyer',
      orderId: map['order_id']?.toString(),
      rating: (map['rating'] as num?)?.toInt() ?? 5,
      title: (map['title'] as String?)?.trim().isEmpty == true ? null : map['title'] as String?,
      comment: (map['comment'] ?? '').toString(),
      photos: (map['photos'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      verifiedPurchase: map['verified_purchase'] as bool? ?? false,
      helpfulCount: (map['helpful_count'] as num?)?.toInt() ?? 0,
      isHelpfulByMe: isHelpfulByMe,
      reply: reply,
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
      updatedAt: DateTime.tryParse(map['updated_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
    );
  }

  ProductReview copyWith({int? helpfulCount, bool? isHelpfulByMe}) {
    return ProductReview(
      id: id,
      productId: productId,
      userId: userId,
      userName: userName,
      orderId: orderId,
      rating: rating,
      title: title,
      comment: comment,
      photos: photos,
      verifiedPurchase: verifiedPurchase,
      helpfulCount: helpfulCount ?? this.helpfulCount,
      isHelpfulByMe: isHelpfulByMe ?? this.isHelpfulByMe,
      reply: reply,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}

class ReviewSummary {
  final double average;
  final int count;
  final Map<int, int> starCounts; // 1..5 -> count

  const ReviewSummary({required this.average, required this.count, required this.starCounts});

  static const empty = ReviewSummary(average: 0, count: 0, starCounts: {});

  /// % of reviews rated 4★ or 5★ — the "would recommend" stat.
  double get recommendPercent {
    if (count == 0) return 0;
    final positive = (starCounts[4] ?? 0) + (starCounts[5] ?? 0);
    return positive / count * 100;
  }

  factory ReviewSummary.fromReviews(List<ProductReview> reviews) {
    if (reviews.isEmpty) return empty;
    final starCounts = <int, int>{1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    var total = 0;
    for (final r in reviews) {
      final clamped = r.rating.clamp(1, 5);
      starCounts[clamped] = (starCounts[clamped] ?? 0) + 1;
      total += clamped;
    }
    return ReviewSummary(
      average: total / reviews.length,
      count: reviews.length,
      starCounts: starCounts,
    );
  }
}
