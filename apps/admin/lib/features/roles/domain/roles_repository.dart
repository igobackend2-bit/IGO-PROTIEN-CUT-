import 'admin_role.dart';

abstract class RolesRepository {
  Future<List<AdminRole>> listRoles();

  Future<List<AdminUserEntry>> listAdmins();

  Future<void> grantRole({required String userId, required String roleName});

  Future<void> revokeRole(String userId);
}
