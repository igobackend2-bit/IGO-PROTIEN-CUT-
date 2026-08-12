import '../../../core/network/edge_function_client.dart';
import '../domain/combo_pack.dart';
import '../domain/coupon.dart';
import '../domain/coupons_repository.dart';
import '../domain/offer.dart';

class CouponsRepositoryImpl implements CouponsRepository {
  final EdgeFunctionClient _client;

  CouponsRepositoryImpl(this._client);

  @override
  Future<List<Coupon>> listCoupons() async {
    final response = await _client.invoke('admin-coupons', 'listCoupons');
    return ((response['coupons'] as List?) ?? const [])
        .map((e) => Coupon.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  @override
  Future<Coupon> createCoupon(String code, Coupon draft) async {
    final response = await _client.invoke('admin-coupons', 'createCoupon', {'code': code, ...draft.toPayload()});
    return Coupon.fromJson(Map<String, dynamic>.from(response['coupon'] as Map));
  }

  @override
  Future<Coupon> updateCoupon(String id, Coupon draft) async {
    final response = await _client.invoke('admin-coupons', 'updateCoupon', {'id': id, ...draft.toPayload()});
    return Coupon.fromJson(Map<String, dynamic>.from(response['coupon'] as Map));
  }

  @override
  Future<Coupon> disableCoupon(String id) async {
    final response = await _client.invoke('admin-coupons', 'disableCoupon', {'id': id});
    return Coupon.fromJson(Map<String, dynamic>.from(response['coupon'] as Map));
  }

  @override
  Future<Coupon> expireCoupon(String id) async {
    final response = await _client.invoke('admin-coupons', 'expireCoupon', {'id': id});
    return Coupon.fromJson(Map<String, dynamic>.from(response['coupon'] as Map));
  }

  @override
  Future<void> deleteCoupon(String id) => _client.invoke('admin-coupons', 'deleteCoupon', {'id': id});

  @override
  Future<List<Offer>> listOffers() async {
    final response = await _client.invoke('admin-coupons', 'listOffers');
    return ((response['offers'] as List?) ?? const [])
        .map((e) => Offer.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  @override
  Future<Offer> createOffer(Offer draft) async {
    final response = await _client.invoke('admin-coupons', 'createOffer', draft.toPayload());
    return Offer.fromJson(Map<String, dynamic>.from(response['offer'] as Map));
  }

  @override
  Future<Offer> updateOffer(String id, Offer draft) async {
    final response = await _client.invoke('admin-coupons', 'updateOffer', {'id': id, ...draft.toPayload()});
    return Offer.fromJson(Map<String, dynamic>.from(response['offer'] as Map));
  }

  @override
  Future<Offer> setOfferActive(String id, bool active) async {
    final response = await _client.invoke('admin-coupons', 'setOfferActive', {'id': id, 'active': active});
    return Offer.fromJson(Map<String, dynamic>.from(response['offer'] as Map));
  }

  @override
  Future<void> deleteOffer(String id) => _client.invoke('admin-coupons', 'deleteOffer', {'id': id});

  @override
  Future<List<ComboPack>> listComboPacks() async {
    final response = await _client.invoke('admin-coupons', 'listComboPacks');
    return ((response['comboPacks'] as List?) ?? const [])
        .map((e) => ComboPack.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  @override
  Future<ComboPack> createComboPack({
    required String title,
    required List<ComboPackItem> items,
    String? description,
    num discount = 0,
    String bundleType = 'fixed',
    int? pickCount,
    String? bannerImageUrl,
    bool active = true,
  }) async {
    final response = await _client.invoke('admin-coupons', 'createComboPack', {
      'title': title,
      'items': items.map((e) => e.toPayload()).toList(),
      if (description != null && description.isNotEmpty) 'description': description,
      'discount': discount,
      'bundleType': bundleType,
      if (pickCount != null) 'pickCount': pickCount,
      if (bannerImageUrl != null && bannerImageUrl.isNotEmpty) 'bannerImageUrl': bannerImageUrl,
      'active': active,
    });
    return ComboPack.fromJson(Map<String, dynamic>.from(response['comboPack'] as Map));
  }

  @override
  Future<ComboPack> updateComboPack(
    String id, {
    String? title,
    String? description,
    num? discount,
    String? bundleType,
    int? pickCount,
    String? bannerImageUrl,
  }) async {
    final response = await _client.invoke('admin-coupons', 'updateComboPack', {
      'id': id,
      if (title != null) 'title': title,
      if (description != null) 'description': description,
      if (discount != null) 'discount': discount,
      if (bundleType != null) 'bundle_type': bundleType,
      if (pickCount != null) 'pick_count': pickCount,
      if (bannerImageUrl != null) 'banner_image_url': bannerImageUrl,
    });
    return ComboPack.fromJson(Map<String, dynamic>.from(response['comboPack'] as Map));
  }

  @override
  Future<ComboPack> setComboPackActive(String id, bool active) async {
    final response = await _client.invoke('admin-coupons', 'setComboPackActive', {'id': id, 'active': active});
    return ComboPack.fromJson(Map<String, dynamic>.from(response['comboPack'] as Map));
  }

  @override
  Future<void> deleteComboPack(String id) => _client.invoke('admin-coupons', 'deleteComboPack', {'id': id});
}
