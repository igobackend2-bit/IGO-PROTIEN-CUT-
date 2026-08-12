import '../../../core/network/edge_function_client.dart';
import '../domain/admin_role.dart';
import '../domain/roles_repository.dart';

class RolesRepositoryImpl implements RolesRepository {
  final EdgeFunctionClient _client;

  RolesRepositoryImpl(this._client);

  @override
  Future<List<AdminRole>> listRoles() async {
    final response = await _client.invoke('admin-users', 'listRoles');
    return ((response['roles'] as List?) ?? const [])
        .map((e) => AdminRole.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  @override
  Future<List<AdminUserEntry>> listAdmins() async {
    final response = await _client.invoke('admin-users', 'listAdmins');
    return ((response['admins'] as List?) ?? const [])
        .map((e) => AdminUserEntry.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  @override
  Future<void> grantRole({required String userId, required String roleName}) {
    return _client.invoke('admin-users', 'grantRole', {'userId': userId, 'roleName': roleName});
  }

  @override
  Future<void> revokeRole(String userId) {
    return _client.invoke('admin-users', 'revokeRole', {'userId': userId});
  }
}
