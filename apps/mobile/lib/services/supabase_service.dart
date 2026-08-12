import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  final client = Supabase.instance.client;

  Future<List> getProducts(String? category) async {
    var query = client.from('products').select();

    if (category != null) {
      query = query.eq('category', category);
    }

    final response = await query;
    return response;
  }
}