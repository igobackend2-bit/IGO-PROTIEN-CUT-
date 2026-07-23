import 'package:flutter/material.dart';

import 'product_sort_option.dart';
import 'weight_bucket.dart';

enum ProductViewMode { grid, list }

/// Everything currently selected by the user on the Product Discovery
/// screen — one immutable value the notifier rebuilds the query from.
@immutable
class ProductFilterState {
  final String searchQuery;
  final Set<String> proteinTypes;
  final Set<WeightBucket> weightBuckets;
  final RangeValues? priceRange;
  final bool onlyAvailable;
  final double? minRating;
  final Set<String> brands;
  final ProductSortOption sort;
  final ProductViewMode viewMode;

  const ProductFilterState({
    this.searchQuery = '',
    this.proteinTypes = const {},
    this.weightBuckets = const {},
    this.priceRange,
    this.onlyAvailable = false,
    this.minRating,
    this.brands = const {},
    this.sort = ProductSortOption.relevance,
    this.viewMode = ProductViewMode.grid,
  });

  int get activeFilterCount =>
      proteinTypes.length +
      weightBuckets.length +
      brands.length +
      (priceRange != null ? 1 : 0) +
      (onlyAvailable ? 1 : 0) +
      (minRating != null ? 1 : 0);

  bool get hasAnyFilter => activeFilterCount > 0;

  ProductFilterState copyWith({
    String? searchQuery,
    Set<String>? proteinTypes,
    Set<WeightBucket>? weightBuckets,
    RangeValues? priceRange,
    bool clearPriceRange = false,
    bool? onlyAvailable,
    double? minRating,
    bool clearMinRating = false,
    Set<String>? brands,
    ProductSortOption? sort,
    ProductViewMode? viewMode,
  }) {
    return ProductFilterState(
      searchQuery: searchQuery ?? this.searchQuery,
      proteinTypes: proteinTypes ?? this.proteinTypes,
      weightBuckets: weightBuckets ?? this.weightBuckets,
      priceRange: clearPriceRange ? null : (priceRange ?? this.priceRange),
      onlyAvailable: onlyAvailable ?? this.onlyAvailable,
      minRating: clearMinRating ? null : (minRating ?? this.minRating),
      brands: brands ?? this.brands,
      sort: sort ?? this.sort,
      viewMode: viewMode ?? this.viewMode,
    );
  }

  ProductFilterState clearAllFilters() {
    return ProductFilterState(searchQuery: searchQuery, sort: sort, viewMode: viewMode);
  }
}
