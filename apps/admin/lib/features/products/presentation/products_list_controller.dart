import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/products_repository.dart';
import 'products_providers.dart';

class ProductsFilter {
  final String search;
  final String? category;
  final bool? isAvailable;
  final int limit;
  final int offset;

  const ProductsFilter({
    this.search = '',
    this.category,
    this.isAvailable,
    this.limit = 20,
    this.offset = 0,
  });

  ProductsFilter copyWith({
    String? search,
    Object? category = _unset,
    Object? isAvailable = _unset,
    int? offset,
  }) {
    return ProductsFilter(
      search: search ?? this.search,
      category: category == _unset ? this.category : category as String?,
      isAvailable: isAvailable == _unset ? this.isAvailable : isAvailable as bool?,
      limit: limit,
      offset: offset ?? this.offset,
    );
  }
}

const _unset = Object();

class ProductsFilterNotifier extends Notifier<ProductsFilter> {
  @override
  ProductsFilter build() => const ProductsFilter();

  void setSearch(String value) => state = state.copyWith(search: value, offset: 0);

  void setCategory(String? value) => state = state.copyWith(category: value, offset: 0);

  void setAvailability(bool? value) => state = state.copyWith(isAvailable: value, offset: 0);

  void setOffset(int value) => state = state.copyWith(offset: value);
}

final productsFilterProvider = NotifierProvider<ProductsFilterNotifier, ProductsFilter>(
  ProductsFilterNotifier.new,
);

class ProductsListController extends AsyncNotifier<ProductListResult> {
  @override
  Future<ProductListResult> build() async {
    final filter = ref.watch(productsFilterProvider);
    final repo = ref.watch(productsRepositoryProvider);
    return repo.list(
      search: filter.search,
      category: filter.category,
      isAvailable: filter.isAvailable,
      limit: filter.limit,
      offset: filter.offset,
    );
  }

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }
}

final productsListControllerProvider =
    AsyncNotifierProvider<ProductsListController, ProductListResult>(ProductsListController.new);
