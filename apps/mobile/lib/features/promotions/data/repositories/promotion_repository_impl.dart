import '../../../../services/promotion_service.dart';
import '../../domain/entities/combo_pack.dart';
import '../../domain/entities/offer.dart';
import '../../domain/repositories/promotion_repository.dart';

class PromotionRepositoryImpl implements PromotionRepository {
  final PromotionService _service;
  PromotionRepositoryImpl({PromotionService? service}) : _service = service ?? PromotionService();

  @override
  Future<List<Offer>> fetchActiveOffers() async {
    final raw = await _service.fetchActiveOffers();
    return raw.map(Offer.fromMap).where((o) => o.isLive && !o.isSoldOut).toList();
  }

  @override
  Future<List<Offer>> fetchFlashSaleOffers() async {
    final offers = await fetchActiveOffers();
    return offers.where((o) => o.type == OfferType.flashSale).toList();
  }

  @override
  Future<List<Offer>> fetchFestivalOffers() async {
    final offers = await fetchActiveOffers();
    return offers.where((o) => o.type == OfferType.festival).toList();
  }

  @override
  Future<List<Offer>> fetchFeaturedOffers() async {
    final offers = await fetchActiveOffers();
    return offers.where((o) => o.type == OfferType.featured).toList();
  }

  @override
  Future<List<ComboPack>> fetchActiveComboPacks() async {
    final raw = await _service.fetchActiveComboPacks();
    return raw.map(ComboPack.fromMap).where((c) => c.items.isNotEmpty).toList();
  }

  @override
  Future<ComboPack?> fetchComboPackById(String id) async {
    final raw = await _service.fetchComboPackById(id);
    return raw != null ? ComboPack.fromMap(raw) : null;
  }
}
