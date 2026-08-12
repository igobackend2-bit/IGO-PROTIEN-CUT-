import '../models/payment_model.dart';

/// Result of attempting to charge through a gateway. `transactionId`/
/// `gatewayReference` are gateway-assigned identifiers, kept generic so any
/// provider can populate them the same way.
class PaymentGatewayResult {
  final bool isSuccess;
  final PaymentStatus status;
  final String? transactionId;
  final String? gatewayReference;
  final String? errorMessage;

  const PaymentGatewayResult({
    required this.isSuccess,
    required this.status,
    this.transactionId,
    this.gatewayReference,
    this.errorMessage,
  });
}

/// A payment provider capable of charging an order. Every payment method in
/// [PaymentMethodOption] (features/checkout) maps to one implementation of
/// this, so adding a real gateway later means adding one new class here —
/// nothing in Checkout, Orders, or Payment History needs to change.
abstract class PaymentGateway {
  Future<PaymentGatewayResult> charge({required String orderId, required double amount});
}

/// Cash on Delivery — the only gateway actually wired up today. Payment is
/// collected in person at delivery, so it's recorded as Pending at order
/// time; nothing here fabricates an immediate "Success".
class CodPaymentGateway implements PaymentGateway {
  @override
  Future<PaymentGatewayResult> charge({required String orderId, required double amount}) async {
    return const PaymentGatewayResult(isSuccess: true, status: PaymentStatus.pending);
  }
}

/// Not implemented — no Razorpay API key is configured in this project.
/// Wire up `razorpay_flutter` (or the Razorpay REST API) here when a real
/// key is available; the interface above is what every caller already
/// expects, so nothing else needs to change to plug this in.
class RazorpayPaymentGateway implements PaymentGateway {
  @override
  Future<PaymentGatewayResult> charge({required String orderId, required double amount}) {
    throw UnimplementedError('Razorpay is not configured yet — no API key available.');
  }
}
