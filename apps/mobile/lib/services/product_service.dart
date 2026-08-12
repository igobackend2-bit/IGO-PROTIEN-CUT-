import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/product_model.dart';

class ProductService {
  final SupabaseClient _supabase = Supabase.instance.client;

  /// 📦 Fetch all products from Supabase
  Future<List<Product>> fetchProducts() async {
    try {
      final response = await _supabase
          .from('products')
          .select()
          .order('name', ascending: true);

      if (response == null || response is! List) {
        return [];
      }

      return (response as List)
          .map((item) => Product.fromMap(item))
          .toList();
    } catch (e) {
      // 🧯 Safe fallback to prevent app crash
      print("❌ Product fetch error: $e");
      return [];
    }
  }

  /// 🔍 Fetch products by category (future use for filters)
  Future<List<Product>> fetchByCategory(String category) async {
    try {
      final response = await _supabase
          .from('products')
          .select()
          .ilike('category', '%$category%');

      if (response == null || response is! List) {
        return [];
      }

      return (response as List)
          .map((item) => Product.fromMap(item))
          .toList();
    } catch (e) {
      print("❌ Category fetch error: $e");
      return [];
    }
  }

  /// 🧠 Optional: Search products (for search bar later)
  Future<List<Product>> searchProducts(String query) async {
    try {
      final response = await _supabase
          .from('products')
          .select()
          .ilike('name', '%$query%');

      if (response == null || response is! List) {
        return [];
      }

      return (response as List)
          .map((item) => Product.fromMap(item))
          .toList();
    } catch (e) {
      print("❌ Search error: $e");
      return [];
    }
  }
}