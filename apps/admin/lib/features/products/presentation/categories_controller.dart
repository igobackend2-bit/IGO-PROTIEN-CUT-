import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/category.dart';
import 'products_providers.dart';

class CategoriesController extends AsyncNotifier<List<ProductCategory>> {
  @override
  Future<List<ProductCategory>> build() async {
    return ref.watch(productsRepositoryProvider).listCategories();
  }

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }

  Future<void> create({required String name, String? emoji, int? displayOrder}) async {
    await ref.read(productsRepositoryProvider).createCategory(name: name, emoji: emoji, displayOrder: displayOrder);
    await refresh();
  }

  Future<void> updateCategory(String id, {String? name, String? emoji, int? displayOrder, bool? isActive}) async {
    await ref.read(productsRepositoryProvider).updateCategory(
          id,
          name: name,
          emoji: emoji,
          displayOrder: displayOrder,
          isActive: isActive,
        );
    await refresh();
  }

  Future<void> delete(String id) async {
    await ref.read(productsRepositoryProvider).deleteCategory(id);
    await refresh();
  }
}

final categoriesControllerProvider =
    AsyncNotifierProvider<CategoriesController, List<ProductCategory>>(CategoriesController.new);
