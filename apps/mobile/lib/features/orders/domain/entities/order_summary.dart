import '../../../../models/order_status.dart';
import '../../../../utils/id_format.dart';

class OrderItemSummary {
  final String id;
  final String productId;
  final String productName;
  final String productImageUrl;
  final String productCategory;
  final int quantity;
  final double price;

  const OrderItemSummary({
    required this.id,
    required this.productId,
    required this.productName,
    required this.productImageUrl,
    required this.productCategory,
    required this.quantity,
    required this.price,
  });

  double get subtotal => price * quantity;

  factory OrderItemSummary.fromMap(Map<String, dynamic> map) {
    final product = map['products'];
    final productMap = product is Map ? product : const {};
    return OrderItemSummary(
      id: (map['id'] ?? '').toString(),
      productId: (productMap['id'] ?? map['product_id'] ?? '').toString(),
      productName: (productMap['name'] ?? 'Unknown Item').toString(),
      productImageUrl: (productMap['image_url'] ?? '').toString(),
      productCategory: (productMap['category'] ?? '').toString(),
      quantity: (map['quantity'] as num?)?.toInt() ?? 1,
      price: ((map['price'] ?? 0) as num).toDouble(),
    );
  }
}

class DeliveryAddressSummary {
  final String fullName;
  final String phone;
  final String formattedAddress;
  final double? latitude;
  final double? longitude;

  const DeliveryAddressSummary({
    required this.fullName,
    required this.phone,
    required this.formattedAddress,
    this.latitude,
    this.longitude,
  });

  static DeliveryAddressSummary? fromMap(dynamic map) {
    if (map is! Map) return null;
    final parts = [map['house'], map['street'], map['area'], map['landmark'], map['city'], map['state'], map['pincode']]
        .where((p) => p != null && p.toString().trim().isNotEmpty)
        .join(', ');
    return DeliveryAddressSummary(
      fullName: (map['full_name'] ?? '').toString(),
      phone: (map['phone'] ?? '').toString(),
      formattedAddress: parts,
      latitude: (map['latitude'] as num?)?.toDouble(),
      longitude: (map['longitude'] as num?)?.toDouble(),
    );
  }
}

class DeliveryPartnerSummary {
  final String name;
  final String phone;
  final String? vehicleNumber;
  final double? rating;

  const DeliveryPartnerSummary({required this.name, required this.phone, this.vehicleNumber, this.rating});

  static DeliveryPartnerSummary? fromMap(dynamic map) {
    if (map is! Map) return null;
    return DeliveryPartnerSummary(
      name: (map['name'] ?? 'Delivery Partner').toString(),
      phone: (map['phone'] ?? '').toString(),
      vehicleNumber: map['vehicle_number'] as String?,
      rating: (map['rating'] as num?)?.toDouble(),
    );
  }
}

class OrderSummary {
  final String id;
  final double totalPrice;
  final OrderStatus status;
  final DateTime createdAt;
  final List<OrderItemSummary> items;
  final String? deliverySlot;
  final String? paymentMethod;
  final String? deliveryInstructions;
  final String? giftNote;
  final double? discountAmount;
  final double? deliveryFee;
  final double? taxAmount;
  final String? couponCode;
  final DeliveryAddressSummary? address;
  final DeliveryPartnerSummary? deliveryPartner;
  final String? deliveryOtp;
  final DateTime? cancelledAt;
  final String? cancelReason;

  const OrderSummary({
    required this.id,
    required this.totalPrice,
    required this.status,
    required this.createdAt,
    required this.items,
    this.deliverySlot,
    this.paymentMethod,
    this.deliveryInstructions,
    this.giftNote,
    this.discountAmount,
    this.deliveryFee,
    this.taxAmount,
    this.couponCode,
    this.address,
    this.deliveryPartner,
    this.deliveryOtp,
    this.cancelledAt,
    this.cancelReason,
  });

  String get itemsSummary => items.map((i) => '${i.productName} x${i.quantity}').join(', ');
  String get shortOrderId => shortId(id);

  factory OrderSummary.fromMap(Map<String, dynamic> map) {
    final itemsList = (map['order_items'] as List? ?? [])
        .whereType<Map>()
        .map((e) => OrderItemSummary.fromMap(Map<String, dynamic>.from(e)))
        .toList();

    return OrderSummary(
      id: (map['id'] ?? '').toString(),
      totalPrice: ((map['total_price'] ?? 0) as num).toDouble(),
      status: OrderStatus.fromString(map['status'] as String?),
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
      items: itemsList,
      deliverySlot: map['delivery_slot'] as String?,
      paymentMethod: map['payment_method'] as String?,
      deliveryInstructions: map['delivery_instructions'] as String?,
      giftNote: map['gift_note'] as String?,
      discountAmount: (map['discount_amount'] as num?)?.toDouble(),
      deliveryFee: (map['delivery_fee'] as num?)?.toDouble(),
      taxAmount: (map['tax_amount'] as num?)?.toDouble(),
      couponCode: map['coupon_code'] as String?,
      address: DeliveryAddressSummary.fromMap(map['addresses']),
      deliveryPartner: DeliveryPartnerSummary.fromMap(map['delivery_partners']),
      deliveryOtp: map['delivery_otp'] as String?,
      cancelledAt: DateTime.tryParse(map['cancelled_at']?.toString() ?? ''),
      cancelReason: map['cancel_reason'] as String?,
    );
  }
}
