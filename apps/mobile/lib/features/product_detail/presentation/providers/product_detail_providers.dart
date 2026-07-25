import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../models/product_model.dart';
import '../../../../shared/providers/catalog_providers.dart';
import '../../data/models/product_review_model.dart';
import '../../data/repositories/review_repository_impl.dart';
import '../../data/services/product_detail_content_service.dart';
import '../../domain/repositories/review_repository.dart';

final reviewRepositoryProvider = Provider<ReviewRepository>((ref) => ReviewRepositoryImpl());

final reviewsProvider =
    FutureProvider.autoDispose.family<List<ProductReview>, String>((ref, productId) {
  return ref.watch(reviewRepositoryProvider).fetchReviews(productId);
});

final hasReviewedProvider = FutureProvider.autoDispose.family<bool, String>((ref, productId) {
  return ref.watch(reviewRepositoryProvider).hasReviewed(productId);
});

final relatedProductsProvider =
    FutureProvider.autoDispose.family<List<Product>, Product>((ref, product) async {
  final catalog = await ref.watch(catalogSnapshotProvider.future);
  return catalog
      .where((p) => p.category == product.category && p.id != product.id)
      .take(10)
      .toList();
});

final frequentlyBoughtTogetherProvider =
    FutureProvider.autoDispose.family<List<Product>, Product>((ref, product) async {
  final catalog = await ref.watch(catalogSnapshotProvider.future);
  return ProductDetailContentService.frequentlyBoughtWith(product, catalog);
});
