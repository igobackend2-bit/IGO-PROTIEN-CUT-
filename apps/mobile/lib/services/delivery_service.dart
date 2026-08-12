import 'package:supabase_flutter/supabase_flutter.dart';

/// Shared delivery service, following the same plain-Supabase-wrapper
/// pattern as OrderService/SupportService. All delivery *business logic*
/// (partner assignment, status derivation, OTP verification, ETA math)
/// lives in the Phase 17 Edge Functions — this class only reads the tables
/// they write (respecting the RLS that grants users SELECT-only) and
/// invokes those functions. Nothing here decides anything.
class DeliveryService {
  final SupabaseClient _client = Supabase.instance.client;

  static const _assignmentSelect = '*, delivery_partners (*)';

  Future<Map<String, dynamic>?> fetchAssignment(String orderId) async {
    try {
      return await _client
          .from('delivery_assignments')
          .select(_assignmentSelect)
          .eq('order_id', orderId)
          .order('created_at', ascending: false)
          .limit(1)
          .maybeSingle();
    } catch (_) {
      return null;
    }
  }

  /// Realtime signals *that* the assignment row changed; the full joined
  /// view (including the partner) is then re-fetched — same pattern as
  /// OrderService.watchOrder, since `.stream()` can't express joins.
  Stream<Map<String, dynamic>?> watchAssignment(String orderId) {
    return _client.from('delivery_assignments').stream(primaryKey: ['id']).eq('order_id', orderId).asyncMap((_) => fetchAssignment(orderId));
  }

  Future<Map<String, dynamic>?> fetchLatestLocation(String assignmentId) async {
    try {
      return await _client
          .from('delivery_locations')
          .select()
          .eq('assignment_id', assignmentId)
          .order('recorded_at', ascending: false)
          .limit(1)
          .maybeSingle();
    } catch (_) {
      return null;
    }
  }

  Stream<Map<String, dynamic>?> watchLatestLocation(String assignmentId) {
    return _client
        .from('delivery_locations')
        .stream(primaryKey: ['id'])
        .eq('assignment_id', assignmentId)
        .order('recorded_at')
        .map((rows) => rows.isEmpty ? null : rows.last);
  }

  Future<Map<String, dynamic>?> fetchOtpStatus(String orderId) async {
    try {
      return await _client.from('delivery_otps').select().eq('order_id', orderId).maybeSingle();
    } catch (_) {
      return null;
    }
  }

  Stream<Map<String, dynamic>?> watchOtpStatus(String orderId) {
    return _client
        .from('delivery_otps')
        .stream(primaryKey: ['id'])
        .eq('order_id', orderId)
        .map((rows) => rows.isEmpty ? null : rows.first);
  }

  Future<Map<String, dynamic>> _invoke(String function, Map<String, dynamic> body) async {
    try {
      final response = await _client.functions.invoke(function, body: body);
      final data = response.data;
      return data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
    } on FunctionException catch (e) {
      final details = e.details;
      final message = (details is Map && details['error'] != null) ? details['error'].toString() : 'Something went wrong. Please try again.';
      throw Exception(message);
    }
  }

  /// Opportunistic call — the Edge Function itself decides whether the
  /// order is actually eligible and is idempotent if an assignment already
  /// exists, so this is always safe to call speculatively.
  Future<Map<String, dynamic>> assignDelivery(String orderId) => _invoke('assign-delivery', {'order_id': orderId});

  Future<Map<String, dynamic>> verifyOtp(String orderId, String otpCode) =>
      _invoke('verify-delivery-otp', {'order_id': orderId, 'otp_code': otpCode});

  Future<Map<String, dynamic>> completeDelivery(String orderId) => _invoke('complete-delivery', {'order_id': orderId});

  Future<Map<String, dynamic>> estimateEta(String orderId) => _invoke('estimate-eta', {'order_id': orderId});

  /// Not called anywhere in this customer-facing app — kept here so the
  /// interface is ready for the future Delivery Partner App to reuse
  /// verbatim, per the Phase 17 brief. See update-location's own doc
  /// comment for why nothing in Flutter invokes this today.
  Future<Map<String, dynamic>> updateLocation(String assignmentId, {required double lat, required double lng, bool? pickedUp}) =>
      _invoke('update-location', {'assignment_id': assignmentId, 'lat': lat, 'lng': lng, if (pickedUp != null) 'picked_up': pickedUp});
}
