import '../entities/order_summary.dart';

abstract class OrderRepository {
  Future<List<OrderSummary>> fetchOrders();
  Future<OrderSummary?> fetchOrderById(String orderId);
  Stream<OrderSummary?> watchOrder(String orderId);
  Future<void> cancelOrder(String orderId, {String? reason});
  Future<void> submitRating(String orderId, {required int rating, String? comment});
  Future<Map<String, dynamic>?> fetchRating(String orderId);
}
