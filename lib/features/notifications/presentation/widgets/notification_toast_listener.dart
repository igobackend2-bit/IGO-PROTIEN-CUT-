import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/notification_providers.dart';
import 'notification_toast.dart';

/// Wraps HomeScreen (not the app root) so notificationListProvider — and
/// its Realtime subscription — is only ever created after the user is
/// logged in; creating it pre-login would capture a null `auth.currentUser`
/// and permanently return an empty stream. HomeScreen itself stays mounted
/// underneath every screen pushed from it (Cart, Checkout, Profile, ...),
/// so this keeps popping toasts no matter which of those is on top.
class NotificationToastListener extends ConsumerWidget {
  final Widget child;
  const NotificationToastListener({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen<NotificationListState>(notificationListProvider, (previous, next) {
      final incoming = next.latestIncoming;
      if (incoming == null) return;
      if (previous?.latestIncoming?.id == incoming.id) return;
      if (!context.mounted) return;
      showNotificationToast(context, ref, incoming);
    });
    return child;
  }
}
