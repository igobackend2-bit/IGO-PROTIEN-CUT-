import '../../../core/network/edge_function_client.dart';
import '../domain/dashboard_repository.dart';
import '../domain/dashboard_summary.dart';

class DashboardRepositoryImpl implements DashboardRepository {
  final EdgeFunctionClient _client;

  DashboardRepositoryImpl(this._client);

  @override
  Future<DashboardSummary> loadSummary({required String period}) async {
    final dateTo = DateTime.now().toUtc();
    final dateFrom = dateTo.subtract(const Duration(days: 30));

    final results = await Future.wait([
      _client.invoke('admin-analytics', 'summary', {'period': period}),
      _client.invoke('admin-products', 'list', {'limit': 1}),
      _client.invoke('admin-inventory', 'listLowStock'),
      _client.invoke('admin-delivery', 'list', {'limit': 1}),
      _client.invoke('admin-support', 'listTickets', {'status': 'Open', 'limit': 1}),
      _client.invoke('admin-users', 'list', {'limit': 1}),
      _client.invoke('admin-reports', 'generate', {
        'reportType': 'sales',
        'dateFrom': dateFrom.toIso8601String(),
        'dateTo': dateTo.toIso8601String(),
      }),
      _client.invoke('admin-orders', 'list', {'limit': 5}),
    ]);

    final analytics = results[0];
    final products = results[1];
    final lowStock = results[2];
    final delivery = results[3];
    final support = results[4];
    final users = results[5];
    final salesReport = results[6];
    final recentOrdersResponse = results[7];

    final sales = (analytics['sales'] as Map?) ?? const {};
    final customers = (analytics['customers'] as Map?) ?? const {};
    final topProducts = ((analytics['topProducts'] as List?) ?? const [])
        .map((e) => TopProductEntry.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    final topCategories = ((analytics['topCategories'] as List?) ?? const [])
        .map((e) => TopCategoryEntry.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

    return DashboardSummary(
      period: period,
      revenue: (sales['revenue'] as num?) ?? 0,
      orderCount: (sales['orderCount'] as num?)?.toInt() ?? 0,
      activeCustomers: (customers['active'] as num?)?.toInt() ?? 0,
      newCustomers: (customers['new'] as num?)?.toInt() ?? 0,
      totalCustomers: (users['total'] as num?)?.toInt() ?? 0,
      totalProducts: (products['total'] as num?)?.toInt() ?? 0,
      lowStockCount: ((lowStock['products'] as List?) ?? const []).length,
      pendingDeliveries: (delivery['total'] as num?)?.toInt() ?? 0,
      openTickets: (support['total'] as num?)?.toInt() ?? 0,
      topProducts: topProducts,
      topCategories: topCategories,
      salesTrend: _bucketDaily(salesReport),
      recentOrders: ((recentOrdersResponse['orders'] as List?) ?? const [])
          .map((e) => RecentOrderEntry.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }

  List<DailySales> _bucketDaily(Map<String, dynamic> salesReport) {
    final rows = (salesReport['rows'] as List?) ?? const [];
    final byDay = <String, ({num revenue, Set<String> orderIds})>{};

    for (final raw in rows) {
      final row = Map<String, dynamic>.from(raw as Map);
      final rawDate = row['order_date']?.toString();
      final date = rawDate == null ? null : DateTime.tryParse(rawDate);
      if (date == null) continue;
      final dayKey = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      final lineTotal = (row['line_total'] as num?) ?? 0;
      final orderId = row['order_id']?.toString() ?? '';

      final existing = byDay[dayKey];
      if (existing == null) {
        byDay[dayKey] = (revenue: lineTotal, orderIds: {orderId});
      } else {
        byDay[dayKey] = (revenue: existing.revenue + lineTotal, orderIds: existing.orderIds..add(orderId));
      }
    }

    final entries = byDay.entries.toList()..sort((a, b) => a.key.compareTo(b.key));
    return entries
        .map((e) => DailySales(
              date: DateTime.parse(e.key),
              revenue: e.value.revenue,
              orderCount: e.value.orderIds.length,
            ))
        .toList();
  }
}
