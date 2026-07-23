import '../entities/coupon.dart';

abstract class CouponRepository {
  Future<CouponApplyResult> validate(String code, CouponValidationInput input);

  /// All coupons worth showing in "My Coupons" — real backend rows (if the
  /// `coupons` table exists) plus the static promo codes already advertised
  /// elsewhere in the app (WELCOME20/FITBULK/FREESHIP), never fabricated ones.
  Future<List<CouponListing>> fetchAvailableCoupons();

  /// "Best offer suggestion" — the single highest-value code currently
  /// applicable to this cart, or null if nothing applies.
  Future<AppliedCoupon?> findBestOffer(CouponValidationInput input);
}
