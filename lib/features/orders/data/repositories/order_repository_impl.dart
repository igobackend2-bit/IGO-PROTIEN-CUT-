import '../../../../services/order_service.dart';
import '../../domain/entities/order_summary.dart';
import '../../domain/repositories/order_repository.dart';

class OrderRepositoryImpl implements OrderRepository {
  final OrderService _service;
  OrderRepositoryImpl({OrderService? service}) : _service = service ?? OrderService();

  @override
  Future<List<OrderSummary>> fetchOrders() async {
    final raw = await _service.fetchOrders();
    return raw.map(OrderSummary.fromMap).toList();
  }

  @override
  Future<OrderSummary?> fetchOrderById(String orderId) async {
    final raw = await _service.fetchOrderById(orderId);
    return raw == null ? null : OrderSummary.fromMap(raw);
  }

  @override
  Stream<OrderSummary?> watchOrder(String orderId) {
    return _service.watchOrder(orderId).map((raw) => raw == null ? null : OrderSummary.fromMap(raw));
  }

  @override
  Future<void> cancelOrder(String orderId, {String? reason}) => _service.cancelOrder(orderId, reason: reason);

  @override
  Future<void> submitRating(String orderId, {required int rating, String? comment}) =>
      _service.submitRating(orderId, rating: rating, comment: comment);

  @override
  Future<Map<String, dynamic>?> fetchRating(String orderId) => _service.fetchRating(orderId);
}
