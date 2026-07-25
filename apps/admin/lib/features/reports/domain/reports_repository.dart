import 'report_result.dart';

abstract class ReportsRepository {
  Future<ReportResult> generate({required String reportType, DateTime? dateFrom, DateTime? dateTo});

  Future<String> generateCsv({required String reportType, DateTime? dateFrom, DateTime? dateTo});
}
