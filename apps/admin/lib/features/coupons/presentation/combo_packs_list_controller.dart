import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/combo_pack.dart';
import 'coupons_providers.dart';

class ComboPacksListController extends AsyncNotifier<List<ComboPack>> {
  @override
  Future<List<ComboPack>> build() => ref.watch(couponsRepositoryProvider).listComboPacks();

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }

  Future<void> setActive(String id, bool active) async {
    await ref.read(couponsRepositoryProvider).setComboPackActive(id, active);
    await refresh();
  }

  Future<void> delete(String id) async {
    await ref.read(couponsRepositoryProvider).deleteComboPack(id);
    await refresh();
  }
}

final comboPacksListControllerProvider =
    AsyncNotifierProvider<ComboPacksListController, List<ComboPack>>(ComboPacksListController.new);
