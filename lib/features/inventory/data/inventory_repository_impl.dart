import '../../../core/network/edge_function_client.dart';
import '../../products/domain/product.dart';
import '../domain/inventory_history_entry.dart';
import '../domain/inventory_repository.dart';

class InventoryRepositoryImpl implements InventoryRepository {
  final EdgeFunctionClient _client;

  InventoryRepositoryImpl(this._client);

  @override
  Future<List<Product>> listLowStock() async {
    final response = await _client.invoke('admin-inventory', 'listLowStock');
    return ((response['products'] as List?) ?? const [])
        .map((e) => Product.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  @override
  Future<List<Product>> listOutOfStock() async {
    final response = await _client.invoke('admin-inventory', 'listOutOfStock');
    return ((response['products'] as List?) ?? const [])
        .map((e) => Product.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  @override
  Future<List<InventoryHistoryEntry>> history({
    required String productId,
    int limit = 50,
    int offset = 0,
  }) async {
    final response = await _client.invoke('admin-inventory', 'history', {
      'productId': productId,
      'limit': limit,
      'offset': offset,
    });
    return ((response['history'] as List?) ?? const [])
        .map((e) => InventoryHistoryEntry.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  @override
  Future<Product> stockIn({required String productId, required int quantity, String? reason}) async {
    final response = await _client.invoke('admin-inventory', 'stockIn', {
      'productId': productId,
      'quantity': quantity,
      if (reason != null && reason.isNotEmpty) 'reason': reason,
    });
    return Product.fromJson(Map<String, dynamic>.from(response['product'] as Map));
  }

  @override
  Future<Product> stockOut({required String productId, required int quantity, String? reason}) async {
    final response = await _client.invoke('admin-inventory', 'stockOut', {
      'productId': productId,
      'quantity': quantity,
      if (reason != null && reason.isNotEmpty) 'reason': reason,
    });
    return Product.fromJson(Map<String, dynamic>.from(response['product'] as Map));
  }

  @override
  Future<Product> adjustment({required String productId, required int newStock, String? reason}) async {
    final response = await _client.invoke('admin-inventory', 'adjustment', {
      'productId': productId,
      'newStock': newStock,
      if (reason != null && reason.isNotEmpty) 'reason': reason,
    });
    return Product.fromJson(Map<String, dynamic>.from(response['product'] as Map));
  }
}
