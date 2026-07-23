import 'delivery_partner.dart';
import 'delivery_status.dart';

class DeliveryAssignment {
  final String id;
  final String orderId;
  final String partnerId;
  final DeliveryStatus status;
  final int? etaMinutes;
  final double? distanceMeters;
  final DateTime assignedAt;
  final DateTime? pickedUpAt;
  final DateTime? deliveredAt;
  final DateTime? cancelledAt;
  final String? failureReason;
  final DeliveryPartner? partner;

  const DeliveryAssignment({
    required this.id,
    required this.orderId,
    required this.partnerId,
    required this.status,
    required this.assignedAt,
    this.etaMinutes,
    this.distanceMeters,
    this.pickedUpAt,
    this.deliveredAt,
    this.cancelledAt,
    this.failureReason,
    this.partner,
  });

  double? get distanceKm => distanceMeters == null ? null : distanceMeters! / 1000;

  factory DeliveryAssignment.fromMap(Map<String, dynamic> map) {
    final partnerMap = map['delivery_partners'];
    return DeliveryAssignment(
      id: (map['id'] ?? '').toString(),
      orderId: (map['order_id'] ?? '').toString(),
      partnerId: (map['partner_id'] ?? '').toString(),
      status: DeliveryStatus.fromString(map['status'] as String?),
      etaMinutes: (map['eta_minutes'] as num?)?.toInt(),
      distanceMeters: (map['distance_meters'] as num?)?.toDouble(),
      assignedAt: DateTime.tryParse(map['assigned_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
      pickedUpAt: DateTime.tryParse(map['picked_up_at']?.toString() ?? '')?.toLocal(),
      deliveredAt: DateTime.tryParse(map['delivered_at']?.toString() ?? '')?.toLocal(),
      cancelledAt: DateTime.tryParse(map['cancelled_at']?.toString() ?? '')?.toLocal(),
      failureReason: map['failure_reason'] as String?,
      partner: (partnerMap is Map<String, dynamic>) ? DeliveryPartner.fromMap(partnerMap) : null,
    );
  }
}
