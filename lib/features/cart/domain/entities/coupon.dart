import 'package:flutter/foundation.dart';

/// What the caller (Cart) already knows about the cart, needed to validate
/// and price a coupon without the repository reaching back into cart state.
@immutable
class CouponValidationInput {
  final double subtotal;
  final int totalQuantity;

  /// Lowest single unit price across cart lines — used by "buy N get
  /// cheapest free" style coupons (e.g. FITBULK).
  final double minUnitPrice;

  /// Product ids and categories currently in the cart — needed for
  /// product-specific / category-specific coupon conditions (Phase 15).
  final Set<String> productIds;
  final Set<String> categories;

  const CouponValidationInput({
    required this.subtotal,
    required this.totalQuantity,
    required this.minUnitPrice,
    this.productIds = const {},
    this.categories = const {},
  });
}

@immutable
class AppliedCoupon {
  final String code;
  final String description;
  final double discountAmount;
  final bool waivesDelivery;

  /// Set only for cashback-type coupons — the amount doesn't reduce the
  /// price at checkout, it's credited to the wallet after delivery (see
  /// the award_coupon_cashback_on_delivery trigger), so the UI needs to
  /// show it distinctly from a real discount.
  final double? cashbackAmount;

  const AppliedCoupon({
    required this.code,
    required this.description,
    required this.discountAmount,
    this.waivesDelivery = false,
    this.cashbackAmount,
  });
}

/// A coupon shown in the "My Coupons" listing (Profile) — distinct from
/// [AppliedCoupon], which only exists once a code has actually been
/// validated against a cart.
@immutable
class CouponListing {
  final String code;
  final String description;
  final DateTime? expiresAt;

  const CouponListing({required this.code, required this.description, this.expiresAt});

  bool get isExpired => expiresAt != null && expiresAt!.isBefore(DateTime.now());
}

@immutable
class CouponApplyResult {
  final bool isSuccess;
  final String message;
  final AppliedCoupon? coupon;

  const CouponApplyResult._({required this.isSuccess, required this.message, this.coupon});

  factory CouponApplyResult.success({required String message, required AppliedCoupon coupon}) {
    return CouponApplyResult._(isSuccess: true, message: message, coupon: coupon);
  }

  factory CouponApplyResult.failure(String message) {
    return CouponApplyResult._(isSuccess: false, message: message);
  }
}
