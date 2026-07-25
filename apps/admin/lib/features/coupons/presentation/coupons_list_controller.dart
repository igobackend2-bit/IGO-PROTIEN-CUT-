import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/coupon.dart';
import 'coupons_providers.dart';

class CouponsListController extends AsyncNotifier<List<Coupon>> {
  @override
  Future<List<Coupon>> build() => ref.watch(couponsRepositoryProvider).listCoupons();

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }

  Future<void> disable(String id) async {
    await ref.read(couponsRepositoryProvider).disableCoupon(id);
    await refresh();
  }

  Future<void> expire(String id) async {
    await ref.read(couponsRepositoryProvider).expireCoupon(id);
    await refresh();
  }

  Future<void> delete(String id) async {
    await ref.read(couponsRepositoryProvider).deleteCoupon(id);
    await refresh();
  }
}

final couponsListControllerProvider =
    AsyncNotifierProvider<CouponsListController, List<Coupon>>(CouponsListController.new);
