import 'package:supabase_flutter/supabase_flutter.dart';

import 'admin_membership.dart';

abstract class AuthRepository {
  User? get currentUser;

  Future<void> signInWithPassword({required String email, required String password});

  Future<void> signOut();

  Future<void> resetPasswordForEmail(String email);

  /// Null when the user has no row in `admin_users` at all.
  Future<AdminMembership?> fetchOwnMembership(String userId);
}
