import 'order_address.dart';
import 'order_item.dart';

/// Mirrors `ORDER_SELECT` in supabase/functions/admin-orders/index.ts.
class Order {
  final String id;
  final String userId;
  final num totalPrice;
  final String status;
  final DateTime? createdAt;
  final String? deliverySlot;
  final String? paymentMethod;
  final String? couponCode;
  final num? discountAmount;
  final num? deliveryFee;
  final num? taxAmount;
  final String? addressId;
  final String? deliveryPartnerId;
  final String? deliveryOtp;
  final DateTime? cancelledAt;
  final String? cancelReason;
  final OrderAddress? address;
  final List<OrderItem> items;

  const Order({
    required this.id,
    required this.userId,
    required this.totalPrice,
    required this.status,
    this.createdAt,
    this.deliverySlot,
    this.paymentMethod,
    this.couponCode,
    this.discountAmount,
    this.deliveryFee,
    this.taxAmount,
    this.addressId,
    this.deliveryPartnerId,
    this.deliveryOtp,
    this.cancelledAt,
    this.cancelReason,
    this.address,
    this.items = const [],
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    final addressJson = json['addresses'];
    final itemsJson = json['order_items'] as List?;
    return Order(
      id: json['id'].toString(),
      userId: json['user_id']?.toString() ?? '',
      totalPrice: json['total_price'] as num? ?? 0,
      status: json['status']?.toString() ?? 'Unknown',
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      deliverySlot: json['delivery_slot']?.toString(),
      paymentMethod: json['payment_method']?.toString(),
      couponCode: json['coupon_code']?.toString(),
      discountAmount: json['discount_amount'] as num?,
      deliveryFee: json['delivery_fee'] as num?,
      taxAmount: json['tax_amount'] as num?,
      addressId: json['address_id']?.toString(),
      deliveryPartnerId: json['delivery_partner_id']?.toString(),
      deliveryOtp: json['delivery_otp']?.toString(),
      cancelledAt: DateTime.tryParse(json['cancelled_at']?.toString() ?? ''),
      cancelReason: json['cancel_reason']?.toString(),
      address: addressJson is Map ? OrderAddress.fromJson(Map<String, dynamic>.from(addressJson)) : null,
      items: (itemsJson ?? const [])
          .map((e) => OrderItem.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }
}
