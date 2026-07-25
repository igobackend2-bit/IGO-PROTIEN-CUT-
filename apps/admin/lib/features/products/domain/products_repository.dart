import 'dart:typed_data';

import 'category.dart';
import 'product.dart';

class ProductListResult {
  final List<Product> products;
  final int total;

  const ProductListResult({required this.products, required this.total});
}

abstract class ProductsRepository {
  Future<ProductListResult> list({
    String? category,
    bool? isAvailable,
    String? search,
    int limit = 50,
    int offset = 0,
  });

  Future<Product> create(Product product);

  Future<Product> update(String id, Product product);

  Future<void> delete(String id);

  Future<Product> setPublished(String id, bool published);

  Future<List<ProductCategory>> listCategories();

  Future<ProductCategory> createCategory({required String name, String? emoji, int? displayOrder});

  Future<ProductCategory> updateCategory(
    String id, {
    String? name,
    String? emoji,
    int? displayOrder,
    bool? isActive,
  });

  Future<void> deleteCategory(String id);

  Future<void> moderateReview(int reviewId, {bool isHidden = true});

  /// Uploads a photo to the `product-images` Storage bucket (Phase 18b —
  /// same bucket, path convention, and `products.manage`-gated RLS policy
  /// the customer app's own admin photo-upload screen already uses) and
  /// returns its public URL. [productId] is optional so this also works
  /// while creating a brand-new product that doesn't have an id yet.
  Future<String> uploadImage(Uint8List bytes, {required String fileExt, String? productId});
}
