import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/offer.dart';
import 'coupons_providers.dart';

class OffersListController extends AsyncNotifier<List<Offer>> {
  @override
  Future<List<Offer>> build() => ref.watch(couponsRepositoryProvider).listOffers();

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }

  Future<void> setActive(String id, bool active) async {
    await ref.read(couponsRepositoryProvider).setOfferActive(id, active);
    await refresh();
  }

  Future<void> delete(String id) async {
    await ref.read(couponsRepositoryProvider).deleteOffer(id);
    await refresh();
  }
}

final offersListControllerProvider =
    AsyncNotifierProvider<OffersListController, List<Offer>>(OffersListController.new);
