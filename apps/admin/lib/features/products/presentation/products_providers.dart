import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/core_providers.dart';
import '../data/products_repository_impl.dart';
import '../domain/products_repository.dart';

final productsRepositoryProvider = Provider<ProductsRepository>((ref) {
  return ProductsRepositoryImpl(ref.watch(edgeFunctionClientProvider), ref.watch(supabaseClientProvider));
});
