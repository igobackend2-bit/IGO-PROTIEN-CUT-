import 'combo_pack.dart';
import 'coupon.dart';
import 'offer.dart';

abstract class CouponsRepository {
  Future<List<Coupon>> listCoupons();

  Future<Coupon> createCoupon(String code, Coupon draft);

  Future<Coupon> updateCoupon(String id, Coupon draft);

  Future<Coupon> disableCoupon(String id);

  Future<Coupon> expireCoupon(String id);

  Future<void> deleteCoupon(String id);

  Future<List<Offer>> listOffers();

  Future<Offer> createOffer(Offer draft);

  Future<Offer> updateOffer(String id, Offer draft);

  Future<Offer> setOfferActive(String id, bool active);

  Future<void> deleteOffer(String id);

  Future<List<ComboPack>> listComboPacks();

  Future<ComboPack> createComboPack({
    required String title,
    required List<ComboPackItem> items,
    String? description,
    num discount = 0,
    String bundleType = 'fixed',
    int? pickCount,
    String? bannerImageUrl,
    bool active = true,
  });

  Future<ComboPack> updateComboPack(
    String id, {
    String? title,
    String? description,
    num? discount,
    String? bundleType,
    int? pickCount,
    String? bannerImageUrl,
  });

  Future<ComboPack> setComboPackActive(String id, bool active);

  Future<void> deleteComboPack(String id);
}
