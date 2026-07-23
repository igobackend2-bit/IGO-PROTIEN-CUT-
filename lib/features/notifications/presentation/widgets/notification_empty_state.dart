import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';

class NotificationEmptyState extends StatelessWidget {
  final bool isUnreadFilter;
  const NotificationEmptyState({super.key, this.isUnreadFilter = false});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 60),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(28),
              decoration: const BoxDecoration(color: AppColors.surfaceLight, shape: BoxShape.circle),
              child: Icon(isUnreadFilter ? Icons.mark_email_read_outlined : Icons.notifications_none_rounded, size: 64, color: AppColors.primary),
            ),
            const SizedBox(height: 20),
            Text(
              isUnreadFilter ? "You're all caught up" : 'No notifications yet',
              style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            Text(
              isUnreadFilter ? 'No unread notifications right now.' : "We'll let you know when there's something new — orders, offers, and more.",
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
            ),
          ],
        ),
      ),
    );
  }
}
