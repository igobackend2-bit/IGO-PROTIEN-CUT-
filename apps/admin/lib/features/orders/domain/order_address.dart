class OrderAddress {
  final String? fullName;
  final String? phone;
  final String? house;
  final String? street;
  final String? area;
  final String? landmark;
  final String? city;
  final String? state;
  final String? pincode;

  const OrderAddress({
    this.fullName,
    this.phone,
    this.house,
    this.street,
    this.area,
    this.landmark,
    this.city,
    this.state,
    this.pincode,
  });

  factory OrderAddress.fromJson(Map<String, dynamic> json) => OrderAddress(
        fullName: json['full_name']?.toString(),
        phone: json['phone']?.toString(),
        house: json['house']?.toString(),
        street: json['street']?.toString(),
        area: json['area']?.toString(),
        landmark: json['landmark']?.toString(),
        city: json['city']?.toString(),
        state: json['state']?.toString(),
        pincode: json['pincode']?.toString(),
      );

  String get oneLine => [house, street, area, landmark, city, state, pincode]
      .where((e) => e != null && e.isNotEmpty)
      .join(', ');
}
