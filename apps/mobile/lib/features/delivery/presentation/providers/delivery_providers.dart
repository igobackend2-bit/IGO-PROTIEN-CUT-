import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/delivery_repository_impl.dart';
import '../../domain/entities/delivery_assignment.dart';
import '../../domain/entities/delivery_location_point.dart';
import '../../domain/entities/delivery_otp_status.dart';
import '../../domain/repositories/delivery_repository.dart';

final deliveryRepositoryProvider = Provider<DeliveryRepository>((ref) => DeliveryRepositoryImpl());

final deliveryAssignmentStreamProvider = StreamProvider.autoDispose.family<DeliveryAssignment?, String>((ref, orderId) {
  return ref.watch(deliveryRepositoryProvider).watchAssignment(orderId);
});

final deliveryLocationStreamProvider = StreamProvider.autoDispose.family<DeliveryLocationPoint?, String>((ref, assignmentId) {
  return ref.watch(deliveryRepositoryProvider).watchLatestLocation(assignmentId);
});

final deliveryOtpStreamProvider = StreamProvider.autoDispose.family<DeliveryOtpStatus?, String>((ref, orderId) {
  return ref.watch(deliveryRepositoryProvider).watchOtpStatus(orderId);
});

/// Bootstraps tracking for one order the moment its screen opens: asks
/// assign-delivery to create an assignment if one doesn't exist yet (the
/// function itself is the sole judge of whether the order is actually
/// eligible — this is an opportunistic nudge, not a business decision),
/// and asks estimate-eta for an initial number if an assignment exists but
/// has none yet. No backend cron exists in this project, so this mirrors
/// the same "runs when the app is opened" pattern used by Phase 14's
/// subscription order-generation.
final deliveryBootstrapProvider = StateNotifierProvider.autoDispose.family<DeliveryBootstrapNotifier, AsyncValue<void>, String>((ref, orderId) {
  return DeliveryBootstrapNotifier(ref.read(deliveryRepositoryProvider), orderId);
});

class DeliveryBootstrapNotifier extends StateNotifier<AsyncValue<void>> {
  final DeliveryRepository _repository;
  final String orderId;

  DeliveryBootstrapNotifier(this._repository, this.orderId) : super(const AsyncValue.data(null)) {
    _run();
  }

  Future<void> _run() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final existing = await _repository.fetchAssignment(orderId);
      if (existing == null) {
        await _repository.assignDelivery(orderId);
        return;
      }
      if (existing.etaMinutes == null && existing.status.isActive) {
        await _repository.estimateEta(orderId);
      }
    });
  }

  Future<void> retry() => _run();
}

class OtpVerifyState {
  final bool isSubmitting;
  final String? error;
  final bool isComplete;

  const OtpVerifyState({this.isSubmitting = false, this.error, this.isComplete = false});

  OtpVerifyState copyWith({bool? isSubmitting, String? error, bool clearError = false, bool? isComplete}) {
    return OtpVerifyState(
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: clearError ? null : (error ?? this.error),
      isComplete: isComplete ?? this.isComplete,
    );
  }
}

final otpVerifyProvider = StateNotifierProvider.autoDispose.family<OtpVerifyNotifier, OtpVerifyState, String>((ref, orderId) {
  return OtpVerifyNotifier(ref.read(deliveryRepositoryProvider), orderId);
});

class OtpVerifyNotifier extends StateNotifier<OtpVerifyState> {
  final DeliveryRepository _repository;
  final String orderId;

  OtpVerifyNotifier(this._repository, this.orderId) : super(const OtpVerifyState());

  Future<void> submit(String code) async {
    if (code.trim().isEmpty) return;
    state = state.copyWith(isSubmitting: true, clearError: true);
    try {
      final verified = await _repository.verifyOtp(orderId, code.trim());
      if (!verified) {
        state = state.copyWith(isSubmitting: false, error: 'Incorrect OTP.');
        return;
      }
      await _repository.completeDelivery(orderId);
      state = state.copyWith(isSubmitting: false, isComplete: true);
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString().replaceFirst('Exception: ', ''));
    }
  }
}
