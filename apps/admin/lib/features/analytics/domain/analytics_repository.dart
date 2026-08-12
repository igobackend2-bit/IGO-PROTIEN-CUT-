import 'analytics_summary.dart';

abstract class AnalyticsRepository {
  Future<AnalyticsSummary> summary({required String period, bool forceRefresh = false});
}
