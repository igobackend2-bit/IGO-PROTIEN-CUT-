class CustomerProfile {
  final String id;
  final String? fullName;
  final String? phoneNumber;
  final DateTime? createdAt;

  const CustomerProfile({
    required this.id,
    this.fullName,
    this.phoneNumber,
    this.createdAt,
  });

  factory CustomerProfile.fromJson(Map<String, dynamic> json) => CustomerProfile(
        id: json['id'].toString(),
        fullName: json['full_name']?.toString(),
        phoneNumber: json['phone_number']?.toString(),
        createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      );
}
