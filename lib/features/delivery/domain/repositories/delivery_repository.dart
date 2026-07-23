import '../entities/delivery_assignment.dart';
import '../entities/delivery_location_point.dart';
import '../entities/delivery_otp_status.dart';

abstract class DeliveryRepository {
  Future<DeliveryAssignment?> fetchAssignment(String orderId);
  Stream<DeliveryAssignment?> watchAssignment(String orderId);
  Stream<DeliveryLocationPoint?> watchLatestLocation(String assignmentId);
  Stream<DeliveryOtpStatus?> watchOtpStatus(String orderId);

  /// Opportunistic — the Edge Function alone decides whether an assignment
  /// is created; this never contains eligibility logic on the Dart side.
  Future<void> assignDelivery(String orderId);

  /// Returns true only when the OTP was correct; throws with a
  /// user-facing message otherwise (wrong code, expired, too many
  /// attempts) so the caller can show it directly.
  Future<bool> verifyOtp(String orderId, String otpCode);

  Future<void> completeDelivery(String orderId);
  Future<void> estimateEta(String orderId);
}
