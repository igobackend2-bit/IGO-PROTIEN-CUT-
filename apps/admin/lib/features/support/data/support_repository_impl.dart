import '../../../core/network/edge_function_client.dart';
import '../domain/support_repository.dart';
import '../domain/support_ticket.dart';

class SupportRepositoryImpl implements SupportRepository {
  final EdgeFunctionClient _client;

  SupportRepositoryImpl(this._client);

  @override
  Future<TicketListResult> listTickets({String? status, String? category, int limit = 50, int offset = 0}) async {
    final response = await _client.invoke('admin-support', 'listTickets', {
      if (status != null && status.isNotEmpty) 'status': status,
      if (category != null && category.isNotEmpty) 'category': category,
      'limit': limit,
      'offset': offset,
    });
    final tickets = ((response['tickets'] as List?) ?? const [])
        .map((e) => SupportTicket.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    return TicketListResult(tickets: tickets, total: (response['total'] as num?)?.toInt() ?? tickets.length);
  }

  @override
  Future<TicketDetail> getTicket(String ticketId) async {
    final response = await _client.invoke('admin-support', 'getTicket', {'ticketId': ticketId});
    final ticket = SupportTicket.fromJson(Map<String, dynamic>.from(response['ticket'] as Map));
    final messages = ((response['messages'] as List?) ?? const [])
        .map((e) => TicketMessage.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    return TicketDetail(ticket: ticket, messages: messages);
  }

  @override
  Future<TicketMessage> reply({required String ticketId, required String message, String? attachment}) async {
    final response = await _client.invoke('admin-support', 'reply', {
      'ticketId': ticketId,
      'message': message,
      if (attachment != null && attachment.isNotEmpty) 'attachment': attachment,
    });
    return TicketMessage.fromJson(Map<String, dynamic>.from(response['message'] as Map));
  }

  @override
  Future<SupportTicket> setStatus(String ticketId, String status) async {
    final response = await _client.invoke('admin-support', 'setStatus', {'ticketId': ticketId, 'status': status});
    return SupportTicket.fromJson(Map<String, dynamic>.from(response['ticket'] as Map));
  }

  @override
  Future<List<Faq>> listFaqs() async {
    final response = await _client.invoke('admin-support', 'listFaqs');
    return ((response['faqs'] as List?) ?? const [])
        .map((e) => Faq.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  @override
  Future<Faq> createFaq({
    required String category,
    required String question,
    required String answer,
    int? priority,
  }) async {
    final response = await _client.invoke('admin-support', 'createFaq', {
      'category': category,
      'question': question,
      'answer': answer,
      if (priority != null) 'priority': priority,
    });
    return Faq.fromJson(Map<String, dynamic>.from(response['faq'] as Map));
  }

  @override
  Future<Faq> updateFaq(String id, {String? category, String? question, String? answer, int? priority}) async {
    final response = await _client.invoke('admin-support', 'updateFaq', {
      'id': id,
      if (category != null) 'category': category,
      if (question != null) 'question': question,
      if (answer != null) 'answer': answer,
      if (priority != null) 'priority': priority,
    });
    return Faq.fromJson(Map<String, dynamic>.from(response['faq'] as Map));
  }

  @override
  Future<void> deleteFaq(String id) => _client.invoke('admin-support', 'deleteFaq', {'id': id});
}
