import 'package:flutter/foundation.dart';

import 'coupon.dart';

/// Flat delivery fee / GST amount reused as-is from the existing Order
/// Detail bill breakdown (₹30 delivery, ₹15 GST & packing) so the preview
/// shown in Cart matches what the order screen shows after checkout.
const double kDeliveryFee = 30.0;
const double kGstAndPacking = 15.0;

@immutable
class CartSummary {
  final double subtotal;
  final double deliveryFee;
  final double discount;
  final double tax;
  final double grandTotal;
  final AppliedCoupon? appliedCoupon;

  const CartSummary({
    required this.subtotal,
    required this.deliveryFee,
    required this.discount,
    required this.tax,
    required this.grandTotal,
    this.appliedCoupon,
  });

  factory CartSummary.compute({required double subtotal, AppliedCoupon? coupon}) {
    final deliveryFee = (coupon?.waivesDelivery ?? false) ? 0.0 : kDeliveryFee;
    final discount = coupon?.discountAmount ?? 0.0;
    final tax = subtotal > 0 ? kGstAndPacking : 0.0;
    final grandTotal = (subtotal - discount + deliveryFee + tax).clamp(0, double.infinity).toDouble();

    return CartSummary(
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      discount: discount,
      tax: tax,
      grandTotal: grandTotal,
      appliedCoupon: coupon,
    );
  }

  static const empty = CartSummary(subtotal: 0, deliveryFee: 0, discount: 0, tax: 0, grandTotal: 0);
}
