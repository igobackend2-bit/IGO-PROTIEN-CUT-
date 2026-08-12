/// Coarse weight ranges derived from the free-text `weight` field on
/// products (e.g. "500g", "1kg") since there's no structured numeric
/// weight column to filter on directly.
enum WeightBucket {
  under250g('Under 250g', 0, 250),
  g250to500('250g - 500g', 250, 500),
  g500to1kg('500g - 1kg', 500, 1000),
  over1kg('Over 1kg', 1000, double.infinity);

  final String label;
  final double minGrams;
  final double maxGrams;

  const WeightBucket(this.label, this.minGrams, this.maxGrams);

  bool matches(double grams) => grams >= minGrams && grams < maxGrams;

  /// Parses free-text weight strings like "500g", "1 kg", "1.5kg" into
  /// grams. Returns null if the text doesn't contain a recognizable amount
  /// (that product is then excluded from weight-bucket filtering only, not
  /// from the catalog overall).
  static double? parseGrams(String weightText) {
    final match = RegExp(r'([\d.]+)\s*(kg|g)', caseSensitive: false).firstMatch(weightText);
    if (match == null) return null;
    final value = double.tryParse(match.group(1)!);
    if (value == null) return null;
    final unit = match.group(2)!.toLowerCase();
    return unit == 'kg' ? value * 1000 : value;
  }
}
