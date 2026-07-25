import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../cart/domain/entities/coupon.dart';
import '../../../cart/presentation/providers/cart_providers.dart';

/// Reuses Cart's existing CouponRepository — no second coupon data source.
final couponListingProvider = FutureProvider.autoDispose<List<CouponListing>>((ref) {
  return ref.watch(couponRepositoryProvider).fetchAvailableCoupons();
});
