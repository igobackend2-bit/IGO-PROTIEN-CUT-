import '../../../../services/wishlist_service.dart';
import '../../domain/entities/wishlist_item.dart';
import '../../domain/repositories/wishlist_repository.dart';

class WishlistRepositoryImpl implements WishlistRepository {
  final WishlistService _service;
  WishlistRepositoryImpl({WishlistService? service}) : _service = service ?? WishlistService();

  @override
  Future<bool> isWishlisted(String productId) => _service.isWishlisted(productId);

  @override
  Future<void> toggle(String productId) => _service.toggle(productId);

  @override
  Future<List<WishlistItem>> fetchWishlistItems() async {
    final raw = await _service.fetchWishlistItems();
    // Opportunistically clear stock alerts for items that are now
    // available again — best-effort, doesn't block the list from showing.
    for (final row in raw) {
      final productData = row['products'];
      if (productData is Map && (productData['is_available'] as bool? ?? true)) {
        final productId = row['product_id']?.toString();
        if (productId != null) _service.removeStockAlert(productId);
      }
    }
    return raw.map(WishlistItem.fromMap).toList();
  }

  @override
  Future<void> removeItem(String wishlistItemId) => _service.removeItem(wishlistItemId);

  @override
  Future<void> removeItems(List<String> wishlistItemIds) => _service.removeItems(wishlistItemIds);

  @override
  Future<bool> hasStockAlert(String productId) => _service.hasStockAlert(productId);

  @override
  Future<void> requestStockAlert(String productId) => _service.requestStockAlert(productId);

  @override
  Future<void> removeStockAlert(String productId) => _service.removeStockAlert(productId);
}
