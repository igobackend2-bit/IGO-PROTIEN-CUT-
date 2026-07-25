import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/core_providers.dart';
import '../data/notifications_repository_impl.dart';
import '../domain/notification_entry.dart';
import '../domain/notifications_repository.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>((ref) {
  return NotificationsRepositoryImpl(ref.watch(edgeFunctionClientProvider));
});

class NotificationsHistoryController extends AsyncNotifier<List<NotificationEntry>> {
  @override
  Future<List<NotificationEntry>> build() => ref.watch(notificationsRepositoryProvider).history();

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }
}

final notificationsHistoryControllerProvider =
    AsyncNotifierProvider<NotificationsHistoryController, List<NotificationEntry>>(
  NotificationsHistoryController.new,
);
