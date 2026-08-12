import 'dart:typed_data';

import '../entities/faq_item.dart';
import '../entities/support_ticket.dart';
import '../entities/ticket_category.dart';
import '../entities/ticket_message.dart';

abstract class SupportRepository {
  Future<List<SupportTicket>> fetchTickets();
  Future<SupportTicket?> fetchTicketById(String id);
  Stream<SupportTicket?> watchTicket(String id);

  Future<SupportTicket> createTicket({
    required TicketCategory category,
    required String subject,
    required String description,
    String? orderId,
    String? attachmentUrl,
  });

  Future<void> closeTicket(String ticketId);

  Future<List<TicketMessage>> fetchMessages(String ticketId);
  Stream<List<TicketMessage>> watchMessages(String ticketId);
  Future<void> sendMessage(String ticketId, String message, {String? attachment});
  Future<void> markMessagesRead(String ticketId);

  Future<List<FaqItem>> fetchFaqs();
  Future<void> submitFaqFeedback(String faqId, {required bool helpful});

  Future<String> uploadAttachment(Uint8List bytes, {required String fileName});
}
