import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';

/// Thin, typed client for the Phase 18 admin-* Edge Functions. Not called
/// from anywhere in this customer-facing app today — there is no Admin UI
/// yet (that's Phase 19). This exists so Phase 19 can build the Admin
/// Dashboard by consuming these Edge Functions directly, with the same
/// plain-Supabase-wrapper shape every other service in this app already
/// follows, rather than reinventing the calling convention.
///
/// All ten functions share one request shape (`{ action, ...params }`) and
/// one response shape (JSON object, or `{ error }` on failure), so a single
/// generic invoke method backs every call rather than duplicating the
/// request/error-handling boilerplate ten times.
class AdminService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<Map<String, dynamic>> _invoke(String function, String action, Map<String, dynamic> params) async {
    try {
      final response = await _client.functions.invoke(function, body: {'action': action, ...params});
      final data = response.data;
      return data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
    } on FunctionException catch (e) {
      final details = e.details;
      final message = (details is Map && details['error'] != null) ? details['error'].toString() : 'Something went wrong. Please try again.';
      throw Exception(message);
    }
  }

  // ─── Products, categories, review moderation ────────────────────────────
  Future<Map<String, dynamic>> products(String action, [Map<String, dynamic> params = const {}]) =>
      _invoke('admin-products', action, params);

  /// Uploads a product photo straight to Storage (same direct-client-upload
  /// pattern as avatars/review photos/support attachments — no Edge
  /// Function round-trip for the binary itself) and returns its public URL.
  /// The `product-images` bucket's write policy checks `products.manage`
  /// via `admin_has_permission`, so this only succeeds for an admin.
  /// Callers still need to call `products('update', {...})` with the
  /// returned URL to actually attach it to a product row.
  Future<String> uploadProductImage(String productId, Uint8List bytes, {required String fileExt}) async {
    final path = 'products/$productId/${DateTime.now().millisecondsSinceEpoch}.$fileExt';
    await _client.storage.from('product-images').uploadBinary(path, bytes, fileOptions: const FileOptions(upsert: true));
    return _client.storage.from('product-images').getPublicUrl(path);
  }

  // ─── Stock in/out/adjustment, low/out-of-stock, history ─────────────────
  Future<Map<String, dynamic>> inventory(String action, [Map<String, dynamic> params = const {}]) =>
      _invoke('admin-inventory', action, params);

  // ─── Order lifecycle (accept/reject/pack/ready/cancel), refunds ─────────
  Future<Map<String, dynamic>> orders(String action, [Map<String, dynamic> params = const {}]) =>
      _invoke('admin-orders', action, params);

  // ─── Delivery fleet visibility, reassignment, ETA refresh ────────────────
  Future<Map<String, dynamic>> delivery(String action, [Map<String, dynamic> params = const {}]) =>
      _invoke('admin-delivery', action, params);

  // ─── Customer directory + RBAC role management ───────────────────────────
  Future<Map<String, dynamic>> users(String action, [Map<String, dynamic> params = const {}]) =>
      _invoke('admin-users', action, params);

  // ─── Coupons, offers, combo packs ─────────────────────────────────────────
  Future<Map<String, dynamic>> coupons(String action, [Map<String, dynamic> params = const {}]) =>
      _invoke('admin-coupons', action, params);

  // ─── Broadcast / targeted notification sending ───────────────────────────
  Future<Map<String, dynamic>> notifications(String action, [Map<String, dynamic> params = const {}]) =>
      _invoke('admin-notifications', action, params);

  // ─── Support ticket management, agent replies, FAQ content ──────────────
  Future<Map<String, dynamic>> support(String action, [Map<String, dynamic> params = const {}]) =>
      _invoke('admin-support', action, params);

  // ─── Sales/revenue/customer/product/category/refund/subscription metrics ─
  Future<Map<String, dynamic>> analytics(String action, [Map<String, dynamic> params = const {}]) =>
      _invoke('admin-analytics', action, params);

  // ─── Sales/inventory/orders/delivery/payments/customer exports ──────────
  Future<Map<String, dynamic>> reports(String action, [Map<String, dynamic> params = const {}]) =>
      _invoke('admin-reports', action, params);
}
