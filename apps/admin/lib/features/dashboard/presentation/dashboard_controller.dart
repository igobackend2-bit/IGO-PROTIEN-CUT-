import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';

import '../domain/dashboard_summary.dart';
import 'dashboard_providers.dart';

final dashboardPeriodProvider = StateProvider<String>((ref) => 'daily');

class DashboardController extends AsyncNotifier<DashboardSummary> {
  @override
  Future<DashboardSummary> build() async {
    final period = ref.watch(dashboardPeriodProvider);
    final repo = ref.watch(dashboardRepositoryProvider);
    return repo.loadSummary(period: period);
  }

  Future<void> refresh() async {
    final period = ref.read(dashboardPeriodProvider);
    final repo = ref.read(dashboardRepositoryProvider);
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => repo.loadSummary(period: period));
  }
}

final dashboardControllerProvider =
    AsyncNotifierProvider<DashboardController, DashboardSummary>(DashboardController.new);
