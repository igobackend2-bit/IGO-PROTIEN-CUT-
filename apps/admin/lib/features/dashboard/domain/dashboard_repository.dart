import 'dashboard_summary.dart';

abstract class DashboardRepository {
  /// [period] is one of 'daily' | 'weekly' | 'monthly', matching
  /// admin-analytics `summary`.
  Future<DashboardSummary> loadSummary({required String period});
}
