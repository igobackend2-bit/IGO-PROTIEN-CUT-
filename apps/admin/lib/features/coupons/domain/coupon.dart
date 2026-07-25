/// Mirrors `COUPON_FIELDS` in supabase/functions/admin-coupons/index.ts.
/// Targeting fields (`productId`/`category`/`userId`) round-trip through
/// this model but aren't exposed in the create/edit form — building
/// product/category/customer pickers for coupon targeting is out of scope
/// here; new coupons are store-wide until that's added.
class Coupon {
  final String id;
  final String code;
  final String? description;
  final String discountType;
  final num discountValue;
  final num? minOrderValue;
  final bool isActive;
  final DateTime? expiresAt;
  final int? usageLimit;
  final bool oneTimeUse;
  final bool firstOrderOnly;
  final String? productId;
  final String? category;
  final String? userId;

  const Coupon({
    required this.id,
    required this.code,
    this.description,
    required this.discountType,
    required this.discountValue,
    this.minOrderValue,
    required this.isActive,
    this.expiresAt,
    this.usageLimit,
    required this.oneTimeUse,
    required this.firstOrderOnly,
    this.productId,
    this.category,
    this.userId,
  });

  factory Coupon.fromJson(Map<String, dynamic> json) => Coupon(
        id: json['id'].toString(),
        code: json['code']?.toString() ?? '',
        description: json['description']?.toString(),
        discountType: json['discount_type']?.toString() ?? 'flat',
        discountValue: json['discount_value'] as num? ?? 0,
        minOrderValue: json['min_order_value'] as num?,
        isActive: json['is_active'] as bool? ?? true,
        expiresAt: DateTime.tryParse(json['expires_at']?.toString() ?? ''),
        usageLimit: (json['usage_limit'] as num?)?.toInt(),
        oneTimeUse: json['one_time_use'] as bool? ?? false,
        firstOrderOnly: json['first_order_only'] as bool? ?? false,
        productId: json['product_id']?.toString(),
        category: json['category']?.toString(),
        userId: json['user_id']?.toString(),
      );

  Map<String, dynamic> toPayload() => {
        'description': description,
        'discount_type': discountType,
        'discount_value': discountValue,
        'min_order_value': minOrderValue,
        'is_active': isActive,
        'expires_at': expiresAt?.toIso8601String(),
        'usage_limit': usageLimit,
        'one_time_use': oneTimeUse,
        'first_order_only': firstOrderOnly,
      };
}
