import '../../dashboard/domain/dashboard_summary.dart';

/// Raw `admin-analytics summary` response — see
/// supabase/functions/admin-analytics/index.ts. Distinct from the
/// dashboard's `DashboardSummary`, which composes several endpoints; this
/// mirrors exactly what `summary` returns, including refunds/subscriptions
/// which the dashboard doesn't surface.
class AnalyticsSummary {
  final String period;
  final DateTime? from;
  final DateTime? to;
  final int orderCount;
  final num revenue;
  final int activeCustomers;
  final int newCustomers;
  final List<TopProductEntry> topProducts;
  final List<TopCategoryEntry> topCategories;
  final int refundCount;
  final num refundAmount;
  final int activeSubscriptions;
  final int newSubscriptions;
  final bool cached;

  const AnalyticsSummary({
    required this.period,
    this.from,
    this.to,
    required this.orderCount,
    required this.revenue,
    required this.activeCustomers,
    required this.newCustomers,
    required this.topProducts,
    required this.topCategories,
    required this.refundCount,
    required this.refundAmount,
    required this.activeSubscriptions,
    required this.newSubscriptions,
    required this.cached,
  });

  factory AnalyticsSummary.fromJson(Map<String, dynamic> json) {
    final sales = (json['sales'] as Map?) ?? const {};
    final customers = (json['customers'] as Map?) ?? const {};
    final refunds = (json['refunds'] as Map?) ?? const {};
    final subscriptions = (json['subscriptions'] as Map?) ?? const {};
    return AnalyticsSummary(
      period: json['period']?.toString() ?? 'daily',
      from: DateTime.tryParse(json['from']?.toString() ?? ''),
      to: DateTime.tryParse(json['to']?.toString() ?? ''),
      orderCount: (sales['orderCount'] as num?)?.toInt() ?? 0,
      revenue: sales['revenue'] as num? ?? 0,
      activeCustomers: (customers['active'] as num?)?.toInt() ?? 0,
      newCustomers: (customers['new'] as num?)?.toInt() ?? 0,
      topProducts: ((json['topProducts'] as List?) ?? const [])
          .map((e) => TopProductEntry.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      topCategories: ((json['topCategories'] as List?) ?? const [])
          .map((e) => TopCategoryEntry.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      refundCount: (refunds['count'] as num?)?.toInt() ?? 0,
      refundAmount: refunds['amount'] as num? ?? 0,
      activeSubscriptions: (subscriptions['active'] as num?)?.toInt() ?? 0,
      newSubscriptions: (subscriptions['newInPeriod'] as num?)?.toInt() ?? 0,
      cached: json['cached'] as bool? ?? false,
    );
  }
}
