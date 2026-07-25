import '../../../core/network/edge_function_client.dart';
import '../../dashboard/domain/dashboard_summary.dart';
import '../domain/customer_profile.dart';
import '../domain/users_repository.dart';

class UsersRepositoryImpl implements UsersRepository {
  final EdgeFunctionClient _client;

  UsersRepositoryImpl(this._client);

  @override
  Future<CustomerListResult> list({String? search, int limit = 50, int offset = 0}) async {
    final response = await _client.invoke('admin-users', 'list', {
      if (search != null && search.isNotEmpty) 'search': search,
      'limit': limit,
      'offset': offset,
    });
    final customers = ((response['users'] as List?) ?? const [])
        .map((e) => CustomerProfile.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    return CustomerListResult(customers: customers, total: (response['total'] as num?)?.toInt() ?? customers.length);
  }

  @override
  Future<CustomerDetail> getDetail(String userId) async {
    final response = await _client.invoke('admin-users', 'get', {'userId': userId});
    return CustomerDetail(
      profile: CustomerProfile.fromJson(Map<String, dynamic>.from(response['profile'] as Map)),
      email: response['email']?.toString(),
      orderCount: (response['orderCount'] as num?)?.toInt() ?? 0,
      totalSpent: response['totalSpent'] as num? ?? 0,
      recentOrders: ((response['recentOrders'] as List?) ?? const [])
          .map((e) => RecentOrderEntry.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }
}
