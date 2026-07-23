import '../../../../models/payment_model.dart';
import '../../../../services/payment_service.dart';
import '../../domain/repositories/payment_repository.dart';

class PaymentRepositoryImpl implements PaymentRepository {
  final PaymentService _service;
  PaymentRepositoryImpl({PaymentService? service}) : _service = service ?? PaymentService();

  @override
  Future<List<Payment>> fetchPayments() => _service.fetchPayments();

  @override
  Future<Payment?> fetchPaymentForOrder(String orderId) => _service.fetchPaymentForOrder(orderId);

  @override
  Future<Payment> retryPayment(Payment failedPayment) => _service.retryPayment(failedPayment);

  @override
  Future<Payment> requestRefund(String paymentId, {required String reason, double? amount}) =>
      _service.requestRefund(paymentId, reason: reason, amount: amount);
}
