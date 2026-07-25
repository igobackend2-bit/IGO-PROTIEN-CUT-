class DeliveryPartner {
  final String id;
  final String name;
  final String phone;
  final String? vehicleNumber;
  final String? vehicleType;
  final String? photoUrl;
  final num rating;
  final bool isActive;

  const DeliveryPartner({
    required this.id,
    required this.name,
    required this.phone,
    this.vehicleNumber,
    this.vehicleType,
    this.photoUrl,
    required this.rating,
    required this.isActive,
  });

  factory DeliveryPartner.fromJson(Map<String, dynamic> json) => DeliveryPartner(
        id: json['id'].toString(),
        name: json['name']?.toString() ?? '',
        phone: json['phone']?.toString() ?? '',
        vehicleNumber: json['vehicle_number']?.toString(),
        vehicleType: json['vehicle_type']?.toString(),
        photoUrl: json['photo_url']?.toString(),
        rating: json['rating'] as num? ?? 5.0,
        isActive: json['is_active'] as bool? ?? true,
      );
}
