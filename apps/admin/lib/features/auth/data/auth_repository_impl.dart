import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/errors/app_exception.dart';
import '../domain/admin_membership.dart';
import '../domain/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final SupabaseClient _client;

  AuthRepositoryImpl(this._client);

  @override
  User? get currentUser => _client.auth.currentUser;

  @override
  Future<void> signInWithPassword({required String email, required String password}) async {
    try {
      await _client.auth.signInWithPassword(email: email, password: password);
    } on AuthException catch (e) {
      throw AppException(e.message);
    }
  }

  @override
  Future<void> signOut() => _client.auth.signOut();

  @override
  Future<void> resetPasswordForEmail(String email) async {
    try {
      await _client.auth.resetPasswordForEmail(email);
    } on AuthException catch (e) {
      throw AppException(e.message);
    }
  }

  @override
  Future<AdminMembership?> fetchOwnMembership(String userId) async {
    final row = await _client
        .from('admin_users')
        .select()
        .eq('user_id', userId)
        .maybeSingle();
    if (row == null) return null;
    return AdminMembership.fromJson(row);
  }
}
