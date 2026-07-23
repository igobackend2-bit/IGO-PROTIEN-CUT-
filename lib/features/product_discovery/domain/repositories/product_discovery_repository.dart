import '../entities/product_filter_options.dart';
import '../entities/product_filter_state.dart';
import '../entities/product_page_result.dart';

abstract class ProductDiscoveryRepository {
  /// Facets available to filter by, derived from the live catalog. Cached
  /// by the caller — this does one full-catalog read.
  Future<ProductFilterOptions> loadFilterOptions();

  /// One page of products matching [filters]. Category/search/price/sort
  /// are applied server-side; weight/brand/availability/rating are applied
  /// client-side on top since those facets aren't clean queryable columns.
  Future<ProductPageResult> fetchPage({
    required ProductFilterState filters,
    required int page,
    required int pageSize,
  });

  /// Lightweight name/category matches for search-as-you-type, drawn from
  /// the same cached catalog used for filter options.
  Future<List<String>> getSuggestions(String query);

  Future<List<String>> getTrendingSearches();

  Future<List<String>> getRecentSearches();

  Future<void> saveRecentSearch(String term);

  Future<void> clearRecentSearches();
}
