import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/core_providers.dart';
import 'permission_codes.dart';

/// Resolves the current admin's full permission set once, right after login
/// / session restore, by asking the `admin_has_permission` Postgres RPC
/// (supabase/migrations/phase18_admin.sql) about every known code in
/// parallel. That RPC is the exact function the admin-* Edge Functions use
/// server-side to authorize each action — reusing it here means the UI can
/// hide/disable actions a user isn't allowed to perform without maintaining
/// a second copy of the role→permission matrix.
class PermissionsController extends AsyncNotifier<Set<String>> {
  @override
  Future<Set<String>> build() async {
    // Watching the auth-state stream (not just the client) is what makes
    // this rebuild on sign-in/sign-out — the SupabaseClient instance itself
    // never changes, only its internal currentUser.
    ref.watch(authStateChangesProvider);
    final user = ref.watch(supabaseClientProvider).auth.currentUser;
    if (user == null) return const {};
    return _resolveAll(user.id);
  }

  Future<Set<String>> _resolveAll(String userId) async {
    final client = ref.read(supabaseClientProvider);
    final results = await Future.wait(
      PermissionCodes.all.map((code) async {
        try {
          final allowed = await client.rpc(
            'admin_has_permission',
            params: {'p_user_id': userId, 'p_permission': code},
          );
          return MapEntry(code, allowed == true);
        } catch (_) {
          return MapEntry(code, false);
        }
      }),
    );
    return {for (final e in results.where((e) => e.value)) e.key};
  }

  Future<void> refresh() async {
    final user = ref.read(supabaseClientProvider).auth.currentUser;
    if (user == null) {
      state = const AsyncValue.data({});
      return;
    }
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _resolveAll(user.id));
  }

  bool has(String code) => state.value?.contains(code) ?? false;

  bool hasAny(Iterable<String> codes) => codes.any(has);
}

final permissionsControllerProvider =
    AsyncNotifierProvider<PermissionsController, Set<String>>(
  PermissionsController.new,
);
