import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/core_providers.dart';
import '../data/reports_repository_impl.dart';
import '../domain/report_result.dart';
import '../domain/reports_repository.dart';

final reportsRepositoryProvider = Provider<ReportsRepository>((ref) {
  return ReportsRepositoryImpl(ref.watch(edgeFunctionClientProvider));
});

class ReportsController extends AsyncNotifier<ReportResult?> {
  @override
  Future<ReportResult?> build() async => null;

  Future<void> generate({required String reportType, DateTime? dateFrom, DateTime? dateTo}) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ref.read(reportsRepositoryProvider).generate(reportType: reportType, dateFrom: dateFrom, dateTo: dateTo),
    );
  }
}

final reportsControllerProvider = AsyncNotifierProvider<ReportsController, ReportResult?>(ReportsController.new);
