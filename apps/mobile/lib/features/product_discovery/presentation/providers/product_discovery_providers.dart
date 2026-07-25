import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/product_discovery_repository_impl.dart';
import '../../domain/entities/product_filter_state.dart';
import '../../domain/entities/product_sort_option.dart';
import '../../domain/repositories/product_discovery_repository.dart';
import 'product_discovery_state.dart';

const _pageSize = 10;

/// Not autoDispose: keeps the repository (and its in-memory catalog cache
/// used for filter facets + suggestions) alive across repeated visits to
/// Product Discovery so re-opening it doesn't always re-fetch everything.
final productDiscoveryRepositoryProvider = Provider<ProductDiscoveryRepository>((ref) {
  return ProductDiscoveryRepositoryImpl();
});

final recentSearchesProvider = FutureProvider.autoDispose<List<String>>((ref) {
  return ref.watch(productDiscoveryRepositoryProvider).getRecentSearches();
});

final trendingSearchesProvider = FutureProvider.autoDispose<List<String>>((ref) {
  return ref.watch(productDiscoveryRepositoryProvider).getTrendingSearches();
});

final searchSuggestionsProvider =
    FutureProvider.autoDispose.family<List<String>, String>((ref, query) {
  return ref.watch(productDiscoveryRepositoryProvider).getSuggestions(query);
});

final productDiscoveryProvider =
    StateNotifierProvider.autoDispose<ProductDiscoveryNotifier, ProductDiscoveryState>((ref) {
  return ProductDiscoveryNotifier(
    ref.read(productDiscoveryRepositoryProvider),
    ref,
  );
});

class ProductDiscoveryNotifier extends StateNotifier<ProductDiscoveryState> {
  final ProductDiscoveryRepository _repository;
  final Ref _ref;
  int _requestToken = 0;

  ProductDiscoveryNotifier(this._repository, this._ref) : super(const ProductDiscoveryState());

  /// Called once when the screen opens. [initialArg] is whatever the caller
  /// navigated with — either a known protein-type/category name (from a
  /// category chip or the home banner) or free-text search terms (from a
  /// search bar). Resolved against the real category list once it's loaded
  /// so both call sites keep working without changes.
  Future<void> initialize(String? initialArg) async {
    state = state.copyWith(isLoadingFirstPage: true, clearError: true);
    try {
      final options = await _repository.loadFilterOptions();
      var filters = state.filters;

      if (initialArg != null && initialArg.trim().isNotEmpty) {
        final matchedCategory = options.proteinTypes.firstWhere(
          (c) => c.toLowerCase() == initialArg.trim().toLowerCase(),
          orElse: () => '',
        );
        filters = matchedCategory.isNotEmpty
            ? filters.copyWith(proteinTypes: {matchedCategory})
            : filters.copyWith(searchQuery: initialArg.trim());
      }

      state = state.copyWith(filterOptions: options, filters: filters);
      await _loadFirstPage();
    } catch (e) {
      state = state.copyWith(isLoadingFirstPage: false, error: e);
    }
  }

  Future<void> _loadFirstPage() async {
    final token = ++_requestToken;
    state = state.copyWith(isLoadingFirstPage: true, clearError: true, page: 0);
    try {
      final result = await _repository.fetchPage(filters: state.filters, page: 0, pageSize: _pageSize);
      if (token != _requestToken) return; // a newer request superseded this one
      state = state.copyWith(
        items: result.items,
        hasMore: result.serverHasMore,
        isLoadingFirstPage: false,
        page: 0,
      );
    } catch (e) {
      if (token != _requestToken) return;
      state = state.copyWith(isLoadingFirstPage: false, error: e);
    }
  }

  Future<void> refresh() => _loadFirstPage();

  Future<void> retry() => _loadFirstPage();

  Future<void> loadMore() async {
    if (state.isLoadingMore || !state.hasMore || state.isLoadingFirstPage) return;
    final token = _requestToken;
    final nextPage = state.page + 1;
    state = state.copyWith(isLoadingMore: true);
    try {
      final result = await _repository.fetchPage(filters: state.filters, page: nextPage, pageSize: _pageSize);
      if (token != _requestToken) return;
      state = state.copyWith(
        items: [...state.items, ...result.items],
        hasMore: result.serverHasMore,
        isLoadingMore: false,
        page: nextPage,
      );
    } catch (e) {
      if (token != _requestToken) return;
      // Keep existing items visible; just stop the "loading more" spinner.
      // The user can scroll again to retry.
      state = state.copyWith(isLoadingMore: false);
    }
  }

  Future<void> submitSearch(String query) async {
    final trimmed = query.trim();
    state = state.copyWith(filters: state.filters.copyWith(searchQuery: trimmed));
    if (trimmed.isNotEmpty) {
      await _repository.saveRecentSearch(trimmed);
      _ref.invalidate(recentSearchesProvider);
    }
    await _loadFirstPage();
  }

  void applyFilters(ProductFilterState newFilters) {
    state = state.copyWith(filters: newFilters);
    _loadFirstPage();
  }

  void setSort(ProductSortOption sort) {
    state = state.copyWith(filters: state.filters.copyWith(sort: sort));
    _loadFirstPage();
  }

  void toggleViewMode() {
    final next = state.filters.viewMode == ProductViewMode.grid
        ? ProductViewMode.list
        : ProductViewMode.grid;
    state = state.copyWith(filters: state.filters.copyWith(viewMode: next));
  }

  void clearFilters() {
    state = state.copyWith(filters: state.filters.clearAllFilters());
    _loadFirstPage();
  }
}
