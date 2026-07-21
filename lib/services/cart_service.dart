import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

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
      await _client.from('cart_items').update({
        'quantity': (existing['quantity'] ?? 1) + 1,
      }).eq('id', existing['id']);
    } else {
      await _client.from('cart_items').insert({
        'user_id': user.id,
        'product_id': productId,
        'quantity': 1,
      });
    }
  }

  // 📦 Get cart items WITH product join
  Future<List<Map<String, dynamic>>> getCartItems() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];

    try {
      final response = await _client
          .from('cart_items')
          .select('''
            id,
            quantity,
            products (
              id,
              name,
              price,
              image_url
            )
          ''')
          .eq('user_id', user.id);

      final List<dynamic> responseList = response as List<dynamic>? ?? [];
      final List<Map<String, dynamic>> normalizedList = [];

      for (final rawItem in responseList) {
        if (rawItem is! Map) continue;
        
        // Create a modifiable copy of the item map
        final item = Map<String, dynamic>.from(rawItem);
        
        final productsData = item['products'];
        Map<String, dynamic>? normalizedProduct;

        if (productsData is Map) {
          normalizedProduct = Map<String, dynamic>.from(productsData);
        } else if (productsData is List && productsData.isNotEmpty) {
          final firstProduct = productsData.first;
          if (firstProduct is Map) {
            normalizedProduct = Map<String, dynamic>.from(firstProduct);
          }
        }

        item['products'] = normalizedProduct;
        normalizedList.add(item);
      }

      return normalizedList;
    } catch (e, stack) {
      debugPrint("DEBUG: CartService.getCartItems error: $e");
      debugPrint(stack.toString());
      rethrow;
    }
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

  // 🧹 Clear cart
  Future<void> clearCart() async {
    final user = _client.auth.currentUser;
    if (user == null) return;

    await _client.from('cart_items').delete().eq('user_id', user.id);
  }
}