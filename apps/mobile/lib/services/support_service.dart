import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';

/// Shared support service, following the same plain-Supabase-wrapper
/// pattern as OrderService/PromotionService/SubscriptionService. Talks to
/// `support_tickets`, `ticket_messages`, `faq_items` and the
/// `support-attachments` Storage bucket. Realtime uses the same
/// `.stream()` technique as OrderService.watchOrder /
/// NotificationService.watchNotifications — no separate channel wiring.
class SupportService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<List<Map<String, dynamic>>> fetchTickets() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];
    try {
      final response = await _client
          .from('support_tickets')
          .select()
          .eq('user_id', user.id)
          .order('updated_at', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  Future<Map<String, dynamic>?> fetchTicketById(String id) async {
    final user = _client.auth.currentUser;
    if (user == null) return null;
    try {
      return await _client.from('support_tickets').select().eq('id', id).eq('user_id', user.id).maybeSingle();
    } catch (_) {
      return null;
    }
  }

  /// Realtime signals *that* the ticket row changed; the caller re-fetches
  /// the full row — same pattern as OrderService.watchOrder.
  Stream<Map<String, dynamic>?> watchTicket(String id) {
    return _client.from('support_tickets').stream(primaryKey: ['id']).eq('id', id).asyncMap((_) => fetchTicketById(id));
  }

  Future<Map<String, dynamic>> createTicket({
    required String category,
    required String subject,
    required String description,
    String? orderId,
    String? attachmentUrl,
  }) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to raise a ticket.');

    final row = await _client
        .from('support_tickets')
        .insert({
          'user_id': user.id,
          'category': category,
          'subject': subject,
          'description': description,
          if (orderId != null) 'order_id': orderId,
          if (attachmentUrl != null) 'attachment_url': attachmentUrl,
        })
        .select()
        .single();

    // The ticket's own description is the first message in its timeline —
    // one real, functional chat entry, not a fabricated system message.
    await _client.from('ticket_messages').insert({
      'ticket_id': row['id'],
      'sender': 'customer',
      'message': description,
      if (attachmentUrl != null) 'attachment': attachmentUrl,
      'is_read': true,
    });

    return row;
  }

  Future<void> closeTicket(String ticketId) async {
    final user = _client.auth.currentUser;
    if (user == null) return;
    await _client.from('support_tickets').update({'status': 'Closed'}).eq('id', ticketId).eq('user_id', user.id);
  }

  Future<List<Map<String, dynamic>>> fetchMessages(String ticketId) async {
    try {
      final response = await _client.from('ticket_messages').select().eq('ticket_id', ticketId).order('created_at');
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  Stream<List<Map<String, dynamic>>> watchMessages(String ticketId) {
    return _client.from('ticket_messages').stream(primaryKey: ['id']).eq('ticket_id', ticketId).order('created_at');
  }

  Future<void> sendMessage(String ticketId, String message, {String? attachment}) async {
    await _client.from('ticket_messages').insert({
      'ticket_id': ticketId,
      'sender': 'customer',
      'message': message,
      if (attachment != null) 'attachment': attachment,
      'is_read': true,
    });
    // Replying re-opens a waiting/in-progress conversation rather than
    // leaving a customer's reply stuck under a stale status.
    await _client.from('support_tickets').update({'status': 'Open'}).eq('id', ticketId).eq('status', 'Waiting');
  }

  Future<void> markMessagesRead(String ticketId) async {
    await _client.from('ticket_messages').update({'is_read': true}).eq('ticket_id', ticketId).eq('sender', 'agent').eq('is_read', false);
  }

  Future<List<Map<String, dynamic>>> fetchFaqs() async {
    try {
      final response = await _client.from('faq_items').select().order('category').order('priority', ascending: false);
      return List<Map<String, dynamic>>.from(response as List);
    } catch (_) {
      return [];
    }
  }

  Future<void> submitFaqFeedback(String faqId, {required bool helpful}) async {
    await _client.rpc('increment_faq_feedback', params: {'p_faq_id': faqId, 'p_helpful': helpful});
  }

  Future<String> uploadAttachment(Uint8List bytes, {required String fileName}) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to upload an attachment.');
    final path = '${user.id}/$fileName';
    await _client.storage.from('support-attachments').uploadBinary(path, bytes, fileOptions: const FileOptions(upsert: true));
    return _client.storage.from('support-attachments').getPublicUrl(path);
  }
}
