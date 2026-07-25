import '../entities/combo_pack.dart';
import '../entities/offer.dart';

abstract class PromotionRepository {
  /// All currently-active, currently-in-window offers, highest priority first.
  Future<List<Offer>> fetchActiveOffers();

  Future<List<Offer>> fetchFlashSaleOffers();
  Future<List<Offer>> fetchFestivalOffers();
  Future<List<Offer>> fetchFeaturedOffers();

  Future<List<ComboPack>> fetchActiveComboPacks();
  Future<ComboPack?> fetchComboPackById(String id);
}
