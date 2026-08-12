import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/promotion_repository_impl.dart';
import '../../domain/entities/combo_pack.dart';
import '../../domain/entities/offer.dart';
import '../../domain/repositories/promotion_repository.dart';

final promotionRepositoryProvider = Provider<PromotionRepository>((ref) => PromotionRepositoryImpl());

/// Home screen sections read straight off this — one query backs Flash
/// Sale, Festival and Featured everywhere so they can never drift.
final activeOffersProvider = FutureProvider.autoDispose<List<Offer>>((ref) {
  return ref.watch(promotionRepositoryProvider).fetchActiveOffers();
});

final activeComboPacksProvider = FutureProvider.autoDispose<List<ComboPack>>((ref) {
  return ref.watch(promotionRepositoryProvider).fetchActiveComboPacks();
});

class PromotionsState {
  final List<Offer> offers;
  final List<ComboPack> comboPacks;
  final bool isLoading;
  final Object? error;

  const PromotionsState({this.offers = const [], this.comboPacks = const [], this.isLoading = true, this.error});

  List<Offer> get flashSale => offers.where((o) => o.type == OfferType.flashSale).toList();
  List<Offer> get festival => offers.where((o) => o.type == OfferType.festival).toList();
  List<Offer> get featured => offers.where((o) => o.type == OfferType.featured).toList();

  bool get isEmpty => offers.isEmpty && comboPacks.isEmpty;

  PromotionsState copyWith({
    List<Offer>? offers,
    List<ComboPack>? comboPacks,
    bool? isLoading,
    Object? error,
    bool clearError = false,
  }) {
    return PromotionsState(
      offers: offers ?? this.offers,
      comboPacks: comboPacks ?? this.comboPacks,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

/// Backs the full Offers Screen (Featured / Combo Deals / Flash Sale /
/// Festival Campaigns all in one place) with a single loading/error state.
final promotionsProvider = StateNotifierProvider.autoDispose<PromotionsNotifier, PromotionsState>((ref) {
  return PromotionsNotifier(ref.read(promotionRepositoryProvider));
});

class PromotionsNotifier extends StateNotifier<PromotionsState> {
  final PromotionRepository _repository;

  PromotionsNotifier(this._repository) : super(const PromotionsState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final results = await Future.wait([
        _repository.fetchActiveOffers(),
        _repository.fetchActiveComboPacks(),
      ]);
      state = state.copyWith(
        offers: results[0] as List<Offer>,
        comboPacks: results[1] as List<ComboPack>,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e);
    }
  }

  Future<void> refresh() => load();
  Future<void> retry() => load();
}
