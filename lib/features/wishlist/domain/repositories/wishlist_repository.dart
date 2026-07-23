import '../entities/wishlist_item.dart';

abstract class WishlistRepository {
  Future<bool> isWishlisted(String productId);
  Future<void> toggle(String productId);

  Future<List<WishlistItem>> fetchWishlistItems();
  Future<void> removeItem(String wishlistItemId);
  Future<void> removeItems(List<String> wishlistItemIds);

  Future<bool> hasStockAlert(String productId);
  Future<void> requestStockAlert(String productId);
  Future<void> removeStockAlert(String productId);
}
