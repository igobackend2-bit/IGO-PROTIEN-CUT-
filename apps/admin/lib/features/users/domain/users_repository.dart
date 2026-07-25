import '../../dashboard/domain/dashboard_summary.dart';
import 'customer_profile.dart';

class CustomerListResult {
  final List<CustomerProfile> customers;
  final int total;

  const CustomerListResult({required this.customers, required this.total});
}

class CustomerDetail {
  final CustomerProfile profile;
  final String? email;
  final int orderCount;
  final num totalSpent;
  final List<RecentOrderEntry> recentOrders;

  const CustomerDetail({
    required this.profile,
    this.email,
    required this.orderCount,
    required this.totalSpent,
    required this.recentOrders,
  });
}

abstract class UsersRepository {
  Future<CustomerListResult> list({String? search, int limit = 50, int offset = 0});

  Future<CustomerDetail> getDetail(String userId);
}
