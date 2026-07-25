import 'delivery_assignment.dart';
import 'delivery_partner.dart';

class DeliveryAssignmentListResult {
  final List<DeliveryAssignment> assignments;
  final int total;

  const DeliveryAssignmentListResult({required this.assignments, required this.total});
}

class LiveStatusResult {
  final DeliveryAssignment assignment;
  final List<DeliveryLocation> locations;

  const LiveStatusResult({required this.assignment, required this.locations});
}

abstract class DeliveryRepository {
  Future<DeliveryAssignmentListResult> list({String? status, String? partnerId, int limit = 50, int offset = 0});

  Future<DeliveryAssignment> getAssignment(String assignmentId);

  Future<LiveStatusResult> liveStatus(String assignmentId, {int limit = 20});

  Future<List<DeliveryPartner>> listPartners();

  Future<DeliveryPartner> createPartner({
    required String name,
    required String phone,
    String? vehicleNumber,
    String? vehicleType,
    String? photoUrl,
    num? rating,
    bool? isActive,
  });

  Future<DeliveryPartner> updatePartner(
    String partnerId, {
    String? name,
    String? phone,
    String? vehicleNumber,
    String? vehicleType,
    String? photoUrl,
    num? rating,
  });

  Future<DeliveryPartner> setPartnerActive(String partnerId, bool isActive);

  Future<DeliveryAssignment> reassign({required String assignmentId, required String newPartnerId});

  Future<void> refreshEta(String orderId);
}
