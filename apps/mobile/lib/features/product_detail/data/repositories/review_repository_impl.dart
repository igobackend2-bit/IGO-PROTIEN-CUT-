import '../../../../services/review_service.dart';
import '../../domain/repositories/review_repository.dart';
import '../models/product_review_model.dart';

class ReviewRepositoryImpl implements ReviewRepository {
  final ReviewService _service;
  ReviewRepositoryImpl({ReviewService? service}) : _service = service ?? ReviewService();

  @override
  Future<List<ProductReview>> fetchReviews(String productId) async {
    final rawReviews = await _service.fetchReviews(productId);
    if (rawReviews.isEmpty) return [];

    final reviewIds = rawReviews.map((r) => r['id'].toString()).toList();
    final results = await Future.wait([
      _service.fetchReplies(reviewIds),
      _service.fetchMyHelpfulVotes(reviewIds),
    ]);
    final rawReplies = results[0] as List<Map<String, dynamic>>;
    final myVotes = results[1] as Set<String>;

    final repliesByReviewId = <String, ReviewReply>{};
    for (final row in rawReplies) {
      final reply = ReviewReply.fromMap(row);
      // Keep the most recent reply if there happens to be more than one.
      final existing = repliesByReviewId[reply.reviewId];
      if (existing == null || reply.createdAt.isAfter(existing.createdAt)) {
        repliesByReviewId[reply.reviewId] = reply;
      }
    }

    return rawReviews
        .map((row) => ProductReview.fromMap(
              row,
              isHelpfulByMe: myVotes.contains(row['id'].toString()),
              reply: repliesByReviewId[row['id'].toString()],
            ))
        .toList();
  }

  @override
  Future<bool> hasReviewed(String productId) => _service.hasReviewed(productId);

  @override
  Future<ProductReview?> fetchMyReview(String productId) async {
    final row = await _service.fetchMyReview(productId);
    return row == null ? null : ProductReview.fromMap(row);
  }

  @override
  Future<String?> findVerifiedOrderId(String productId) => _service.findVerifiedOrderId(productId);

  @override
  Future<void> submitReview({
    required String productId,
    required String orderId,
    required int rating,
    String? title,
    required String comment,
    required List<String> photoUrls,
  }) {
    return _service.submitReview(
      productId: productId,
      orderId: orderId,
      rating: rating,
      title: title,
      comment: comment,
      photoUrls: photoUrls,
    );
  }

  @override
  Future<void> updateReview({
    required String reviewId,
    required int rating,
    String? title,
    required String comment,
    required List<String> photoUrls,
  }) {
    return _service.updateReview(reviewId: reviewId, rating: rating, title: title, comment: comment, photoUrls: photoUrls);
  }

  @override
  Future<void> deleteReview(String reviewId) => _service.deleteReview(reviewId);

  @override
  Future<bool> toggleHelpful(String reviewId) => _service.toggleHelpful(reviewId);

  @override
  Future<String> uploadReviewPhoto(List<int> bytes, {required String folder, required String fileName}) {
    return _service.uploadReviewPhoto(bytes, folder: folder, fileName: fileName);
  }
}
