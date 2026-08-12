import 'package:supabase_flutter/supabase_flutter.dart';

/// Shared notification service, following the same plain-Supabase-wrapper
/// pattern as OrderService/PaymentService/CartService. Notification rows
/// themselves are created server-side (see migrations/phase11_notifications
/// .sql triggers) — this service only reads/mutates them for the client.
class NotificationService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<Map<String, dynamic>>> fetchNotifications() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];
    try {
      final response = await _client
          .from('notifications')
          .select()
          .eq('user_id', user.id)
          .order('created_at', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  /// Fires on every insert/update/delete for this user's notifications —
  /// callers re-fetch the full list on each event rather than trying to
  /// patch individual rows, matching the watchOrder()-style pattern used
  /// elsewhere for realtime data that isn't a single flat table.
  Stream<List<Map<String, dynamic>>> watchNotifications() {
    final user = _client.auth.currentUser;
    if (user == null) return const Stream.empty();
    return _client
        .from('notifications')
        .stream(primaryKey: ['id'])
        .eq('user_id', user.id)
        .order('created_at', ascending: false);
  }

  Future<void> markAsRead(String id) async {
    await _client.from('notifications').update({'is_read': true}).eq('id', id);
  }

  Future<void> markAllAsRead() async {
    final user = _client.auth.currentUser;
    if (user == null) return;
    await _client.from('notifications').update({'is_read': true}).eq('user_id', user.id).eq('is_read', false);
  }

  Future<void> deleteNotification(String id) async {
    await _client.from('notifications').delete().eq('id', id);
  }
}
