import 'order.dart';
import 'payment.dart';

class OrderListResult {
  final List<Order> orders;
  final int total;

  const OrderListResult({required this.orders, required this.total});
}

class OrderDetail {
  final Order order;
  final List<Payment> payments;

  const OrderDetail({required this.order, required this.payments});
}

abstract class OrdersRepository {
  Future<OrderListResult> list({
    String? status,
    String? userId,
    DateTime? dateFrom,
    DateTime? dateTo,
    int limit = 50,
    int offset = 0,
  });

  Future<OrderDetail> getDetail(String orderId);

  Future<Order> accept(String orderId);

  Future<Order> pack(String orderId);

  Future<Order> ready(String orderId);

  Future<Order> reject(String orderId, {String? reason});

  Future<Order> cancel(String orderId, {String? reason});

  Future<void> assignDelivery(String orderId);

  Future<Payment> refund({required String paymentId, num? amount, String? reason});
}
