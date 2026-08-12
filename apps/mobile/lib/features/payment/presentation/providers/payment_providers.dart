import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../models/payment_model.dart';
import '../../data/repositories/payment_repository_impl.dart';
import '../../domain/repositories/payment_repository.dart';

final paymentRepositoryProvider = Provider<PaymentRepository>((ref) => PaymentRepositoryImpl());

final paymentHistoryProvider = FutureProvider.autoDispose<List<Payment>>((ref) {
  return ref.watch(paymentRepositoryProvider).fetchPayments();
});

final paymentForOrderProvider = FutureProvider.autoDispose.family<Payment?, String>((ref, orderId) {
  return ref.watch(paymentRepositoryProvider).fetchPaymentForOrder(orderId);
});

final paymentDetailProvider =
    StateNotifierProvider.autoDispose.family<PaymentDetailNotifier, AsyncValue<Payment>, Payment>(
  (ref, initial) => PaymentDetailNotifier(ref.read(paymentRepositoryProvider), initial),
);

class PaymentDetailNotifier extends StateNotifier<AsyncValue<Payment>> {
  final PaymentRepository _repository;

  PaymentDetailNotifier(this._repository, Payment initial) : super(AsyncValue.data(initial));

  Future<void> retry() async {
    final current = state.value;
    if (current == null || !current.isRetryable) return;
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _repository.retryPayment(current));
  }

  Future<void> requestRefund({required String reason, double? amount}) async {
    final current = state.value;
    if (current == null) return;
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _repository.requestRefund(current.id, reason: reason, amount: amount));
  }
}
