import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../services/order_service.dart';
import '../../domain/entities/coupon.dart';
import '../../domain/repositories/coupon_repository.dart';

/// Validates a coupon two ways:
///  1. A real `coupons` table (Phase 15 schema — percent/flat/free
///     delivery/cashback, with expiry, usage limits, one-time-use,
///     first-order-only, and product/category/user-specific conditions).
///  2. The three promo codes already advertised on the Home screen
///     (WELCOME20 / FITBULK / FREESHIP), computed for real against the
///     current cart rather than always "succeeding".
/// No coupon here is invented UI dressing — every code either matches a
/// real backend row or a real promise already shown elsewhere in the app.
class CouponRepositoryImpl implements CouponRepository {
  final SupabaseClient _client;
  final OrderService _orderService;

  CouponRepositoryImpl({SupabaseClient? client, OrderService? orderService})
      : _client = client ?? Supabase.instance.client,
        _orderService = orderService ?? OrderService();

  @override
  Future<CouponApplyResult> validate(String rawCode, CouponValidationInput input) async {
    final code = rawCode.trim().toUpperCase();
    if (code.isEmpty) {
      return CouponApplyResult.failure('Please enter a coupon code.');
    }

    final backendResult = await _tryBackendCoupon(code, input);
    if (backendResult != null) return backendResult;

    return _staticCoupon(code, input);
  }

  Future<CouponApplyResult?> _tryBackendCoupon(String code, CouponValidationInput input) async {
    Map<String, dynamic>? row;
    try {
      row = await _client.from('coupons').select().eq('code', code).eq('is_active', true).maybeSingle();
    } catch (_) {
      // No `coupons` table yet — fall through to the static set.
      return null;
    }
    if (row == null) return null;

    final user = _client.auth.currentUser;

    final expiresAt = DateTime.tryParse(row['expires_at']?.toString() ?? '');
    if (expiresAt != null && expiresAt.isBefore(DateTime.now())) {
      return CouponApplyResult.failure('"$code" has expired.');
    }

    final userId = row['user_id'] as String?;
    if (userId != null && userId != user?.id) {
      return CouponApplyResult.failure('"$code" isn\'t valid for your account.');
    }

    final productId = row['product_id'] as String?;
    if (productId != null && !input.productIds.contains(productId)) {
      return CouponApplyResult.failure('Add the eligible product to your cart to use "$code".');
    }

    final category = row['category'] as String?;
    if (category != null && !input.categories.contains(category)) {
      return CouponApplyResult.failure('"$code" only applies to $category items.');
    }

    final firstOrderOnly = row['first_order_only'] as bool? ?? false;
    if (firstOrderOnly) {
      final orders = await _orderService.fetchOrders();
      if (orders.isNotEmpty) {
        return CouponApplyResult.failure('"$code" is valid on your first order only.');
      }
    }

    final usageLimit = (row['usage_limit'] as num?)?.toInt();
    final oneTimeUse = row['one_time_use'] as bool? ?? false;
    if ((usageLimit != null || oneTimeUse) && user != null) {
      try {
        final orders = await _client.from('orders').select('id, user_id').eq('coupon_code', code);
        final usedRows = List<Map<String, dynamic>>.from(orders as List);
        if (usageLimit != null && usedRows.length >= usageLimit) {
          return CouponApplyResult.failure('"$code" has reached its usage limit.');
        }
        if (oneTimeUse && usedRows.any((o) => o['user_id'] == user.id)) {
          return CouponApplyResult.failure('You\'ve already used "$code".');
        }
      } catch (_) {
        // If usage can't be checked, fail closed on the side of allowing
        // the discount rather than blocking checkout entirely.
      }
    }

    final minOrder = (row['min_order_value'] as num?)?.toDouble() ?? 0;
    if (input.subtotal < minOrder) {
      return CouponApplyResult.failure('Add ₹${(minOrder - input.subtotal).toStringAsFixed(0)} more to use $code.');
    }

    final type = (row['discount_type'] as String?) ?? 'flat';
    final value = (row['discount_value'] as num?)?.toDouble() ?? 0;
    final description = (row['description'] as String?) ?? '$code applied';

    switch (type) {
      case 'percent':
        return CouponApplyResult.success(
          message: '$code applied — ${value.toStringAsFixed(0)}% off!',
          coupon: AppliedCoupon(code: code, description: description, discountAmount: input.subtotal * (value / 100)),
        );
      case 'free_delivery':
        return CouponApplyResult.success(
          message: '$code applied — free delivery!',
          coupon: AppliedCoupon(code: code, description: description, discountAmount: 0, waivesDelivery: true),
        );
      case 'cashback':
        final cashback = value <= 100 ? input.subtotal * (value / 100) : value;
        return CouponApplyResult.success(
          message: '$code applied — ₹${cashback.toStringAsFixed(0)} cashback after delivery!',
          coupon: AppliedCoupon(code: code, description: description, discountAmount: 0, cashbackAmount: cashback),
        );
      case 'flat':
      default:
        return CouponApplyResult.success(
          message: '$code applied — ₹${value.toStringAsFixed(0)} off!',
          coupon: AppliedCoupon(code: code, description: description, discountAmount: value),
        );
    }
  }

  Future<CouponApplyResult> _staticCoupon(String code, CouponValidationInput input) async {
    switch (code) {
      case 'REFER15':
        final orders = await _orderService.fetchOrders();
        if (orders.isNotEmpty) {
          return CouponApplyResult.failure('REFER15 is valid on your first order only.');
        }
        return CouponApplyResult.success(
          message: 'REFER15 applied — 15% off, welcome to Protein Cuts!',
          coupon: AppliedCoupon(
            code: code,
            description: 'Flat 15% off — referred friend\'s first order',
            discountAmount: input.subtotal * 0.15,
          ),
        );

      case 'WELCOME20':
        final orders = await _orderService.fetchOrders();
        if (orders.isNotEmpty) {
          return CouponApplyResult.failure('WELCOME20 is valid on your first order only.');
        }
        return CouponApplyResult.success(
          message: 'WELCOME20 applied — 20% off your first order!',
          coupon: AppliedCoupon(
            code: code,
            description: 'Flat 20% off — first order',
            discountAmount: input.subtotal * 0.20,
          ),
        );

      case 'FREESHIP':
        if (input.subtotal < 499) {
          return CouponApplyResult.failure(
            'Add ₹${(499 - input.subtotal).toStringAsFixed(0)} more to unlock free delivery.',
          );
        }
        return CouponApplyResult.success(
          message: 'FREESHIP applied — delivery is on us!',
          coupon: const AppliedCoupon(
            code: 'FREESHIP',
            description: 'Free delivery on orders above ₹499',
            discountAmount: 0,
            waivesDelivery: true,
          ),
        );

      case 'FITBULK':
        if (input.totalQuantity < 6) {
          return CouponApplyResult.failure(
            'Add ${6 - input.totalQuantity} more item(s) to unlock FITBULK.',
          );
        }
        return CouponApplyResult.success(
          message: 'FITBULK applied — your cheapest item is free!',
          coupon: AppliedCoupon(
            code: code,
            description: 'Buy 6+, get the cheapest item free',
            discountAmount: input.minUnitPrice,
          ),
        );

      default:
        return CouponApplyResult.failure('"$code" is not a valid coupon.');
    }
  }

  static const _staticListings = [
    CouponListing(code: 'REFER15', description: 'Flat 15% off — for friends joining via a referral, first order only'),
    CouponListing(code: 'WELCOME20', description: 'Flat 20% off — valid on your first order only'),
    CouponListing(code: 'FITBULK', description: 'Buy 6+ items, get the cheapest one free'),
    CouponListing(code: 'FREESHIP', description: 'Free delivery on orders above ₹499'),
  ];

  @override
  Future<List<CouponListing>> fetchAvailableCoupons() async {
    final listings = <CouponListing>[..._staticListings];
    try {
      final rows = await _client.from('coupons').select().eq('is_active', true);
      for (final row in (rows as List)) {
        if (row is! Map) continue;
        final code = (row['code'] ?? '').toString();
        if (code.isEmpty) continue;
        listings.add(CouponListing(
          code: code,
          description: (row['description'] ?? '$code applied').toString(),
          expiresAt: DateTime.tryParse(row['expires_at']?.toString() ?? ''),
        ));
      }
    } catch (_) {
      // No `coupons` table yet — the static set above is still shown.
    }
    return listings;
  }

  /// "Best offer suggestion" — tries every known code (backend + static)
  /// against the current cart and returns the one with the highest actual
  /// discount, reusing the exact same validate() path checkout uses so the
  /// suggestion can never diverge from what Apply would actually do.
  @override
  Future<AppliedCoupon?> findBestOffer(CouponValidationInput input) async {
    final codes = <String>{..._staticListings.map((c) => c.code)};
    try {
      final rows = await _client.from('coupons').select('code').eq('is_active', true);
      for (final row in (rows as List)) {
        if (row is Map && row['code'] != null) codes.add(row['code'].toString());
      }
    } catch (_) {
      // Static codes are still tried below.
    }

    AppliedCoupon? best;
    for (final code in codes) {
      final result = await validate(code, input);
      if (!result.isSuccess || result.coupon == null) continue;
      final candidate = result.coupon!;
      final candidateValue = candidate.discountAmount + (candidate.cashbackAmount ?? 0) + (candidate.waivesDelivery ? 30 : 0);
      final bestValue = best == null ? -1 : best.discountAmount + (best.cashbackAmount ?? 0) + (best.waivesDelivery ? 30 : 0);
      if (candidateValue > bestValue) best = candidate;
    }
    return best;
  }
}
