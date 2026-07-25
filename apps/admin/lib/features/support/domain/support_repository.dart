import 'support_ticket.dart';

class TicketListResult {
  final List<SupportTicket> tickets;
  final int total;

  const TicketListResult({required this.tickets, required this.total});
}

class TicketDetail {
  final SupportTicket ticket;
  final List<TicketMessage> messages;

  const TicketDetail({required this.ticket, required this.messages});
}

abstract class SupportRepository {
  Future<TicketListResult> listTickets({String? status, String? category, int limit = 50, int offset = 0});

  Future<TicketDetail> getTicket(String ticketId);

  Future<TicketMessage> reply({required String ticketId, required String message, String? attachment});

  Future<SupportTicket> setStatus(String ticketId, String status);

  Future<List<Faq>> listFaqs();

  Future<Faq> createFaq({required String category, required String question, required String answer, int? priority});

  Future<Faq> updateFaq(String id, {String? category, String? question, String? answer, int? priority});

  Future<void> deleteFaq(String id);
}
