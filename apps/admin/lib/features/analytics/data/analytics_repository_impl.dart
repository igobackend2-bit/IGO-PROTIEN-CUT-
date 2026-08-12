import '../../../core/network/edge_function_client.dart';
import '../domain/analytics_repository.dart';
import '../domain/analytics_summary.dart';

class AnalyticsRepositoryImpl implements AnalyticsRepository {
  final EdgeFunctionClient _client;

  AnalyticsRepositoryImpl(this._client);

  @override
  Future<AnalyticsSummary> summary({required String period, bool forceRefresh = false}) async {
    final response = await _client.invoke('admin-analytics', 'summary', {
      'period': period,
      if (forceRefresh) 'forceRefresh': true,
    });
    return AnalyticsSummary.fromJson(response);
  }
}
