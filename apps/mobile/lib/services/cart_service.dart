import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Shared cart service — used by Home, Product Detail, Product Discovery
/// and the Cart module. Extended in Phase 4 with Save-For-Later on top of
/// the existing add/update/remove/clear behavior; existing callers are
/// unaffected since `getCartItems()` keeps returning only active items.
class CartService {
  final SupabaseClient _client = Supabase.instance.client;

  // ➕ Add to cart
  Future<void> addToCart(String productId) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception("User not logged in");

    final existing = await _client
        .from('cart_items')
        .select()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

    if (existing != null) {
      final wasSaved = existing['is_saved_for_later'] == true;
      await _client.from('cart_items').update({
        'quantity': (existing['quantity'] ?? 1) + 1,
        // Adding an already-saved-for-later item brings it back to the cart.
        if (wasSaved) 'is_saved_for_later': false,
      }).eq('id', existing['id']);
    } else {
      await _client.from('cart_items').insert({
        'user_id': user.id,
        'product_id': productId,
        'quantity': 1,
      });
    }
  }

  /// Every cart row for the current user (active + saved-for-later),
  /// product-joined with the *full* product row so callers can build a
  /// real `Product` (stock, weight, protein, discount-relevant fields)
  /// instead of re-parsing individual keys.
  Future<List<Map<String, dynamic>>> _fetchAllCartRows() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];

    try {
      final response = await _client
          .from('cart_items')
          .select('id, quantity, is_saved_for_later, products(*)')
          .eq('user_id', user.id);

      final responseList = response as List<dynamic>? ?? [];
      final normalized = <Map<String, dynamic>>[];

      for (final rawItem in responseList) {
        if (rawItem is! Map) continue;
        final item = Map<String, dynamic>.from(rawItem);

        final productsData = item['products'];
        Map<String, dynamic>? normalizedProduct;
        if (productsData is Map) {
          normalizedProduct = Map<String, dynamic>.from(productsData);
        } else if (productsData is List && productsData.isNotEmpty && productsData.first is Map) {
          normalizedProduct = Map<String, dynamic>.from(productsData.first as Map);
        }
        item['products'] = normalizedProduct;
        normalized.add(item);
      }

      return normalized;
    } catch (e, stack) {
      debugPrint("DEBUG: CartService._fetchAllCartRows error: $e");
      debugPrint(stack.toString());
      rethrow;
    }
  }

  // 📦 Active cart items (excludes anything saved for later). Filtering
  // happens client-side on the `is_saved_for_later` key rather than via a
  // server-side `.eq()` so this doesn't hard-fail if that column hasn't
  // been added to the database yet — it just treats everything as active.
  Future<List<Map<String, dynamic>>> getCartItems() async {
    final rows = await _fetchAllCartRows();
    return rows.where((r) => r['is_saved_for_later'] != true).toList();
  }

  // 💾 Items the user has moved to "Save for Later".
  Future<List<Map<String, dynamic>>> getSavedForLaterItems() async {
    final rows = await _fetchAllCartRows();
    return rows.where((r) => r['is_saved_for_later'] == true).toList();
  }

  Future<void> saveForLater(int cartId) async {
    await _client.from('cart_items').update({'is_saved_for_later': true}).eq('id', cartId);
  }

  Future<void> moveToCart(int cartId) async {
    await _client.from('cart_items').update({'is_saved_for_later': false}).eq('id', cartId);
  }

  // ➖ Update quantity
  Future<void> updateQuantity(int cartId, int quantity) async {
    if (quantity <= 0) {
      await _client.from('cart_items').delete().eq('id', cartId);
    } else {
      await _client
          .from('cart_items')
          .update({'quantity': quantity})
          .eq('id', cartId);
    }
  }

  // 🗑 Remove item
  Future<void> removeItem(int cartId) async {
    await _client.from('cart_items').delete().eq('id', cartId);
  }

  // 🧹 Clear cart (active items only — Save For Later items are untouched,
  // matching how Licious/Blinkit-style carts behave after checkout).
  Future<void> clearCart() async {
    final user = _client.auth.currentUser;
    if (user == null) return;

    final active = await getCartItems();
    for (final item in active) {
      final id = item['id'];
      if (id is int) {
        await _client.from('cart_items').delete().eq('id', id);
      }
    }
  }
}
