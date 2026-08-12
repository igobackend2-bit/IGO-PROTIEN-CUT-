import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../models/product_model.dart';
import '../../../../services/auth_service.dart';
import '../../data/repositories/home_repository_impl.dart';
import '../../data/services/recently_viewed_service.dart';
import '../../domain/entities/home_data.dart';
import '../../domain/repositories/home_repository.dart';

final recentlyViewedServiceProvider = Provider<RecentlyViewedService>((ref) {
  return RecentlyViewedService();
});

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepositoryImpl(
    recentlyViewedService: ref.read(recentlyViewedServiceProvider),
  );
});

/// Display name for the personalized greeting. AuthService is a singleton
/// owned by the Auth module — read-only here, not re-implemented.
final greetingNameProvider = Provider<String>((ref) {
  final user = AuthService().currentUser;
  final name = user?.fullName.trim();
  if (name == null || name.isEmpty) return 'Protein Fan';
  return name.split(' ').first;
});

/// UI-only delivery location selector state (address CRUD is a separate,
/// future module — this just drives the header pill + bottom sheet).
final selectedDeliveryLocationProvider = StateProvider<String>((ref) {
  return 'Kanathur, Chennai';
});

final homeDataProvider = AsyncNotifierProvider<HomeDataNotifier, HomeData>(
  HomeDataNotifier.new,
);

class HomeDataNotifier extends AsyncNotifier<HomeData> {
  @override
  FutureOr<HomeData> build() {
    return ref.read(homeRepositoryProvider).loadHomeData();
  }

  /// Used by pull-to-refresh: keeps showing previous content while refetching.
  Future<void> refresh() async {
    state = const AsyncValue<HomeData>.loading().copyWithPrevious(state);
    state = await AsyncValue.guard(
      () => ref.read(homeRepositoryProvider).loadHomeData(),
    );
  }

  /// Called when the user taps a product from the Home screen. Records the
  /// view locally then refreshes so "Recently Viewed" / "Recommended"
  /// reflect it next time Home is shown.
  Future<void> recordProductView(Product product) async {
    await ref.read(recentlyViewedServiceProvider).recordView(product.id);
  }
}
