import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_model.dart';
import 'loyalty_service.dart';

/// Singleton AuthService backed by Supabase Auth + Profiles table.
class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  /// Supabase client shorthand
  SupabaseClient get _supabase => Supabase.instance.client;

  /// Currently logged-in user (populated after login/signup/isLoggedIn)
  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;

  // ─── Public API ────────────────────────────────────────────────────────────

  /// Returns true if there is an active Supabase session.
  /// Also loads the user profile from the `profiles` table.
  Future<bool> isLoggedIn() async {
    final session = _supabase.auth.currentSession;
    if (session == null) return false;

    try {
      await _loadUserProfile(_supabase.auth.currentUser!.id);
    } catch (_) {
      // Profile may not exist yet — non-fatal
    }
    return true;
  }

  /// Login with email and password.
  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _supabase.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );

      if (response.user == null) {
        return AuthResult.failure('Login failed. Please try again.');
      }

      await _loadUserProfile(response.user!.id);
      return AuthResult.success(_currentUser);
    } on AuthException catch (e) {
      return AuthResult.failure(_mapAuthError(e.message));
    } catch (e) {
      return AuthResult.failure('An unexpected error occurred. Please try again.');
    }
  }

  /// Sign up with full details.
  /// Creates auth user + inserts a row in the `profiles` table.
  Future<AuthResult> signUp({
    required String fullName,
    required String email,
    required String phoneNumber,
    required String password,
    required String confirmPassword,
    String? referralCode,
  }) async {
    // Client-side validation
    if (fullName.trim().isEmpty) {
      return AuthResult.failure('Full name is required.');
    }
    if (phoneNumber.trim().length < 10) {
      return AuthResult.failure('Please enter a valid phone number.');
    }
    if (password != confirmPassword) {
      return AuthResult.failure('Passwords do not match.');
    }

    try {
      final response = await _supabase.auth.signUp(
        email: email.trim(),
        password: password,
        data: {
          'full_name': fullName.trim(),
          'phone_number': phoneNumber.trim(),
        },
      );

      if (response.user == null) {
        return AuthResult.failure('Sign up failed. Please try again.');
      }

      String? referrerId;
      if (referralCode != null && referralCode.trim().isNotEmpty) {
        // Best-effort — an invalid/unknown code just means no referrer is
        // linked, never blocks account creation.
        referrerId = await LoyaltyService().resolveReferralCode(referralCode);
      }

      try {
        // Insert profile into the `profiles` table
        await _supabase.from('profiles').insert({
          'id': response.user!.id,
          'full_name': fullName.trim(),
          'phone_number': phoneNumber.trim(),
          if (referrerId != null) 'referred_by': referrerId,
        });
      } catch (dbError) {
        print('Warning: public.profiles table insert failed: $dbError');
        // Non-fatal: if RLS policy or pending email verification blocks public insert,
        // we fallback to raw auth user_metadata.
      }

      _currentUser = UserModel(
        id: response.user!.id,
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        createdAt: DateTime.now(),
      );

      return AuthResult.success(_currentUser);
    } on AuthException catch (e) {
      print('SignUp AuthException: ${e.message}, statusCode: ${e.statusCode}');
      return AuthResult.failure(_mapAuthError(e.message));
    } catch (e, stack) {
      print('SignUp Unexpected Exception: $e');
      print(stack);
      return AuthResult.failure('An unexpected error occurred. Please try again.');
    }
  }

  /// Sign out and clear session.
  Future<void> logout() async {
    await _supabase.auth.signOut();
    _currentUser = null;
  }

  /// Send a password reset email via Supabase.
  Future<AuthResult> sendPasswordReset(String email) async {
    try {
      await _supabase.auth.resetPasswordForEmail(email.trim());
      return AuthResult.success(
        null,
        message: 'Password reset link sent to $email',
      );
    } on AuthException catch (e) {
      return AuthResult.failure(_mapAuthError(e.message));
    } catch (e) {
      return AuthResult.failure('Failed to send reset email. Please try again.');
    }
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  /// Loads user profile from Supabase `profiles` table.
  Future<void> _loadUserProfile(String uid) async {
    final authUser = _supabase.auth.currentUser;
    if (authUser == null) return;

    try {
      final data = await _supabase
          .from('profiles')
          .select()
          .eq('id', uid)
          .maybeSingle();
      _currentUser = UserModel.fromSupabase(authUser, data);
    } catch (_) {
      // Fallback to auth metadata if profile row doesn't exist
      _currentUser = UserModel.fromSupabase(authUser, null);
    }
  }

  // ─── Profile (Phase 10) ────────────────────────────────────────────────

  /// Updates the editable profile fields and refreshes [currentUser].
  Future<UserModel> updateProfile({
    required String fullName,
    required String phoneNumber,
    DateTime? dateOfBirth,
    String? gender,
  }) async {
    final user = _supabase.auth.currentUser;
    if (user == null) throw Exception('Please log in to update your profile.');

    final payload = {
      'full_name': fullName.trim(),
      'phone_number': phoneNumber.trim(),
      if (dateOfBirth != null) 'date_of_birth': dateOfBirth.toIso8601String().split('T').first,
      if (gender != null) 'gender': gender,
    };

    await _supabase.from('profiles').update(payload).eq('id', user.id);

    _currentUser = (_currentUser ?? UserModel.fromSupabase(user, null)).copyWith(
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      dateOfBirth: dateOfBirth,
      gender: gender,
    );
    return _currentUser!;
  }

  /// Uploads a new avatar to the `avatars` Storage bucket (path
  /// `<userId>/avatar.<ext>`, upserted so it replaces the old image at the
  /// same path) and stores the public URL on the profile row.
  Future<String> uploadProfilePhoto(List<int> bytes, {String fileExt = 'jpg'}) async {
    final user = _supabase.auth.currentUser;
    if (user == null) throw Exception('Please log in to update your photo.');

    final path = '${user.id}/avatar.$fileExt';
    await _supabase.storage.from('avatars').uploadBinary(
          path,
          Uint8List.fromList(bytes),
          fileOptions: const FileOptions(upsert: true),
        );
    // Cache-bust the CDN URL so the new image shows immediately.
    final publicUrl = '${_supabase.storage.from('avatars').getPublicUrl(path)}?t=${DateTime.now().millisecondsSinceEpoch}';

    await _supabase.from('profiles').update({'profile_image_url': publicUrl}).eq('id', user.id);
    _currentUser = (_currentUser ?? UserModel.fromSupabase(user, null)).copyWith(profileImageUrl: publicUrl);
    return publicUrl;
  }

  /// Re-authenticates with the current password before applying the new
  /// one — Supabase's `updateUser` doesn't require the old password itself,
  /// so this sign-in call is what actually enforces it.
  Future<AuthResult> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    final user = _supabase.auth.currentUser;
    if (user == null || user.email == null) {
      return AuthResult.failure('Please log in again to change your password.');
    }
    try {
      await _supabase.auth.signInWithPassword(email: user.email!, password: currentPassword);
    } on AuthException {
      return AuthResult.failure('Current password is incorrect.');
    }

    try {
      await _supabase.auth.updateUser(UserAttributes(password: newPassword));
      return AuthResult.success(_currentUser, message: 'Password updated successfully.');
    } on AuthException catch (e) {
      return AuthResult.failure(_mapAuthError(e.message));
    } catch (_) {
      return AuthResult.failure('Could not update your password. Please try again.');
    }
  }

  /// Signs out this session and every other active session for this user.
  Future<void> logoutAllDevices() async {
    await _supabase.auth.signOut(scope: SignOutScope.global);
    _currentUser = null;
  }

  Future<Map<String, dynamic>> fetchNotificationPreferences() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return _defaultNotificationPrefs;
    try {
      final row = await _supabase
          .from('profiles')
          .select('notify_order_updates, notify_promotions, notify_offers, notify_stock_alerts')
          .eq('id', user.id)
          .maybeSingle();
      if (row == null) return _defaultNotificationPrefs;
      return {
        'notify_order_updates': row['notify_order_updates'] as bool? ?? true,
        'notify_promotions': row['notify_promotions'] as bool? ?? true,
        'notify_offers': row['notify_offers'] as bool? ?? true,
        'notify_stock_alerts': row['notify_stock_alerts'] as bool? ?? true,
      };
    } catch (_) {
      return _defaultNotificationPrefs;
    }
  }

  Map<String, dynamic> get _defaultNotificationPrefs => const {
        'notify_order_updates': true,
        'notify_promotions': true,
        'notify_offers': true,
        'notify_stock_alerts': true,
      };

  Future<void> updateNotificationPreference(String column, bool value) async {
    final user = _supabase.auth.currentUser;
    if (user == null) throw Exception('Please log in.');
    await _supabase.from('profiles').update({column: value}).eq('id', user.id);
  }

  /// Maps Supabase/GoTrue error messages to user-friendly strings.
  String _mapAuthError(String message) {
    final m = message.toLowerCase();
    if (m.contains('invalid login credentials') ||
        m.contains('invalid email or password')) {
      return 'Wrong email or password. Please try again.';
    }
    if (m.contains('email already registered') ||
        m.contains('user already registered')) {
      return 'An account with this email already exists. Please log in.';
    }
    if (m.contains('email not confirmed')) {
      return 'Please verify your email before logging in.';
    }
    if (m.contains('password should be at least')) {
      return 'Password must be at least 6 characters.';
    }
    if (m.contains('unable to validate email address')) {
      return 'Please enter a valid email address.';
    }
    if (m.contains('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (m.contains('network') || m.contains('socket')) {
      return 'Network error. Please check your connection.';
    }
    return message;
  }
}

// ─── Result Wrapper ────────────────────────────────────────────────────────────

class AuthResult {
  final bool isSuccess;
  final String? errorMessage;
  final String? message;
  final UserModel? user;

  AuthResult._({
    required this.isSuccess,
    this.errorMessage,
    this.message,
    this.user,
  });

  factory AuthResult.success(UserModel? user, {String? message}) {
    return AuthResult._(isSuccess: true, user: user, message: message);
  }

  factory AuthResult.failure(String errorMessage) {
    return AuthResult._(isSuccess: false, errorMessage: errorMessage);
  }
}
