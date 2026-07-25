import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/core_providers.dart';
import '../data/auth_repository_impl.dart';
import '../domain/admin_membership.dart';
import '../domain/auth_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(ref.watch(supabaseClientProvider));
});

/// Re-resolves whenever Supabase auth state changes. Drives both the
/// router's admin-gate redirect and the "not authorized" screen.
final ownMembershipProvider = FutureProvider<AdminMembership?>((ref) async {
  ref.watch(authStateChangesProvider);
  final repo = ref.watch(authRepositoryProvider);
  final user = repo.currentUser;
  if (user == null) return null;
  return repo.fetchOwnMembership(user.id);
});
