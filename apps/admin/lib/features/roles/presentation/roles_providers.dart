import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/core_providers.dart';
import '../data/roles_repository_impl.dart';
import '../domain/admin_role.dart';
import '../domain/roles_repository.dart';

final rolesRepositoryProvider = Provider<RolesRepository>((ref) {
  return RolesRepositoryImpl(ref.watch(edgeFunctionClientProvider));
});

class RolesController extends AsyncNotifier<List<AdminRole>> {
  @override
  Future<List<AdminRole>> build() => ref.watch(rolesRepositoryProvider).listRoles();

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }
}

class AdminsController extends AsyncNotifier<List<AdminUserEntry>> {
  @override
  Future<List<AdminUserEntry>> build() => ref.watch(rolesRepositoryProvider).listAdmins();

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }

  Future<void> grant({required String userId, required String roleName}) async {
    await ref.read(rolesRepositoryProvider).grantRole(userId: userId, roleName: roleName);
    await refresh();
  }

  Future<void> revoke(String userId) async {
    await ref.read(rolesRepositoryProvider).revokeRole(userId);
    await refresh();
  }
}

final rolesControllerProvider = AsyncNotifierProvider<RolesController, List<AdminRole>>(RolesController.new);

final adminsControllerProvider = AsyncNotifierProvider<AdminsController, List<AdminUserEntry>>(AdminsController.new);
