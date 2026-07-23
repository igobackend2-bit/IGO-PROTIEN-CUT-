import 'ticket_category.dart';
import 'ticket_status.dart';

class SupportTicket {
  final String id;
  final String userId;
  final String? orderId;
  final TicketCategory category;
  final String subject;
  final String description;
  final TicketStatus status;
  final String? attachmentUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  const SupportTicket({
    required this.id,
    required this.userId,
    required this.category,
    required this.subject,
    required this.description,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.orderId,
    this.attachmentUrl,
  });

  bool get isReturn => category == TicketCategory.returnRequest;
  bool get canReply => !status.isClosed;
  bool get canClose => !status.isClosed;

  factory SupportTicket.fromMap(Map<String, dynamic> map) {
    return SupportTicket(
      id: (map['id'] ?? '').toString(),
      userId: (map['user_id'] ?? '').toString(),
      orderId: map['order_id'] as String?,
      category: TicketCategory.fromString(map['category'] as String?),
      subject: (map['subject'] ?? '').toString(),
      description: (map['description'] ?? '').toString(),
      status: TicketStatus.fromString(map['status'] as String?),
      attachmentUrl: map['attachment_url'] as String?,
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
      updatedAt: DateTime.tryParse(map['updated_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
    );
  }
}
