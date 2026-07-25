import 'notification_entry.dart';

abstract class NotificationsRepository {
  Future<int> broadcast({required String title, required String message});

  Future<void> targetUser({required String userId, required String title, required String message});

  Future<int> targetCategory({required String category, required String title, required String message});

  Future<List<NotificationEntry>> history({int limit = 50});
}
