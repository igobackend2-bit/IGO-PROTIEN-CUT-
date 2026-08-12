import 'package:flutter/foundation.dart';

import '../../../../models/product_model.dart';
import '../../domain/entities/product_filter_options.dart';
import '../../domain/entities/product_filter_state.dart';

@immutable
class ProductDiscoveryState {
  final List<Product> items;
  final bool isLoadingFirstPage;
  final bool isLoadingMore;
  final bool hasMore;
  final Object? error;
  final ProductFilterState filters;
  final ProductFilterOptions filterOptions;
  final int page;

  const ProductDiscoveryState({
    this.items = const [],
    this.isLoadingFirstPage = true,
    this.isLoadingMore = false,
    this.hasMore = true,
    this.error,
    this.filters = const ProductFilterState(),
    this.filterOptions = ProductFilterOptions.empty,
    this.page = 0,
  });

  bool get isEmpty => !isLoadingFirstPage && error == null && items.isEmpty;

  ProductDiscoveryState copyWith({
    List<Product>? items,
    bool? isLoadingFirstPage,
    bool? isLoadingMore,
    bool? hasMore,
    Object? error,
    bool clearError = false,
    ProductFilterState? filters,
    ProductFilterOptions? filterOptions,
    int? page,
  }) {
    return ProductDiscoveryState(
      items: items ?? this.items,
      isLoadingFirstPage: isLoadingFirstPage ?? this.isLoadingFirstPage,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      hasMore: hasMore ?? this.hasMore,
      error: clearError ? null : (error ?? this.error),
      filters: filters ?? this.filters,
      filterOptions: filterOptions ?? this.filterOptions,
      page: page ?? this.page,
    );
  }
}
