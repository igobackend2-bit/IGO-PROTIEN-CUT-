import 'package:supabase_flutter/supabase_flutter.dart';

/// Shared wishlist service, following the same plain-Supabase-wrapper
/// pattern as CartService/OrderService/PaymentService. Talks to the
/// `wishlist_items` and `stock_alerts` tables directly; reads fail closed
/// (empty/false) rather than throwing if those tables aren't migrated yet.
class WishlistService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<bool> isWishlisted(String productId) async {
    final user = _client.auth.currentUser;
    if (user == null) return false;
    try {
      final row = await _client
          .from('wishlist_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle();
      return row != null;
    } catch (_) {
      return false;
    }
  }

  Future<void> addToWishlist(String productId) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to use your wishlist.');
    final existing = await _client
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
    if (existing == null) {
      await _client.from('wishlist_items').insert({'user_id': user.id, 'product_id': productId});
    }
  }

  Future<void> removeFromWishlist(String productId) async {
    final user = _client.auth.currentUser;
    if (user == null) return;
    await _client.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', productId);
  }

  Future<void> toggle(String productId) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to use your wishlist.');
    final existing = await _client
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
    if (existing != null) {
      await _client.from('wishlist_items').delete().eq('id', existing['id']);
    } else {
      await _client.from('wishlist_items').insert({'user_id': user.id, 'product_id': productId});
    }
  }

  /// Full wishlist, newest first — each row carries the joined `products`
  /// row plus the wishlist_items row's own `id`/`created_at` (needed for
  /// removal-by-row and the "Newest" sort / Recently Wishlisted section).
  Future<List<Map<String, dynamic>>> fetchWishlistItems() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];
    try {
      final response = await _client
          .from('wishlist_items')
          .select('id, created_at, product_id, products(*)')
          .eq('user_id', user.id)
          .order('created_at', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  Future<void> removeItem(String wishlistItemId) async {
    await _client.from('wishlist_items').delete().eq('id', wishlistItemId);
  }

  Future<void> removeItems(List<String> wishlistItemIds) async {
    if (wishlistItemIds.isEmpty) return;
    await _client.from('wishlist_items').delete().inFilter('id', wishlistItemIds);
  }

  // ─── Stock alerts ─────────────────────────────────────────────────────

  Future<bool> hasStockAlert(String productId) async {
    final user = _client.auth.currentUser;
    if (user == null) return false;
    try {
      final row = await _client
          .from('stock_alerts')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .maybeSingle();
      return row != null;
    } catch (_) {
      return false;
    }
  }

  /// Stores the notify-me request. Actual push delivery isn't implemented
  /// yet — this just persists the request so it's ready to wire up once
  /// there's a notification backend.
  Future<void> requestStockAlert(String productId) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to get notified.');
    final existing = await _client
        .from('stock_alerts')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
    if (existing == null) {
      await _client.from('stock_alerts').insert({'user_id': user.id, 'product_id': productId});
    }
  }

  Future<void> removeStockAlert(String productId) async {
    final user = _client.auth.currentUser;
    if (user == null) return;
    try {
      await _client.from('stock_alerts').delete().eq('user_id', user.id).eq('product_id', productId);
    } catch (_) {
      // Non-fatal — best-effort cleanup when a product becomes available again.
    }
  }
}
