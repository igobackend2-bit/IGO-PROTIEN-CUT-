import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../domain/entities/app_notification.dart';
import '../providers/notification_providers.dart';
import '../utils/notification_deep_link.dart';

/// Pops a top-of-screen banner (like a native heads-up notification) for a
/// just-arrived notification, via [Overlay] so it floats above whatever
/// screen is currently on top of the Navigator stack — not a SnackBar,
/// which Flutter always anchors to the bottom. Tapping it marks the
/// notification read and deep-links exactly like tapping it in the
/// Notification Center would.
void showNotificationToast(BuildContext context, WidgetRef ref, AppNotification notification) {
  final overlay = Overlay.of(context, rootOverlay: true);
  late OverlayEntry entry;

  void dismiss() {
    if (entry.mounted) entry.remove();
  }

  entry = OverlayEntry(
    builder: (overlayContext) => _TopNotificationBanner(
      notification: notification,
      onDismiss: dismiss,
      onTap: () {
        dismiss();
        ref.read(notificationListProvider.notifier).markAsRead(notification);
        handleNotificationTap(context, ref, notification);
      },
    ),
  );

  overlay.insert(entry);
}

class _TopNotificationBanner extends StatefulWidget {
  final AppNotification notification;
  final VoidCallback onDismiss;
  final VoidCallback onTap;

  const _TopNotificationBanner({required this.notification, required this.onDismiss, required this.onTap});

  @override
  State<_TopNotificationBanner> createState() => _TopNotificationBannerState();
}

class _TopNotificationBannerState extends State<_TopNotificationBanner> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 280));
  late final Animation<Offset> _slide = Tween(begin: const Offset(0, -1), end: Offset.zero).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
  Timer? _autoDismissTimer;

  @override
  void initState() {
    super.initState();
    _controller.forward();
    _autoDismissTimer = Timer(const Duration(seconds: 4), _dismiss);
  }

  Future<void> _dismiss() async {
    _autoDismissTimer?.cancel();
    if (!mounted) return;
    await _controller.reverse();
    widget.onDismiss();
  }

  @override
  void dispose() {
    _autoDismissTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final notification = widget.notification;
    final topInset = MediaQuery.of(context).padding.top;

    return Positioned(
      top: topInset + 8,
      left: 12,
      right: 12,
      child: SlideTransition(
        position: _slide,
        child: Material(
          color: Colors.transparent,
          child: GestureDetector(
            onTap: () {
              _autoDismissTimer?.cancel();
              widget.onTap();
            },
            onVerticalDragEnd: (details) {
              if ((details.primaryVelocity ?? 0) < 0) _dismiss();
            },
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 16, offset: Offset(0, 6))],
              ),
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(color: notification.type.color.withOpacity(0.12), borderRadius: BorderRadius.circular(12)),
                    child: Icon(notification.type.icon, color: notification.type.color, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(notification.title, style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800, color: const Color(0xFF1A120B))),
                        const SizedBox(height: 3),
                        Text(
                          notification.message,
                          style: GoogleFonts.outfit(fontSize: 12, color: const Color(0xFF4A3728), height: 1.3),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: _dismiss,
                    child: const Padding(
                      padding: EdgeInsets.only(left: 4),
                      child: Icon(Icons.close_rounded, size: 16, color: Color(0xFF9E8E82)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
