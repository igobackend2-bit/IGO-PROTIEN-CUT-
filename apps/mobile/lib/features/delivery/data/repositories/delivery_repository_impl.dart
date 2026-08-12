import '../../../../services/delivery_service.dart';
import '../../domain/entities/delivery_assignment.dart';
import '../../domain/entities/delivery_location_point.dart';
import '../../domain/entities/delivery_otp_status.dart';
import '../../domain/repositories/delivery_repository.dart';

class DeliveryRepositoryImpl implements DeliveryRepository {
  final DeliveryService _service;
  DeliveryRepositoryImpl({DeliveryService? service}) : _service = service ?? DeliveryService();

  @override
  Future<DeliveryAssignment?> fetchAssignment(String orderId) async {
    final raw = await _service.fetchAssignment(orderId);
    return raw == null ? null : DeliveryAssignment.fromMap(raw);
  }

  @override
  Stream<DeliveryAssignment?> watchAssignment(String orderId) {
    return _service.watchAssignment(orderId).map((raw) => raw == null ? null : DeliveryAssignment.fromMap(raw));
  }

  @override
  Stream<DeliveryLocationPoint?> watchLatestLocation(String assignmentId) {
    return _service.watchLatestLocation(assignmentId).map((raw) => raw == null ? null : DeliveryLocationPoint.fromMap(raw));
  }

  @override
  Stream<DeliveryOtpStatus?> watchOtpStatus(String orderId) {
    return _service.watchOtpStatus(orderId).map((raw) => raw == null ? null : DeliveryOtpStatus.fromMap(raw));
  }

  @override
  Future<void> assignDelivery(String orderId) async {
    await _service.assignDelivery(orderId);
  }

  @override
  Future<bool> verifyOtp(String orderId, String otpCode) async {
    final result = await _service.verifyOtp(orderId, otpCode);
    return result['verified'] == true;
  }

  @override
  Future<void> completeDelivery(String orderId) async {
    await _service.completeDelivery(orderId);
  }

  @override
  Future<void> estimateEta(String orderId) async {
    await _service.estimateEta(orderId);
  }
}
