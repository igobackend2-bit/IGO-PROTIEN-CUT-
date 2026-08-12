import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../models/product_model.dart';
import '../../domain/entities/product_filter_options.dart';
import '../../domain/entities/product_filter_state.dart';
import '../../domain/entities/product_page_result.dart';
import '../../domain/entities/weight_bucket.dart';
import '../../domain/repositories/product_discovery_repository.dart';
import '../services/recent_search_service.dart';

/// Category/search/price/sort are pushed down to Supabase (server-side,
/// paginated via `.range()`). Weight bucket, brand, availability and rating
/// are applied client-side on each fetched page, since those facets aren't
/// clean queryable columns yet (weight is free text; brand/availability/
/// rating may not exist in the table at all — see [Product]'s optional
/// fields). `serverHasMore` is computed from the raw page size so infinite
/// scroll keeps requesting further pages even when client-side filtering
/// thins a given page down to very few (or zero) visible items.
class ProductDiscoveryRepositoryImpl implements ProductDiscoveryRepository {
  final SupabaseClient _client;
  final RecentSearchService _recentSearchService;

  List<Product>? _catalogCache;

  ProductDiscoveryRepositoryImpl({
    SupabaseClient? client,
    RecentSearchService? recentSearchService,
  })  : _client = client ?? Supabase.instance.client,
        _recentSearchService = recentSearchService ?? RecentSearchService();

  Future<List<Product>> _loadCatalogSnapshot() async {
    final cached = _catalogCache;
    if (cached != null) return cached;
    final response = await _client.from('products').select().order('name', ascending: true);
    final list = (response as List)
        .map((e) => Product.fromMap(e as Map<String, dynamic>))
        .toList();
    _catalogCache = list;
    return list;
  }

  @override
  Future<ProductFilterOptions> loadFilterOptions() async {
    final products = await _loadCatalogSnapshot();
    if (products.isEmpty) return ProductFilterOptions.empty;

    final proteinTypes = products.map((p) => p.category).toSet().toList()..sort();

    var minPrice = products.first.price;
    var maxPrice = products.first.price;
    for (final p in products) {
      if (p.price < minPrice) minPrice = p.price;
      if (p.price > maxPrice) maxPrice = p.price;
    }

    final presentBuckets = <WeightBucket>{};
    for (final p in products) {
      final grams = WeightBucket.parseGrams(p.weight);
      if (grams == null) continue;
      for (final bucket in WeightBucket.values) {
        if (bucket.matches(grams)) presentBuckets.add(bucket);
      }
    }
    final orderedBuckets = WeightBucket.values.where(presentBuckets.contains).toList();

    final brands = products.map((p) => p.brand).whereType<String>().toSet().toList()..sort();

    return ProductFilterOptions(
      proteinTypes: proteinTypes,
      minPrice: minPrice,
      maxPrice: maxPrice,
      availableWeightBuckets: orderedBuckets,
      brands: brands,
      hasAvailabilityData: products.any((p) => !p.isAvailable),
      hasRatingData: products.any((p) => p.rating != null),
    );
  }

  @override
  Future<ProductPageResult> fetchPage({
    required ProductFilterState filters,
    required int page,
    required int pageSize,
  }) async {
    var query = _client.from('products').select();

    if (filters.proteinTypes.isNotEmpty) {
      query = query.inFilter('category', filters.proteinTypes.toList());
    }
    if (filters.searchQuery.trim().isNotEmpty) {
      query = query.ilike('name', '%${filters.searchQuery.trim()}%');
    }
    if (filters.priceRange != null) {
      query = query
          .gte('price', filters.priceRange!.start)
          .lte('price', filters.priceRange!.end);
    }

    final from = page * pageSize;
    final to = from + pageSize - 1;

    final response = await query
        .order(filters.sort.column, ascending: filters.sort.ascending)
        .range(from, to);

    final rawItems = (response as List)
        .map((e) => Product.fromMap(e as Map<String, dynamic>))
        .toList();
    final serverHasMore = rawItems.length == pageSize;

    final visibleItems = rawItems.where((p) => _passesClientFacets(p, filters)).toList();

    return ProductPageResult(items: visibleItems, serverHasMore: serverHasMore);
  }

  bool _passesClientFacets(Product product, ProductFilterState filters) {
    if (filters.weightBuckets.isNotEmpty) {
      final grams = WeightBucket.parseGrams(product.weight);
      if (grams == null) return false;
      if (!filters.weightBuckets.any((b) => b.matches(grams))) return false;
    }
    if (filters.brands.isNotEmpty) {
      if (product.brand == null || !filters.brands.contains(product.brand)) return false;
    }
    if (filters.onlyAvailable && !product.isAvailable) return false;
    if (filters.minRating != null) {
      if (product.rating == null || product.rating! < filters.minRating!) return false;
    }
    return true;
  }

  @override
  Future<List<String>> getSuggestions(String query) async {
    final trimmed = query.trim().toLowerCase();
    if (trimmed.isEmpty) return [];

    final products = await _loadCatalogSnapshot();
    final matches = <String>{};

    for (final p in products) {
      if (matches.length >= 8) break;
      if (p.name.toLowerCase().contains(trimmed)) matches.add(p.name);
    }
    if (matches.length < 8) {
      for (final p in products) {
        if (matches.length >= 8) break;
        if (p.category.toLowerCase().contains(trimmed)) matches.add(p.category);
      }
    }
    return matches.toList();
  }

  @override
  Future<List<String>> getTrendingSearches() async {
    // No search-analytics backend yet — curated placeholder, kept small and
    // relevant. Swap for a real trending aggregation once search events are
    // tracked server-side; nothing else in the presentation layer changes.
    return const [
      'Chicken Breast',
      'Mutton Curry Cut',
      'Salmon',
      'Prawns',
      'Farm Eggs',
      'Ribeye Steak',
    ];
  }

  @override
  Future<List<String>> getRecentSearches() => _recentSearchService.getRecentSearches();

  @override
  Future<void> saveRecentSearch(String term) => _recentSearchService.addSearch(term);

  @override
  Future<void> clearRecentSearches() => _recentSearchService.clear();
}
