import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/product_model.dart';
import '../../services/product_service.dart';

/// Shared, app-wide catalog cache. Not autoDispose — Product Detail/
/// Discovery share one in-session fetch rather than each keeping their own
/// copy of the same query. Cart's "recommended products" deliberately does
/// NOT read this cache (see recommendedForCartProvider) — it needs fresh
/// data every time Cart opens so a product photo updated via the admin
/// tools shows up immediately, not whenever this session-long cache
/// happens to get invalidated next.
final productServiceProvider = Provider<ProductService>((ref) => ProductService());

final catalogSnapshotProvider = FutureProvider<List<Product>>((ref) {
  return ref.read(productServiceProvider).fetchProducts();
});
