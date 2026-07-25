class ReportResult {
  final String reportType;
  final List<String> columns;
  final List<Map<String, dynamic>> rows;

  const ReportResult({required this.reportType, required this.columns, required this.rows});

  factory ReportResult.fromJson(Map<String, dynamic> json) => ReportResult(
        reportType: json['reportType']?.toString() ?? '',
        columns: ((json['columns'] as List?) ?? const []).map((e) => e.toString()).toList(),
        rows: ((json['rows'] as List?) ?? const []).map((e) => Map<String, dynamic>.from(e as Map)).toList(),
      );
}

class ReportType {
  ReportType._();

  static const sales = 'sales';
  static const inventory = 'inventory';
  static const orders = 'orders';
  static const delivery = 'delivery';
  static const payments = 'payments';
  static const customer = 'customer';

  static const all = <String>[sales, inventory, orders, delivery, payments, customer];

  static String label(String type) => switch (type) {
        sales => 'Sales',
        inventory => 'Inventory',
        orders => 'Orders',
        delivery => 'Delivery',
        payments => 'Payments',
        customer => 'Customers',
        _ => type,
      };
}
