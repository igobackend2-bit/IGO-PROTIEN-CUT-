class DeliveryLocationPoint {
  final String id;
  final String assignmentId;
  final double lat;
  final double lng;
  final DateTime recordedAt;

  const DeliveryLocationPoint({
    required this.id,
    required this.assignmentId,
    required this.lat,
    required this.lng,
    required this.recordedAt,
  });

  factory DeliveryLocationPoint.fromMap(Map<String, dynamic> map) {
    return DeliveryLocationPoint(
      id: (map['id'] ?? '').toString(),
      assignmentId: (map['assignment_id'] ?? '').toString(),
      lat: (map['lat'] as num).toDouble(),
      lng: (map['lng'] as num).toDouble(),
      recordedAt: DateTime.tryParse(map['recorded_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
    );
  }
}
