import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';

import '../../../core/providers/core_providers.dart';
import '../data/analytics_repository_impl.dart';
import '../domain/analytics_repository.dart';
import '../domain/analytics_summary.dart';

final analyticsRepositoryProvider = Provider<AnalyticsRepository>((ref) {
  return AnalyticsRepositoryImpl(ref.watch(edgeFunctionClientProvider));
});

final analyticsPeriodProvider = StateProvider<String>((ref) => 'daily');

class AnalyticsController extends AsyncNotifier<AnalyticsSummary> {
  @override
  Future<AnalyticsSummary> build() async {
    final period = ref.watch(analyticsPeriodProvider);
    final repo = ref.watch(analyticsRepositoryProvider);
    return repo.summary(period: period);
  }

  Future<void> refresh({bool forceRefresh = false}) async {
    final period = ref.read(analyticsPeriodProvider);
    final repo = ref.read(analyticsRepositoryProvider);
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => repo.summary(period: period, forceRefresh: forceRefresh));
  }
}

final analyticsControllerProvider =
    AsyncNotifierProvider<AnalyticsController, AnalyticsSummary>(AnalyticsController.new);
