import '../../../core/network/edge_function_client.dart';
import '../domain/delivery_assignment.dart';
import '../domain/delivery_partner.dart';
import '../domain/delivery_repository.dart';

class DeliveryRepositoryImpl implements DeliveryRepository {
  final EdgeFunctionClient _client;

  DeliveryRepositoryImpl(this._client);

  @override
  Future<DeliveryAssignmentListResult> list({
    String? status,
    String? partnerId,
    int limit = 50,
    int offset = 0,
  }) async {
    final response = await _client.invoke('admin-delivery', 'list', {
      if (status != null && status.isNotEmpty) 'status': status,
      if (partnerId != null && partnerId.isNotEmpty) 'partnerId': partnerId,
      'limit': limit,
      'offset': offset,
    });
    final assignments = ((response['assignments'] as List?) ?? const [])
        .map((e) => DeliveryAssignment.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    return DeliveryAssignmentListResult(
      assignments: assignments,
      total: (response['total'] as num?)?.toInt() ?? assignments.length,
    );
  }

  @override
  Future<DeliveryAssignment> getAssignment(String assignmentId) async {
    final response = await _client.invoke('admin-delivery', 'get', {'assignmentId': assignmentId});
    return DeliveryAssignment.fromJson(Map<String, dynamic>.from(response['assignment'] as Map));
  }

  @override
  Future<LiveStatusResult> liveStatus(String assignmentId, {int limit = 20}) async {
    final response = await _client.invoke('admin-delivery', 'liveStatus', {
      'assignmentId': assignmentId,
      'limit': limit,
    });
    final assignment = DeliveryAssignment.fromJson(Map<String, dynamic>.from(response['assignment'] as Map));
    final locations = ((response['locations'] as List?) ?? const [])
        .map((e) => DeliveryLocation.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    return LiveStatusResult(assignment: assignment, locations: locations);
  }

  @override
  Future<List<DeliveryPartner>> listPartners() async {
    final response = await _client.invoke('admin-delivery', 'listPartners');
    return ((response['partners'] as List?) ?? const [])
        .map((e) => DeliveryPartner.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  @override
  Future<DeliveryPartner> createPartner({
    required String name,
    required String phone,
    String? vehicleNumber,
    String? vehicleType,
    String? photoUrl,
    num? rating,
    bool? isActive,
  }) async {
    final response = await _client.invoke('admin-delivery', 'createPartner', {
      'name': name,
      'phone': phone,
      if (vehicleNumber != null && vehicleNumber.isNotEmpty) 'vehicleNumber': vehicleNumber,
      if (vehicleType != null && vehicleType.isNotEmpty) 'vehicleType': vehicleType,
      if (photoUrl != null && photoUrl.isNotEmpty) 'photoUrl': photoUrl,
      if (rating != null) 'rating': rating,
      if (isActive != null) 'isActive': isActive,
    });
    return DeliveryPartner.fromJson(Map<String, dynamic>.from(response['partner'] as Map));
  }

  @override
  Future<DeliveryPartner> updatePartner(
    String partnerId, {
    String? name,
    String? phone,
    String? vehicleNumber,
    String? vehicleType,
    String? photoUrl,
    num? rating,
  }) async {
    final response = await _client.invoke('admin-delivery', 'updatePartner', {
      'partnerId': partnerId,
      if (name != null) 'name': name,
      if (phone != null) 'phone': phone,
      if (vehicleNumber != null) 'vehicleNumber': vehicleNumber,
      if (vehicleType != null) 'vehicleType': vehicleType,
      if (photoUrl != null) 'photoUrl': photoUrl,
      if (rating != null) 'rating': rating,
    });
    return DeliveryPartner.fromJson(Map<String, dynamic>.from(response['partner'] as Map));
  }

  @override
  Future<DeliveryPartner> setPartnerActive(String partnerId, bool isActive) async {
    final response = await _client.invoke('admin-delivery', 'setPartnerActive', {
      'partnerId': partnerId,
      'isActive': isActive,
    });
    return DeliveryPartner.fromJson(Map<String, dynamic>.from(response['partner'] as Map));
  }

  @override
  Future<DeliveryAssignment> reassign({required String assignmentId, required String newPartnerId}) async {
    final response = await _client.invoke('admin-delivery', 'reassign', {
      'assignmentId': assignmentId,
      'newPartnerId': newPartnerId,
    });
    return DeliveryAssignment.fromJson(Map<String, dynamic>.from(response['assignment'] as Map));
  }

  @override
  Future<void> refreshEta(String orderId) => _client.invoke('admin-delivery', 'refreshEta', {'orderId': orderId});
}
