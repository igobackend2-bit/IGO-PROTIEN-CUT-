import '../../../core/network/edge_function_client.dart';
import '../domain/notification_entry.dart';
import '../domain/notifications_repository.dart';

class NotificationsRepositoryImpl implements NotificationsRepository {
  final EdgeFunctionClient _client;

  NotificationsRepositoryImpl(this._client);

  @override
  Future<int> broadcast({required String title, required String message}) async {
    final response = await _client.invoke('admin-notifications', 'broadcast', {'title': title, 'message': message});
    return (response['sent'] as num?)?.toInt() ?? 0;
  }

  @override
  Future<void> targetUser({required String userId, required String title, required String message}) {
    return _client.invoke('admin-notifications', 'targetUser', {
      'userId': userId,
      'title': title,
      'message': message,
    });
  }

  @override
  Future<int> targetCategory({required String category, required String title, required String message}) async {
    final response = await _client.invoke('admin-notifications', 'targetCategory', {
      'category': category,
      'title': title,
      'message': message,
    });
    return (response['sent'] as num?)?.toInt() ?? 0;
  }

  @override
  Future<List<NotificationEntry>> history({int limit = 50}) async {
    final response = await _client.invoke('admin-notifications', 'history', {'limit': limit});
    return ((response['notifications'] as List?) ?? const [])
        .map((e) => NotificationEntry.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }
}
