import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/product_review_model.dart';
import '../../domain/repositories/review_repository.dart';
import 'product_detail_providers.dart';

// ─── Full review list — mutation-capable, backs the Review Section and the
// dedicated all-reviews screen. `reviewsProvider` in product_detail_providers
// stays a plain FutureProvider for the lightweight inline rating badge next
// to the product name, which never mutates anything.

class ReviewListState {
  final List<ProductReview> reviews;
  final bool isLoading;
  final Object? error;

  const ReviewListState({this.reviews = const [], this.isLoading = true, this.error});

  ReviewSummary get summary => ReviewSummary.fromReviews(reviews);

  ReviewListState copyWith({List<ProductReview>? reviews, bool? isLoading, Object? error, bool clearError = false}) {
    return ReviewListState(
      reviews: reviews ?? this.reviews,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

final reviewListProvider = StateNotifierProvider.autoDispose.family<ReviewListNotifier, ReviewListState, String>((ref, productId) {
  return ReviewListNotifier(ref.read(reviewRepositoryProvider), productId);
});

class ReviewListNotifier extends StateNotifier<ReviewListState> {
  final ReviewRepository _repository;
  final String _productId;

  ReviewListNotifier(this._repository, this._productId) : super(const ReviewListState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final reviews = await _repository.fetchReviews(_productId);
      state = state.copyWith(reviews: reviews, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e);
    }
  }

  Future<void> refresh() => load();
  Future<void> retry() => load();

  Future<void> toggleHelpful(ProductReview review) async {
    final previous = state.reviews;
    final nowHelpful = !review.isHelpfulByMe;
    state = state.copyWith(
      reviews: previous
          .map((r) => r.id == review.id
              ? r.copyWith(isHelpfulByMe: nowHelpful, helpfulCount: r.helpfulCount + (nowHelpful ? 1 : -1))
              : r)
          .toList(),
    );
    try {
      await _repository.toggleHelpful(review.id);
    } catch (_) {
      state = state.copyWith(reviews: previous); // rollback
    }
  }
}

// ─── Sort ───────────────────────────────────────────────────────────────

enum ReviewSortOption { mostRecent, highestRating, lowestRating, mostHelpful }

extension ReviewSortOptionLabel on ReviewSortOption {
  String get label => switch (this) {
        ReviewSortOption.mostRecent => 'Most Recent',
        ReviewSortOption.highestRating => 'Highest Rating',
        ReviewSortOption.lowestRating => 'Lowest Rating',
        ReviewSortOption.mostHelpful => 'Most Helpful',
      };
}

final reviewSortProvider = StateProvider.autoDispose<ReviewSortOption>((ref) => ReviewSortOption.mostRecent);

final sortedReviewsProvider = Provider.autoDispose.family<List<ProductReview>, String>((ref, productId) {
  final reviews = List<ProductReview>.from(ref.watch(reviewListProvider(productId)).reviews);
  final sort = ref.watch(reviewSortProvider);
  switch (sort) {
    case ReviewSortOption.mostRecent:
      reviews.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      break;
    case ReviewSortOption.highestRating:
      reviews.sort((a, b) => b.rating.compareTo(a.rating));
      break;
    case ReviewSortOption.lowestRating:
      reviews.sort((a, b) => a.rating.compareTo(b.rating));
      break;
    case ReviewSortOption.mostHelpful:
      reviews.sort((a, b) => b.helpfulCount.compareTo(a.helpfulCount));
      break;
  }
  return reviews;
});

// ─── Write-review eligibility ──────────────────────────────────────────

class ReviewEligibility {
  final bool hasReviewed;
  final String? verifiedOrderId;

  const ReviewEligibility({required this.hasReviewed, required this.verifiedOrderId});

  bool get canWriteReview => !hasReviewed && verifiedOrderId != null;
}

final reviewEligibilityProvider = FutureProvider.autoDispose.family<ReviewEligibility, String>((ref, productId) async {
  final repository = ref.watch(reviewRepositoryProvider);
  final results = await Future.wait([repository.hasReviewed(productId), repository.findVerifiedOrderId(productId)]);
  return ReviewEligibility(hasReviewed: results[0] as bool, verifiedOrderId: results[1] as String?);
});
