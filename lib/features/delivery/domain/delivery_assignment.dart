import 'delivery_partner.dart';

/// Field names for the assignment's own columns are inferred from the
/// `delivery` reportType in admin-reports (assignment_id, order_id,
/// partner_name, status, assigned_at, picked_up_at, delivered_at,
/// eta_minutes) since `ASSIGNMENT_SELECT` in admin-delivery is a bare `*`.
class DeliveryAssignment {
  final String id;
  final String? orderId;
  final String? partnerId;
  final String status;
  final DateTime? assignedAt;
  final DateTime? pickedUpAt;
  final DateTime? deliveredAt;
  final num? etaMinutes;
  final DeliveryPartner? partner;
  final String? orderStatus;
  final num? orderTotal;

  const DeliveryAssignment({
    required this.id,
    this.orderId,
    this.partnerId,
    required this.status,
    this.assignedAt,
    this.pickedUpAt,
    this.deliveredAt,
    this.etaMinutes,
    this.partner,
    this.orderStatus,
    this.orderTotal,
  });

  factory DeliveryAssignment.fromJson(Map<String, dynamic> json) {
    final partnerJson = json['delivery_partners'];
    final orderJson = json['orders'];
    return DeliveryAssignment(
      id: json['id'].toString(),
      orderId: json['order_id']?.toString(),
      partnerId: json['partner_id']?.toString(),
      status: json['status']?.toString() ?? 'Unknown',
      assignedAt: DateTime.tryParse(json['assigned_at']?.toString() ?? ''),
      pickedUpAt: DateTime.tryParse(json['picked_up_at']?.toString() ?? ''),
      deliveredAt: DateTime.tryParse(json['delivered_at']?.toString() ?? ''),
      etaMinutes: json['eta_minutes'] as num?,
      partner: partnerJson is Map ? DeliveryPartner.fromJson(Map<String, dynamic>.from(partnerJson)) : null,
      orderStatus: orderJson is Map ? orderJson['status']?.toString() : null,
      orderTotal: orderJson is Map ? orderJson['total_price'] as num? : null,
    );
  }
}

class DeliveryLocation {
  final num? lat;
  final num? lng;
  final DateTime? recordedAt;

  const DeliveryLocation({this.lat, this.lng, this.recordedAt});

  factory DeliveryLocation.fromJson(Map<String, dynamic> json) => DeliveryLocation(
        lat: json['lat'] as num?,
        lng: json['lng'] as num?,
        recordedAt: DateTime.tryParse(json['recorded_at']?.toString() ?? ''),
      );
}
