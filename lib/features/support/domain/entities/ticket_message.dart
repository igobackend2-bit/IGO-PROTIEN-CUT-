enum MessageSender {
  customer,
  agent,
  system;

  static MessageSender fromString(String? value) => switch (value) {
        'agent' => MessageSender.agent,
        'system' => MessageSender.system,
        _ => MessageSender.customer,
      };
}

class TicketMessage {
  final String id;
  final String ticketId;
  final MessageSender sender;
  final String message;
  final String? attachment;
  final bool isRead;
  final DateTime createdAt;

  const TicketMessage({
    required this.id,
    required this.ticketId,
    required this.sender,
    required this.message,
    required this.isRead,
    required this.createdAt,
    this.attachment,
  });

  factory TicketMessage.fromMap(Map<String, dynamic> map) {
    return TicketMessage(
      id: (map['id'] ?? '').toString(),
      ticketId: (map['ticket_id'] ?? '').toString(),
      sender: MessageSender.fromString(map['sender'] as String?),
      message: (map['message'] ?? '').toString(),
      attachment: map['attachment'] as String?,
      isRead: (map['is_read'] as bool?) ?? false,
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
    );
  }
}
