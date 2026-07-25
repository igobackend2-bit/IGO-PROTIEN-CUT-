import 'package:supabase_flutter/supabase_flutter.dart';

import '../errors/app_exception.dart';

/// Generic caller for the Phase 18 `admin-*` Edge Functions. Every one of
/// them shares the same contract: a single POST with `{action, ...params}`
/// in the body, returning a JSON object (or `{error}` on failure). This
/// mirrors the pattern already used by the customer app's
/// `lib/services/admin_service.dart` — one call site for the request/error
/// handling, so feature datasources never touch `supabase.functions.invoke`
/// directly.
class EdgeFunctionClient {
  final SupabaseClient _client;

  EdgeFunctionClient(this._client);

  Future<Map<String, dynamic>> invoke(
    String function,
    String action, [
    Map<String, dynamic> params = const {},
  ]) async {
    try {
      final response = await _client.functions.invoke(
        function,
        body: {'action': action, ...params},
      );
      final data = response.data;
      return data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
    } on FunctionException catch (e) {
      final details = e.details;
      final message = (details is Map && details['error'] != null)
          ? details['error'].toString()
          : 'Something went wrong. Please try again.';
      throw AppException(message, statusCode: e.status);
    }
  }
}
