import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/delivery_partner.dart';
import 'delivery_providers.dart';

class PartnersController extends AsyncNotifier<List<DeliveryPartner>> {
  @override
  Future<List<DeliveryPartner>> build() => ref.watch(deliveryRepositoryProvider).listPartners();

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }

  Future<void> toggleActive(DeliveryPartner partner) async {
    await ref.read(deliveryRepositoryProvider).setPartnerActive(partner.id, !partner.isActive);
    await refresh();
  }
}

final partnersControllerProvider =
    AsyncNotifierProvider<PartnersController, List<DeliveryPartner>>(PartnersController.new);
