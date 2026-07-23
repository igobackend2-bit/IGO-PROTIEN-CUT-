import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/app_notification.dart';
import '../providers/notification_providers.dart';
import '../utils/notification_deep_link.dart';
import '../widgets/notification_card.dart';
import '../widgets/notification_empty_state.dart';
import '../widgets/notification_error_state.dart';
import '../widgets/notification_skeleton.dart';

class NotificationCenterScreen extends ConsumerStatefulWidget {
  const NotificationCenterScreen({super.key});

  @override
  ConsumerState<NotificationCenterScreen> createState() => _NotificationCenterScreenState();
}

class _NotificationCenterScreenState extends ConsumerState<NotificationCenterScreen> {
  bool _unreadOnly = false;

  Future<void> _handleTap(AppNotification notification) async {
    ref.read(notificationListProvider.notifier).markAsRead(notification);
    await handleNotificationTap(context, ref, notification);
  }

  Future<void> _handleDelete(AppNotification notification) async {
    await ref.read(notificationListProvider.notifier).deleteNotification(notification);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationListProvider);
    final notifier = ref.read(notificationListProvider.notifier);
    final displayed = _unreadOnly ? state.unreadOnly : state.notifications;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Notifications', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          if (state.unreadCount > 0)
            TextButton(
              onPressed: () => notifier.markAllAsRead(),
              child: Text('Mark all read', style: GoogleFonts.outfit(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w700)),
            ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(52),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: [
                _filterChip('All', !_unreadOnly, () => setState(() => _unreadOnly = false)),
                const SizedBox(width: 10),
                _filterChip('Unread${state.unreadCount > 0 ? ' (${state.unreadCount})' : ''}', _unreadOnly, () => setState(() => _unreadOnly = true)),
              ],
            ),
          ),
        ),
      ),
      body: _buildBody(state, displayed, notifier),
    );
  }

  Widget _filterChip(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: isSelected ? Border.all(color: AppColors.primary, width: 1.5) : null,
        ),
        child: Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 12.5,
            fontWeight: FontWeight.w700,
            color: isSelected ? AppColors.primary : Colors.black,
          ),
        ),
      ),
    );
  }

  Widget _buildBody(NotificationListState state, List<AppNotification> displayed, NotificationListNotifier notifier) {
    if (state.isLoading) return const NotificationSkeleton();
    if (state.error != null) return NotificationErrorState(onRetry: notifier.retry);

    if (displayed.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: notifier.refresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [NotificationEmptyState(isUnreadFilter: _unreadOnly)],
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: notifier.refresh,
      child: ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: displayed.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, index) {
          final notification = displayed[index];
          return Dismissible(
            key: ValueKey(notification.id),
            direction: DismissDirection.endToStart,
            background: Container(
              alignment: Alignment.centerRight,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(color: AppColors.error, borderRadius: BorderRadius.circular(16)),
              child: const Icon(Icons.delete_outline_rounded, color: Colors.white),
            ),
            onDismissed: (_) => _handleDelete(notification),
            child: NotificationCard(notification: notification, onTap: () => _handleTap(notification)),
          );
        },
      ),
    );
  }
}
