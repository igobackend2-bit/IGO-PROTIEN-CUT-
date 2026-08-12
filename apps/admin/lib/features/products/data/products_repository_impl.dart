import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/network/edge_function_client.dart';
import '../domain/category.dart';
import '../domain/product.dart';
import '../domain/products_repository.dart';

class ProductsRepositoryImpl implements ProductsRepository {
  final EdgeFunctionClient _client;
  final SupabaseClient _supabase;

  ProductsRepositoryImpl(this._client, this._supabase);

  @override
  Future<ProductListResult> list({
    String? category,
    bool? isAvailable,
    String? search,
    int limit = 50,
    int offset = 0,
  }) async {
    final response = await _client.invoke('admin-products', 'list', {
      if (category != null && category.isNotEmpty) 'category': category,
      if (isAvailable != null) 'isAvailable': isAvailable,
      if (search != null && search.isNotEmpty) 'search': search,
      'limit': limit,
      'offset': offset,
    });
    final products = ((response['products'] as List?) ?? const [])
        .map((e) => Product.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    return ProductListResult(products: products, total: (response['total'] as num?)?.toInt() ?? products.length);
  }

  @override
  Future<Product> create(Product product) async {
    final response = await _client.invoke('admin-products', 'create', product.toPayload());
    return Product.fromJson(Map<String, dynamic>.from(response['product'] as Map));
  }

  @override
  Future<Product> update(String id, Product product) async {
    final response = await _client.invoke('admin-products', 'update', {'id': id, ...product.toPayload()});
    return Product.fromJson(Map<String, dynamic>.from(response['product'] as Map));
  }

  @override
  Future<void> delete(String id) => _client.invoke('admin-products', 'delete', {'id': id});

  @override
  Future<Product> setPublished(String id, bool published) async {
    final response = await _client.invoke('admin-products', published ? 'publish' : 'unpublish', {'id': id});
    return Product.fromJson(Map<String, dynamic>.from(response['product'] as Map));
  }

  @override
  Future<List<ProductCategory>> listCategories() async {
    final response = await _client.invoke('admin-products', 'listCategories');
    return ((response['categories'] as List?) ?? const [])
        .map((e) => ProductCategory.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  @override
  Future<ProductCategory> createCategory({required String name, String? emoji, int? displayOrder}) async {
    final response = await _client.invoke('admin-products', 'createCategory', {
      'name': name,
      if (emoji != null) 'emoji': emoji,
      if (displayOrder != null) 'displayOrder': displayOrder,
    });
    return ProductCategory.fromJson(Map<String, dynamic>.from(response['category'] as Map));
  }

  @override
  Future<ProductCategory> updateCategory(
    String id, {
    String? name,
    String? emoji,
    int? displayOrder,
    bool? isActive,
  }) async {
    final response = await _client.invoke('admin-products', 'updateCategory', {
      'id': id,
      if (name != null) 'name': name,
      if (emoji != null) 'emoji': emoji,
      if (displayOrder != null) 'display_order': displayOrder,
      if (isActive != null) 'is_active': isActive,
    });
    return ProductCategory.fromJson(Map<String, dynamic>.from(response['category'] as Map));
  }

  @override
  Future<void> deleteCategory(String id) => _client.invoke('admin-products', 'deleteCategory', {'id': id});

  @override
  Future<void> moderateReview(int reviewId, {bool isHidden = true}) =>
      _client.invoke('admin-products', 'moderateReview', {'reviewId': reviewId, 'isHidden': isHidden});

  @override
  Future<String> uploadImage(Uint8List bytes, {required String fileExt, String? productId}) async {
    final folder = productId ?? 'new-${DateTime.now().millisecondsSinceEpoch}';
    final path = 'products/$folder/${DateTime.now().millisecondsSinceEpoch}.$fileExt';
    await _supabase.storage.from('product-images').uploadBinary(
          path,
          bytes,
          fileOptions: const FileOptions(upsert: true),
        );
    return _supabase.storage.from('product-images').getPublicUrl(path);
  }
}
