class SupportTicket {
  final String id;
  final String? userId;
  final String? customerName;
  final String? subject;
  final String? category;
  final String status;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const SupportTicket({
    required this.id,
    this.userId,
    this.customerName,
    this.subject,
    this.category,
    required this.status,
    this.createdAt,
    this.updatedAt,
  });

  factory SupportTicket.fromJson(Map<String, dynamic> json) {
    final profile = json['profiles'];
    return SupportTicket(
      id: json['id'].toString(),
      userId: json['user_id']?.toString(),
      customerName: profile is Map ? profile['full_name']?.toString() : null,
      subject: json['subject']?.toString(),
      category: json['category']?.toString(),
      status: json['status']?.toString() ?? 'Open',
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      updatedAt: DateTime.tryParse(json['updated_at']?.toString() ?? ''),
    );
  }
}

class TicketMessage {
  final String id;
  final String ticketId;
  final String sender;
  final String message;
  final String? attachment;
  final DateTime? createdAt;

  const TicketMessage({
    required this.id,
    required this.ticketId,
    required this.sender,
    required this.message,
    this.attachment,
    this.createdAt,
  });

  factory TicketMessage.fromJson(Map<String, dynamic> json) => TicketMessage(
        id: json['id'].toString(),
        ticketId: json['ticket_id']?.toString() ?? '',
        sender: json['sender']?.toString() ?? 'agent',
        message: json['message']?.toString() ?? '',
        attachment: json['attachment']?.toString(),
        createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      );
}

class Faq {
  final String id;
  final String category;
  final String question;
  final String answer;
  final int priority;

  const Faq({
    required this.id,
    required this.category,
    required this.question,
    required this.answer,
    required this.priority,
  });

  factory Faq.fromJson(Map<String, dynamic> json) => Faq(
        id: json['id'].toString(),
        category: json['category']?.toString() ?? '',
        question: json['question']?.toString() ?? '',
        answer: json['answer']?.toString() ?? '',
        priority: (json['priority'] as num?)?.toInt() ?? 0,
      );
}

class TicketStatus {
  TicketStatus._();

  static const open = 'Open';
  static const inProgress = 'In Progress';
  static const waiting = 'Waiting';
  static const resolved = 'Resolved';
  static const closed = 'Closed';

  static const all = <String>[open, inProgress, waiting, resolved, closed];
}
