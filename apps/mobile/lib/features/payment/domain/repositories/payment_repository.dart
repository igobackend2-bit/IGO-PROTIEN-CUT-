import '../../../../models/payment_model.dart';

abstract class PaymentRepository {
  Future<List<Payment>> fetchPayments();
  Future<Payment?> fetchPaymentForOrder(String orderId);
  Future<Payment> retryPayment(Payment failedPayment);
  Future<Payment> requestRefund(String paymentId, {required String reason, double? amount});
}
