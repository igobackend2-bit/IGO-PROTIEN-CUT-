import '../../products/domain/product.dart';
import 'inventory_history_entry.dart';

abstract class InventoryRepository {
  Future<List<Product>> listLowStock();

  Future<List<Product>> listOutOfStock();

  Future<List<InventoryHistoryEntry>> history({
    required String productId,
    int limit = 50,
    int offset = 0,
  });

  Future<Product> stockIn({required String productId, required int quantity, String? reason});

  Future<Product> stockOut({required String productId, required int quantity, String? reason});

  Future<Product> adjustment({required String productId, required int newStock, String? reason});
}
