import '../../data/models/product_review_model.dart';

/// If the review tables don't exist yet on the backend, methods here return
/// empty results instead of throwing — the UI shows a normal "no reviews
/// yet" empty state rather than an error screen. See [ReviewRepositoryImpl]
/// for the exact detection.
abstract class ReviewRepository {
  Future<List<ProductReview>> fetchReviews(String productId);

  /// Whether the current user has already reviewed this product (one review
  /// per user per product).
  Future<bool> hasReviewed(String productId);

  Future<ProductReview?> fetchMyReview(String productId);

  /// Most recent qualifying (non-cancelled) order that contains this
  /// product for the current user — null if they've never purchased it.
  /// Only users with a non-null result here are allowed to write a review.
  Future<String?> findVerifiedOrderId(String productId);

  Future<void> submitReview({
    required String productId,
    required String orderId,
    required int rating,
    String? title,
    required String comment,
    required List<String> photoUrls,
  });

  Future<void> updateReview({
    required String reviewId,
    required int rating,
    String? title,
    required String comment,
    required List<String> photoUrls,
  });

  Future<void> deleteReview(String reviewId);

  Future<bool> toggleHelpful(String reviewId);

  Future<String> uploadReviewPhoto(List<int> bytes, {required String folder, required String fileName});
}
