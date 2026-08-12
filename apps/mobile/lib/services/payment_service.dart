import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/payment_model.dart';
import 'payment_gateway.dart';

/// Shared payment service, following the same plain-Supabase-wrapper
/// pattern as CartService/OrderService/AddressService. Talks to the
/// `payments` table and delegates actual charging to a [PaymentGateway] so
/// swapping Cash on Delivery for a real gateway later doesn't change this
/// class's public API.
class PaymentService {
  final SupabaseClient _client = Supabase.instance.client;

  PaymentGateway _gatewayFor(String paymentMethod) {
    // Only Cash on Delivery is wired to a working gateway today; every
    // other PaymentMethodOption in features/checkout is intentionally
    // disabled in the UI until a real key exists, so it should never reach
    // here — RazorpayPaymentGateway exists to keep the interface honest
    // and ready, not to be called yet.
    return CodPaymentGateway();
  }

  /// Creates a payment record for a freshly-placed order and charges it via
  /// the appropriate gateway. Called from Checkout right after the order
  /// itself is created.
  Future<Payment> createPayment({
    required String orderId,
    required double amount,
    required String paymentMethod,
  }) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to record a payment.');

    final result = await _gatewayFor(paymentMethod).charge(orderId: orderId, amount: amount);

    final row = await _client
        .from('payments')
        .insert({
          'order_id': orderId,
          'user_id': user.id,
          'amount': amount,
          'payment_method': paymentMethod,
          'status': result.status.label,
          'transaction_id': result.transactionId,
          'gateway_reference': result.gatewayReference,
        })
        .select()
        .single();

    return Payment.fromMap(row);
  }

  Future<List<Payment>> fetchPayments() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];
    try {
      final response = await _client
          .from('payments')
          .select()
          .eq('user_id', user.id)
          .order('created_at', ascending: false);
      return (response as List).map((e) => Payment.fromMap(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<Payment?> fetchPaymentForOrder(String orderId) async {
    final user = _client.auth.currentUser;
    if (user == null) return null;
    try {
      final row = await _client
          .from('payments')
          .select()
          .eq('order_id', orderId)
          .eq('user_id', user.id)
          .order('created_at', ascending: false)
          .limit(1)
          .maybeSingle();
      return row == null ? null : Payment.fromMap(row);
    } catch (_) {
      return null;
    }
  }

  /// Available only for Failed payments — records a fresh attempt against
  /// the same order rather than mutating the failed row, so the failure is
  /// still visible in history.
  Future<Payment> retryPayment(Payment failedPayment) async {
    if (!failedPayment.isRetryable) {
      throw Exception('Only failed payments can be retried.');
    }
    return createPayment(
      orderId: failedPayment.orderId,
      amount: failedPayment.amount,
      paymentMethod: failedPayment.paymentMethod,
    );
  }

  Future<Payment> requestRefund(String paymentId, {required String reason, double? amount}) async {
    final row = await _client
        .from('payments')
        .update({
          'refund_status': 'Requested',
          'refund_reason': reason,
          'refund_amount': amount,
          'refund_requested_at': DateTime.now().toIso8601String(),
        })
        .eq('id', paymentId)
        .select()
        .single();
    return Payment.fromMap(row);
  }
}
