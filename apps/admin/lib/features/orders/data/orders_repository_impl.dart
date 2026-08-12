import '../../../core/network/edge_function_client.dart';
import '../domain/order.dart';
import '../domain/orders_repository.dart';
import '../domain/payment.dart';

class OrdersRepositoryImpl implements OrdersRepository {
  final EdgeFunctionClient _client;

  OrdersRepositoryImpl(this._client);

  @override
  Future<OrderListResult> list({
    String? status,
    String? userId,
    DateTime? dateFrom,
    DateTime? dateTo,
    int limit = 50,
    int offset = 0,
  }) async {
    final response = await _client.invoke('admin-orders', 'list', {
      if (status != null && status.isNotEmpty) 'status': status,
      if (userId != null && userId.isNotEmpty) 'userId': userId,
      if (dateFrom != null) 'dateFrom': dateFrom.toIso8601String(),
      if (dateTo != null) 'dateTo': dateTo.toIso8601String(),
      'limit': limit,
      'offset': offset,
    });
    final orders = ((response['orders'] as List?) ?? const [])
        .map((e) => Order.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    return OrderListResult(orders: orders, total: (response['total'] as num?)?.toInt() ?? orders.length);
  }

  @override
  Future<OrderDetail> getDetail(String orderId) async {
    final response = await _client.invoke('admin-orders', 'get', {'orderId': orderId});
    final order = Order.fromJson(Map<String, dynamic>.from(response['order'] as Map));
    final payments = ((response['payments'] as List?) ?? const [])
        .map((e) => Payment.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    return OrderDetail(order: order, payments: payments);
  }

  Future<Order> _transition(String action, String orderId, {String? reason}) async {
    final response = await _client.invoke('admin-orders', action, {
      'orderId': orderId,
      if (reason != null && reason.isNotEmpty) 'reason': reason,
    });
    return Order.fromJson(Map<String, dynamic>.from(response['order'] as Map));
  }

  @override
  Future<Order> accept(String orderId) => _transition('accept', orderId);

  @override
  Future<Order> pack(String orderId) => _transition('pack', orderId);

  @override
  Future<Order> ready(String orderId) => _transition('ready', orderId);

  @override
  Future<Order> reject(String orderId, {String? reason}) => _transition('reject', orderId, reason: reason);

  @override
  Future<Order> cancel(String orderId, {String? reason}) => _transition('cancel', orderId, reason: reason);

  @override
  Future<void> assignDelivery(String orderId) => _client.invoke('admin-orders', 'assignDelivery', {'orderId': orderId});

  @override
  Future<Payment> refund({required String paymentId, num? amount, String? reason}) async {
    final response = await _client.invoke('admin-orders', 'refund', {
      'paymentId': paymentId,
      if (amount != null) 'amount': amount,
      if (reason != null && reason.isNotEmpty) 'reason': reason,
    });
    return Payment.fromJson(Map<String, dynamic>.from(response['payment'] as Map));
  }
}
