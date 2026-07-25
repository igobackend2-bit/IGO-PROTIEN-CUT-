/// Mirrors `OFFER_FIELDS`. Targeting/inventory fields (`productId`,
/// `category`, `totalQuantity`/`remainingQuantity`, `couponCode`) round-trip
/// but aren't exposed in the form for the same reason as Coupon.
class Offer {
  final String id;
  final String type;
  final String title;
  final String? description;
  final String? discountType;
  final num? discountValue;
  final DateTime? startDate;
  final DateTime? endDate;
  final int priority;
  final bool active;
  final String? bannerImageUrl;
  final num? minOrderValue;

  const Offer({
    required this.id,
    required this.type,
    required this.title,
    this.description,
    this.discountType,
    this.discountValue,
    this.startDate,
    this.endDate,
    required this.priority,
    required this.active,
    this.bannerImageUrl,
    this.minOrderValue,
  });

  factory Offer.fromJson(Map<String, dynamic> json) => Offer(
        id: json['id'].toString(),
        type: json['type']?.toString() ?? 'banner',
        title: json['title']?.toString() ?? '',
        description: json['description']?.toString(),
        discountType: json['discount_type']?.toString(),
        discountValue: json['discount_value'] as num?,
        startDate: DateTime.tryParse(json['start_date']?.toString() ?? ''),
        endDate: DateTime.tryParse(json['end_date']?.toString() ?? ''),
        priority: (json['priority'] as num?)?.toInt() ?? 0,
        active: json['active'] as bool? ?? true,
        bannerImageUrl: json['banner_image_url']?.toString(),
        minOrderValue: json['min_order_value'] as num?,
      );

  Map<String, dynamic> toPayload() => {
        'type': type,
        'title': title,
        'description': description,
        'discount_type': discountType,
        'discount_value': discountValue,
        'start_date': startDate?.toIso8601String(),
        'end_date': endDate?.toIso8601String(),
        'priority': priority,
        'active': active,
        'banner_image_url': bannerImageUrl,
        'min_order_value': minOrderValue,
      };
}
