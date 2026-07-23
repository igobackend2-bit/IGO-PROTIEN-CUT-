import 'weight_bucket.dart';

/// Facets available to filter by, derived from the current catalog. Any
/// facet backed by a column that doesn't exist yet in Supabase (brand,
/// rating, availability) simply comes back empty/false here — the UI hides
/// that filter section instead of showing a control that can't do anything.
class ProductFilterOptions {
  final List<String> proteinTypes; // == product categories
  final double minPrice;
  final double maxPrice;
  final List<WeightBucket> availableWeightBuckets;
  final List<String> brands;
  final bool hasAvailabilityData;
  final bool hasRatingData;

  const ProductFilterOptions({
    required this.proteinTypes,
    required this.minPrice,
    required this.maxPrice,
    required this.availableWeightBuckets,
    required this.brands,
    required this.hasAvailabilityData,
    required this.hasRatingData,
  });

  static const empty = ProductFilterOptions(
    proteinTypes: [],
    minPrice: 0,
    maxPrice: 1000,
    availableWeightBuckets: [],
    brands: [],
    hasAvailabilityData: false,
    hasRatingData: false,
  );
}
