enum AddressType {
  home('Home'),
  office('Office'),
  other('Other');

  final String label;
  const AddressType(this.label);

  static AddressType fromString(String? value) {
    return AddressType.values.firstWhere(
      (t) => t.name == value,
      orElse: () => AddressType.other,
    );
  }
}

class Address {
  final String id;
  final String userId;
  final String fullName;
  final String phone;
  final String house;
  final String street;
  final String area;
  final String? landmark;
  final String city;
  final String state;
  final String pincode;
  final double? latitude;
  final double? longitude;
  final AddressType addressType;
  final bool isDefault;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Address({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.phone,
    required this.house,
    required this.street,
    required this.area,
    this.landmark,
    required this.city,
    required this.state,
    required this.pincode,
    this.latitude,
    this.longitude,
    required this.addressType,
    required this.isDefault,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Single-line summary used by compact contexts (order screens, checkout
  /// preview) — kept here so that formatting exists in exactly one place.
  String get formattedOneLine =>
      [house, street, area, if (landmark != null && landmark!.trim().isNotEmpty) landmark, city, state, pincode]
          .where((s) => s != null && s.trim().isNotEmpty)
          .join(', ');

  factory Address.fromMap(Map<String, dynamic> map) {
    return Address(
      id: (map['id'] ?? '').toString(),
      userId: (map['user_id'] ?? '').toString(),
      fullName: (map['full_name'] ?? '').toString(),
      phone: (map['phone'] ?? '').toString(),
      house: (map['house'] ?? '').toString(),
      street: (map['street'] ?? '').toString(),
      area: (map['area'] ?? '').toString(),
      landmark: (map['landmark'] as String?)?.trim().isEmpty == true ? null : map['landmark'] as String?,
      city: (map['city'] ?? '').toString(),
      state: (map['state'] ?? '').toString(),
      pincode: (map['pincode'] ?? '').toString(),
      latitude: (map['latitude'] as num?)?.toDouble(),
      longitude: (map['longitude'] as num?)?.toDouble(),
      addressType: AddressType.fromString(map['address_type'] as String?),
      isDefault: map['is_default'] == true,
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(map['updated_at']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  /// Fields only — no id/user_id/created_at/updated_at, which the backend
  /// owns (id/timestamps auto-generated; user_id set separately from the
  /// authenticated session, never trusted from client state).
  Map<String, dynamic> toInsertMap({required String userId}) {
    return {
      'user_id': userId,
      'full_name': fullName,
      'phone': phone,
      'house': house,
      'street': street,
      'area': area,
      'landmark': landmark,
      'city': city,
      'state': state,
      'pincode': pincode,
      'latitude': latitude,
      'longitude': longitude,
      'address_type': addressType.name,
      'is_default': isDefault,
    };
  }

  Address copyWith({
    String? fullName,
    String? phone,
    String? house,
    String? street,
    String? area,
    String? landmark,
    bool clearLandmark = false,
    String? city,
    String? state,
    String? pincode,
    double? latitude,
    double? longitude,
    AddressType? addressType,
    bool? isDefault,
  }) {
    return Address(
      id: id,
      userId: userId,
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      house: house ?? this.house,
      street: street ?? this.street,
      area: area ?? this.area,
      landmark: clearLandmark ? null : (landmark ?? this.landmark),
      city: city ?? this.city,
      state: state ?? this.state,
      pincode: pincode ?? this.pincode,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      addressType: addressType ?? this.addressType,
      isDefault: isDefault ?? this.isDefault,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
