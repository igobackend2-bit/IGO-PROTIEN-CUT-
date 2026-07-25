import 'package:shared_preferences/shared_preferences.dart';

/// Persists a small, most-recent-first list of product IDs the user has
/// tapped into from the Home screen. Local-only (SharedPreferences) —
/// intentionally scoped to the Home module so it doesn't require touching
/// the product detail screen in another module.
class RecentlyViewedService {
  static const _storageKey = 'home_recently_viewed_product_ids';
  static const _maxEntries = 20;

  Future<List<String>> getViewedIds() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_storageKey) ?? [];
  }

  Future<void> recordView(String productId) async {
    final prefs = await SharedPreferences.getInstance();
    final current = prefs.getStringList(_storageKey) ?? [];
    current.remove(productId);
    current.insert(0, productId);
    if (current.length > _maxEntries) {
      current.removeRange(_maxEntries, current.length);
    }
    await prefs.setStringList(_storageKey, current);
  }
}
