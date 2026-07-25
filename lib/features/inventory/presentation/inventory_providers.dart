import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/core_providers.dart';
import '../../products/domain/product.dart';
import '../data/inventory_repository_impl.dart';
import '../domain/inventory_repository.dart';

final inventoryRepositoryProvider = Provider<InventoryRepository>((ref) {
  return InventoryRepositoryImpl(ref.watch(edgeFunctionClientProvider));
});

class LowStockController extends AsyncNotifier<List<Product>> {
  @override
  Future<List<Product>> build() => ref.watch(inventoryRepositoryProvider).listLowStock();

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }
}

class OutOfStockController extends AsyncNotifier<List<Product>> {
  @override
  Future<List<Product>> build() => ref.watch(inventoryRepositoryProvider).listOutOfStock();

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }
}

final lowStockControllerProvider = AsyncNotifierProvider<LowStockController, List<Product>>(LowStockController.new);

final outOfStockControllerProvider =
    AsyncNotifierProvider<OutOfStockController, List<Product>>(OutOfStockController.new);
