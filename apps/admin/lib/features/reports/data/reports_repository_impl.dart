import '../../../core/network/edge_function_client.dart';
import '../domain/report_result.dart';
import '../domain/reports_repository.dart';

class ReportsRepositoryImpl implements ReportsRepository {
  final EdgeFunctionClient _client;

  ReportsRepositoryImpl(this._client);

  @override
  Future<ReportResult> generate({required String reportType, DateTime? dateFrom, DateTime? dateTo}) async {
    final response = await _client.invoke('admin-reports', 'generate', {
      'reportType': reportType,
      if (dateFrom != null) 'dateFrom': dateFrom.toIso8601String(),
      if (dateTo != null) 'dateTo': dateTo.toIso8601String(),
      'format': 'json',
    });
    return ReportResult.fromJson(response);
  }

  @override
  Future<String> generateCsv({required String reportType, DateTime? dateFrom, DateTime? dateTo}) async {
    final response = await _client.invoke('admin-reports', 'generate', {
      'reportType': reportType,
      if (dateFrom != null) 'dateFrom': dateFrom.toIso8601String(),
      if (dateTo != null) 'dateTo': dateTo.toIso8601String(),
      'format': 'csv',
    });
    return response['csv']?.toString() ?? '';
  }
}
