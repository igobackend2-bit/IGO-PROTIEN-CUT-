class DeliveryPartner {
  final String id;
  final String name;
  final String phone;
  final String? vehicleNumber;
  final String? vehicleType;
  final double? rating;
  final String? photoUrl;
  final bool isActive;

  const DeliveryPartner({
    required this.id,
    required this.name,
    required this.phone,
    this.vehicleNumber,
    this.vehicleType,
    this.rating,
    this.photoUrl,
    this.isActive = true,
  });

  factory DeliveryPartner.fromMap(Map<String, dynamic> map) {
    return DeliveryPartner(
      id: (map['id'] ?? '').toString(),
      name: (map['name'] ?? 'Delivery Partner').toString(),
      phone: (map['phone'] ?? '').toString(),
      vehicleNumber: map['vehicle_number'] as String?,
      vehicleType: map['vehicle_type'] as String?,
      rating: (map['rating'] as num?)?.toDouble(),
      photoUrl: map['photo_url'] as String?,
      isActive: (map['is_active'] as bool?) ?? true,
    );
  }
}
