class TopProductEntry {
  final String productId;
  final String name;
  final num quantity;
  final num revenue;

  const TopProductEntry({
    required this.productId,
    required this.name,
    required this.quantity,
    required this.revenue,
  });

  factory TopProductEntry.fromJson(Map<String, dynamic> json) => TopProductEntry(
        productId: json['productId']?.toString() ?? '',
        name: json['name']?.toString() ?? 'Unknown',
        quantity: json['quantity'] as num? ?? 0,
        revenue: json['revenue'] as num? ?? 0,
      );
}

class TopCategoryEntry {
  final String category;
  final num quantity;
  final num revenue;

  const TopCategoryEntry({required this.category, required this.quantity, required this.revenue});

  factory TopCategoryEntry.fromJson(Map<String, dynamic> json) => TopCategoryEntry(
        category: json['category']?.toString() ?? 'Unknown',
        quantity: json['quantity'] as num? ?? 0,
        revenue: json['revenue'] as num? ?? 0,
      );
}

/// One day's worth of sales, bucketed client-side from
/// `admin-reports generate(reportType:'sales')` rows — the only endpoint
/// that returns per-order dates, so this is presentation-layer aggregation
/// of existing data, not a new backend computation.
class DailySales {
  final DateTime date;
  final num revenue;
  final int orderCount;

  const DailySales({required this.date, required this.revenue, required this.orderCount});
}

class RecentOrderEntry {
  final String id;
  final String status;
  final num totalPrice;
  final DateTime? createdAt;

  const RecentOrderEntry({
    required this.id,
    required this.status,
    required this.totalPrice,
    required this.createdAt,
  });

  factory RecentOrderEntry.fromJson(Map<String, dynamic> json) => RecentOrderEntry(
        id: json['id']?.toString() ?? '',
        status: json['status']?.toString() ?? 'Unknown',
        totalPrice: json['total_price'] as num? ?? 0,
        createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      );
}

class DashboardSummary {
  final String period;
  final num revenue;
  final int orderCount;
  final int activeCustomers;
  final int newCustomers;
  final int totalCustomers;
  final int totalProducts;
  final int lowStockCount;
  final int pendingDeliveries;
  final int openTickets;
  final List<TopProductEntry> topProducts;
  final List<TopCategoryEntry> topCategories;
  final List<DailySales> salesTrend;
  final List<RecentOrderEntry> recentOrders;

  const DashboardSummary({
    required this.period,
    required this.revenue,
    required this.orderCount,
    required this.activeCustomers,
    required this.newCustomers,
    required this.totalCustomers,
    required this.totalProducts,
    required this.lowStockCount,
    required this.pendingDeliveries,
    required this.openTickets,
    required this.topProducts,
    required this.topCategories,
    required this.salesTrend,
    required this.recentOrders,
  });
}
