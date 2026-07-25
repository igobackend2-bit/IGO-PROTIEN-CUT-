import '../../../../models/notification_type.dart';

class AppNotification {
  final String id;
  final NotificationType type;
  final String title;
  final String message;
  final Map<String, dynamic> data;
  final bool isRead;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.data,
    required this.isRead,
    required this.createdAt,
  });

  factory AppNotification.fromMap(Map<String, dynamic> map) {
    final rawData = map['data'];
    return AppNotification(
      id: (map['id'] ?? '').toString(),
      type: NotificationType.fromString(map['type'] as String?),
      title: (map['title'] ?? '').toString(),
      message: (map['message'] ?? '').toString(),
      data: rawData is Map ? Map<String, dynamic>.from(rawData) : const {},
      isRead: map['is_read'] as bool? ?? false,
      createdAt: DateTime.tryParse(map['created_at']?.toString() ?? '')?.toLocal() ?? DateTime.now(),
    );
  }

  AppNotification copyWith({bool? isRead}) {
    return AppNotification(
      id: id,
      type: type,
      title: title,
      message: message,
      data: data,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt,
    );
  }
}
