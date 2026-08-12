import 'package:supabase_flutter/supabase_flutter.dart';

/// Shared loyalty service, following the same plain-Supabase-wrapper
/// pattern as OrderService/PaymentService/WishlistService. Reward points,
/// cashback and achievement unlocks are all written server-side (see
/// migrations/phase13_loyalty.sql triggers) — this service only reads them
/// for the client, plus the one write it's genuinely responsible for
/// (resolving a referral code at signup).
class LoyaltyService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<Map<String, dynamic>>> fetchRewardTransactions() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];
    try {
      final response = await _client
          .from('reward_transactions')
          .select()
          .eq('user_id', user.id)
          .order('created_at', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> fetchWalletTransactions() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];
    try {
      final response = await _client
          .from('wallet_transactions')
          .select()
          .eq('user_id', user.id)
          .order('created_at', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  /// Full achievement catalog, each row optionally carrying this user's
  /// unlock — a single query rather than fetching the catalog and unlocked
  /// set separately and joining client-side.
  Future<List<Map<String, dynamic>>> fetchAchievements() async {
    final user = _client.auth.currentUser;
    try {
      final response = await _client
          .from('achievements')
          .select('*, user_achievements(unlocked_at, user_id)')
          .order('title');
      final rows = List<Map<String, dynamic>>.from(response as List);
      for (final row in rows) {
        final unlocks = row['user_achievements'];
        Map<String, dynamic>? mine;
        if (unlocks is List) {
          mine = unlocks.cast<Map<String, dynamic>>().where((u) => u['user_id'] == user?.id).firstOrNullMap();
        }
        row['unlocked_at'] = mine?['unlocked_at'];
      }
      return rows;
    } catch (_) {
      return [];
    }
  }

  Future<String?> resolveReferralCode(String code) async {
    final trimmed = code.trim();
    if (trimmed.isEmpty) return null;
    try {
      final response = await _client.rpc('resolve_referral_code', params: {'code': trimmed});
      return response as String?;
    } catch (_) {
      return null;
    }
  }
}

extension _FirstOrNullMap on Iterable<Map<String, dynamic>> {
  Map<String, dynamic>? firstOrNullMap() => isEmpty ? null : first;
}
