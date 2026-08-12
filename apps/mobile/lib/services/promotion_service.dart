import 'package:supabase_flutter/supabase_flutter.dart';

/// Shared promotions service, following the same plain-Supabase-wrapper
/// pattern as OrderService/SubscriptionService/LoyaltyService. Reads the
/// Phase 15 `offers` / `combo_packs` / `combo_pack_items` tables only —
/// coupon validation itself stays in CouponRepository, this service never
/// duplicates that pricing logic.
class PromotionService {
  final SupabaseClient _client = Supabase.instance.client;

  static const _offersSelect = '*, products(*)';
  static const _comboSelect = '*, combo_pack_items(*, products(*))';

  /// Every currently-active, currently-in-window offer, highest priority
  /// first. Returns an empty list (not an error) if the `offers` table
  /// doesn't exist yet — callers fall back to whatever static content they
  /// already show.
  Future<List<Map<String, dynamic>>> fetchActiveOffers() async {
    try {
      final nowIso = DateTime.now().toIso8601String();
      final response = await _client
          .from('offers')
          .select(_offersSelect)
          .eq('active', true)
          .lte('start_date', nowIso)
          .gte('end_date', nowIso)
          .order('priority', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> fetchOffersByType(String type) async {
    final offers = await fetchActiveOffers();
    return offers.where((o) => o['type'] == type).toList();
  }

  Future<List<Map<String, dynamic>>> fetchActiveComboPacks() async {
    try {
      final response = await _client.from('combo_packs').select(_comboSelect).eq('active', true).order('created_at', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  Future<Map<String, dynamic>?> fetchComboPackById(String id) async {
    try {
      return await _client.from('combo_packs').select(_comboSelect).eq('id', id).maybeSingle();
    } catch (_) {
      return null;
    }
  }
}
