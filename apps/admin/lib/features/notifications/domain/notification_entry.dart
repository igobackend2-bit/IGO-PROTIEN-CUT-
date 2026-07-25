class NotificationEntry {
  final String id;
  final String? userId;
  final String type;
  final String title;
  final String message;
  final DateTime? createdAt;

  const NotificationEntry({
    required this.id,
    this.userId,
    required this.type,
    required this.title,
    required this.message,
    this.createdAt,
  });

  factory NotificationEntry.fromJson(Map<String, dynamic> json) => NotificationEntry(
        id: json['id'].toString(),
        userId: json['user_id']?.toString(),
        type: json['type']?.toString() ?? 'general_announcement',
        title: json['title']?.toString() ?? '',
        message: json['message']?.toString() ?? '',
        createdAt: DateTime.tryParse(json['created_at']?.toString() ?? ''),
      );
}
