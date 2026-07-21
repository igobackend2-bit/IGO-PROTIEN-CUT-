import 'package:supabase_flutter/supabase_flutter.dart';

class OrderService {
  final SupabaseClient _client = Supabase.instance.client;

  /// Fetches the order history for the currently logged-in user.
  Future<List<Map<String, dynamic>>> fetchOrders() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];

    try {
      final response = await _client
          .from('orders')
          .select('''
            id,
            total_price,
            status,
            created_at,
            order_items (
              id,
              quantity,
              price,
              product_id,
              products (
                id,
                name,
                image_url,
                category
              )
            )
          ''')
          .eq('user_id', user.id)
          .order('created_at', ascending: false);

      final data = List<Map<String, dynamic>>.from(response);

      // Normalize Supabase nested product responses (in case they return as single-item lists)
      for (final order in data) {
        final items = order['order_items'] as List?;
        if (items != null) {
          for (final item in items) {
            if (item['products'] is List && (item['products'] as List).isNotEmpty) {
              item['products'] = (item['products'] as List).first;
            }
          }
        }
      }

      return data;
    } catch (e) {
      // Return empty list on failure or log it
      return [];
    }
  }
}
