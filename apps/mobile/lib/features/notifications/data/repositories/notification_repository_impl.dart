import '../../../../services/notification_service.dart';
import '../../domain/entities/app_notification.dart';
import '../../domain/repositories/notification_repository.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  final NotificationService _service;
  NotificationRepositoryImpl({NotificationService? service}) : _service = service ?? NotificationService();

  @override
  Future<List<AppNotification>> fetchNotifications() async {
    final raw = await _service.fetchNotifications();
    return raw.map(AppNotification.fromMap).toList();
  }

  @override
  Stream<void> watchNotifications() {
    return _service.watchNotifications().map((_) {});
  }

  @override
  Future<void> markAsRead(String id) => _service.markAsRead(id);

  @override
  Future<void> markAllAsRead() => _service.markAllAsRead();

  @override
  Future<void> deleteNotification(String id) => _service.deleteNotification(id);
}
