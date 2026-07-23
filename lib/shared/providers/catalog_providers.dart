import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/product_model.dart';
import '../../services/product_service.dart';

/// Shared, app-wide catalog cache. Not autoDispose — Product Detail and
/// Cart's "recommended products" both need the full product list and
/// should share one in-session fetch rather than each keeping their own
/// copy of the same query.
final productServiceProvider = Provider<ProductService>((ref) => ProductService());

final catalogSnapshotProvider = FutureProvider<List<Product>>((ref) {
  return ref.read(productServiceProvider).fetchProducts();
});
