import 'dart:typed_data';

import '../../../../services/support_service.dart';
import '../../domain/entities/faq_item.dart';
import '../../domain/entities/support_ticket.dart';
import '../../domain/entities/ticket_category.dart';
import '../../domain/entities/ticket_message.dart';
import '../../domain/repositories/support_repository.dart';

class SupportRepositoryImpl implements SupportRepository {
  final SupportService _service;
  SupportRepositoryImpl({SupportService? service}) : _service = service ?? SupportService();

  @override
  Future<List<SupportTicket>> fetchTickets() async {
    final raw = await _service.fetchTickets();
    return raw.map(SupportTicket.fromMap).toList();
  }

  @override
  Future<SupportTicket?> fetchTicketById(String id) async {
    final raw = await _service.fetchTicketById(id);
    return raw == null ? null : SupportTicket.fromMap(raw);
  }

  @override
  Stream<SupportTicket?> watchTicket(String id) {
    return _service.watchTicket(id).map((raw) => raw == null ? null : SupportTicket.fromMap(raw));
  }

  @override
  Future<SupportTicket> createTicket({
    required TicketCategory category,
    required String subject,
    required String description,
    String? orderId,
    String? attachmentUrl,
  }) async {
    final raw = await _service.createTicket(
      category: category.value,
      subject: subject,
      description: description,
      orderId: orderId,
      attachmentUrl: attachmentUrl,
    );
    return SupportTicket.fromMap(raw);
  }

  @override
  Future<void> closeTicket(String ticketId) => _service.closeTicket(ticketId);

  @override
  Future<List<TicketMessage>> fetchMessages(String ticketId) async {
    final raw = await _service.fetchMessages(ticketId);
    return raw.map(TicketMessage.fromMap).toList();
  }

  @override
  Stream<List<TicketMessage>> watchMessages(String ticketId) {
    return _service.watchMessages(ticketId).map((rows) => rows.map(TicketMessage.fromMap).toList());
  }

  @override
  Future<void> sendMessage(String ticketId, String message, {String? attachment}) {
    return _service.sendMessage(ticketId, message, attachment: attachment);
  }

  @override
  Future<void> markMessagesRead(String ticketId) => _service.markMessagesRead(ticketId);

  @override
  Future<List<FaqItem>> fetchFaqs() async {
    final raw = await _service.fetchFaqs();
    return raw.map(FaqItem.fromMap).toList();
  }

  @override
  Future<void> submitFaqFeedback(String faqId, {required bool helpful}) {
    return _service.submitFaqFeedback(faqId, helpful: helpful);
  }

  @override
  Future<String> uploadAttachment(Uint8List bytes, {required String fileName}) {
    return _service.uploadAttachment(bytes, fileName: fileName);
  }
}
