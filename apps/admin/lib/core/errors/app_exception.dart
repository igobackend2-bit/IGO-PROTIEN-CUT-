/// Thrown by the data layer whenever an Edge Function call or Supabase
/// operation fails. Carries a user-facing [message] plus the optional HTTP
/// [statusCode] the Edge Function responded with (see
/// supabase/functions/_shared/cors.ts `errorResponse`), so the presentation
/// layer can distinguish e.g. 403 (no permission) from 409 (invalid state
/// transition) when it matters, without re-parsing raw exceptions.
class AppException implements Exception {
  final String message;
  final int? statusCode;

  const AppException(this.message, {this.statusCode});

  bool get isForbidden => statusCode == 403;
  bool get isUnauthorized => statusCode == 401;
  bool get isConflict => statusCode == 409;

  @override
  String toString() => message;
}
