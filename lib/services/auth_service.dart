import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_model.dart';

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

      try {
        // Insert profile into the `profiles` table
        await _supabase.from('profiles').insert({
          'id': response.user!.id,
          'full_name': fullName.trim(),
          'phone_number': phoneNumber.trim(),
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

      _currentUser = UserModel(
        id: uid,
        fullName: data?['full_name'] as String? ??
            authUser.userMetadata?['full_name'] as String? ??
            'Protein Fan',
        email: authUser.email ?? '',
        phoneNumber: data?['phone_number'] as String? ??
            authUser.userMetadata?['phone_number'] as String? ??
            '',
        createdAt: authUser.createdAt != null
            ? DateTime.parse(authUser.createdAt)
            : DateTime.now(),
      );
    } catch (_) {
      // Fallback to auth metadata if profile row doesn't exist
      _currentUser = UserModel(
        id: uid,
        fullName: authUser.userMetadata?['full_name'] as String? ?? 'Protein Fan',
        email: authUser.email ?? '',
        phoneNumber: authUser.userMetadata?['phone_number'] as String? ?? '',
        createdAt: DateTime.now(),
      );
    }
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
