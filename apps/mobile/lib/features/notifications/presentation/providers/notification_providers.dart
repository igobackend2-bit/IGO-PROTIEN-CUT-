import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../models/notification_type.dart';
import '../../../profile/domain/entities/notification_preferences.dart';
import '../../../profile/presentation/providers/profile_providers.dart';
import '../../data/repositories/notification_repository_impl.dart';
import '../../domain/entities/app_notification.dart';
import '../../domain/repositories/notification_repository.dart';

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) => NotificationRepositoryImpl());

/// Deliberately NOT autoDispose — the unread badge needs to stay live in
/// Home's AppBar and Profile regardless of whether the Notification Center
/// screen is open, so this provider (and its Realtime subscription) is
/// created once on first watch and kept alive for the whole session.
final notificationListProvider = StateNotifierProvider<NotificationListNotifier, NotificationListState>((ref) {
  return NotificationListNotifier(ref.read(notificationRepositoryProvider), ref);
});

/// Order status/stock-restock notifications are also gated server-side
/// (see the triggers in phase11_notifications.sql), but this is the single
/// place that applies preferences to *display* — covering every type,
/// including ones with no server-side generator yet, and any rows a future
/// admin/edge-function source inserts directly.
bool _isVisible(NotificationType type, NotificationPreferences prefs) {
  return switch (type) {
    NotificationType.orderUpdate || NotificationType.deliveryUpdate || NotificationType.subscription => prefs.orderUpdates,
    NotificationType.wishlistStockAlert => prefs.stockAlerts,
    NotificationType.coupon || NotificationType.offer => prefs.offers,
    NotificationType.flashSale => prefs.promotions,
    NotificationType.referralReward || NotificationType.generalAnnouncement || NotificationType.support => true,
  };
}

class NotificationListState {
  final List<AppNotification> notifications;
  final bool isLoading;
  final Object? error;

  /// Set only by [NotificationListNotifier.load] when a realtime refresh
  /// turns up a notification id it hasn't seen before — the app-root toast
  /// listener watches this to pop up a banner the instant something new
  /// arrives, regardless of which screen is open. Never set on the very
  /// first load (that would toast every pre-existing notification at once).
  final AppNotification? latestIncoming;

  const NotificationListState({this.notifications = const [], this.isLoading = true, this.error, this.latestIncoming});

  int get unreadCount => notifications.where((n) => !n.isRead).length;
  List<AppNotification> get unreadOnly => notifications.where((n) => !n.isRead).toList();

  NotificationListState copyWith({List<AppNotification>? notifications, bool? isLoading, Object? error, bool clearError = false}) {
    return NotificationListState(
      notifications: notifications ?? this.notifications,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
      latestIncoming: latestIncoming,
    );
  }
}

class NotificationListNotifier extends StateNotifier<NotificationListState> {
  final NotificationRepository _repository;
  final Ref _ref;
  StreamSubscription<void>? _realtimeSub;
  Set<String> _knownIds = {};
  bool _hasLoadedOnce = false;

  NotificationListNotifier(this._repository, this._ref) : super(const NotificationListState()) {
    load();
    // Realtime auto-update: any insert/update/delete on this user's
    // notifications re-fetches the full list, so the Notification Center
    // and unread badge update instantly without a manual refresh.
    _realtimeSub = _repository.watchNotifications().listen((_) => load());
  }

  @override
  void dispose() {
    _realtimeSub?.cancel();
    super.dispose();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final all = await _repository.fetchNotifications();
      final prefs = _ref.read(notificationPreferencesProvider).value;
      final visible = prefs == null ? all : all.where((n) => _isVisible(n.type, prefs)).toList();

      AppNotification? incoming;
      if (_hasLoadedOnce) {
        for (final n in visible) {
          if (!_knownIds.contains(n.id)) {
            incoming = n; // list is newest-first, so the first unseen id is the newest arrival
            break;
          }
        }
      }
      _knownIds = visible.map((n) => n.id).toSet();
      _hasLoadedOnce = true;

      state = NotificationListState(notifications: visible, isLoading: false, latestIncoming: incoming);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e);
    }
  }

  Future<void> refresh() => load();
  Future<void> retry() => load();

  Future<void> markAsRead(AppNotification notification) async {
    if (notification.isRead) return;
    final previous = state.notifications;
    state = state.copyWith(
      notifications: previous.map((n) => n.id == notification.id ? n.copyWith(isRead: true) : n).toList(),
    );
    try {
      await _repository.markAsRead(notification.id);
    } catch (_) {
      state = state.copyWith(notifications: previous); // rollback
    }
  }

  Future<void> markAllAsRead() async {
    final previous = state.notifications;
    if (previous.every((n) => n.isRead)) return;
    state = state.copyWith(notifications: previous.map((n) => n.copyWith(isRead: true)).toList());
    try {
      await _repository.markAllAsRead();
    } catch (_) {
      state = state.copyWith(notifications: previous); // rollback
    }
  }

  Future<void> deleteNotification(AppNotification notification) async {
    final previous = state.notifications;
    state = state.copyWith(notifications: previous.where((n) => n.id != notification.id).toList());
    try {
      await _repository.deleteNotification(notification.id);
    } catch (_) {
      state = state.copyWith(notifications: previous); // rollback
    }
  }
}
