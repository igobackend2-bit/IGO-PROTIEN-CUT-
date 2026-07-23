import '../../../../models/product_model.dart';

enum OfferType { flashSale, festival, featured }

enum OfferDiscountType { flat, percent, freeDelivery, cashback }

class Offer {
  final String id;
  final OfferType type;
  final String title;
  final String description;
  final OfferDiscountType discountType;
  final double discountValue;
  final DateTime startDate;
  final DateTime endDate;
  final int priority;
  final bool active;
  final String? bannerImageUrl;
  final String? couponCode;
  final double? minOrderValue;
  final Product? product;
  final String? category;
  final int? totalQuantity;
  final int? remainingQuantity;

  const Offer({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.discountType,
    required this.discountValue,
    required this.startDate,
    required this.endDate,
    required this.priority,
    required this.active,
    this.bannerImageUrl,
    this.couponCode,
    this.minOrderValue,
    this.product,
    this.category,
    this.totalQuantity,
    this.remainingQuantity,
  });

  bool get isLive {
    final now = DateTime.now();
    return active && now.isAfter(startDate) && now.isBefore(endDate);
  }

  /// Null when this offer has no stock cap at all (e.g. a festival banner).
  bool get isSoldOut => remainingQuantity != null && remainingQuantity! <= 0;

  String get discountLabel => switch (discountType) {
        OfferDiscountType.percent => '${discountValue.toStringAsFixed(0)}% OFF',
        OfferDiscountType.flat => '₹${discountValue.toStringAsFixed(0)} OFF',
        OfferDiscountType.freeDelivery => 'FREE DELIVERY',
        OfferDiscountType.cashback => '₹${discountValue.toStringAsFixed(0)} CASHBACK',
      };

  static OfferType _parseType(String? raw) => switch (raw) {
        'flash_sale' => OfferType.flashSale,
        'festival' => OfferType.festival,
        _ => OfferType.featured,
      };

  static OfferDiscountType _parseDiscountType(String? raw) => switch (raw) {
        'percent' => OfferDiscountType.percent,
        'free_delivery' => OfferDiscountType.freeDelivery,
        'cashback' => OfferDiscountType.cashback,
        _ => OfferDiscountType.flat,
      };

  factory Offer.fromMap(Map<String, dynamic> map) {
    final productMap = map['products'];
    return Offer(
      id: (map['id'] ?? '').toString(),
      type: _parseType(map['type'] as String?),
      title: (map['title'] ?? '').toString(),
      description: (map['description'] ?? '').toString(),
      discountType: _parseDiscountType(map['discount_type'] as String?),
      discountValue: (map['discount_value'] as num?)?.toDouble() ?? 0,
      startDate: DateTime.tryParse(map['start_date']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
      endDate: DateTime.tryParse(map['end_date']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
      priority: (map['priority'] as num?)?.toInt() ?? 0,
      active: (map['active'] as bool?) ?? false,
      bannerImageUrl: map['banner_image_url'] as String?,
      couponCode: map['coupon_code'] as String?,
      minOrderValue: (map['min_order_value'] as num?)?.toDouble(),
      product: (productMap is Map<String, dynamic>) ? Product.fromMap(productMap) : null,
      category: map['category'] as String?,
      totalQuantity: (map['total_quantity'] as num?)?.toInt(),
      remainingQuantity: (map['remaining_quantity'] as num?)?.toInt(),
    );
  }
}
