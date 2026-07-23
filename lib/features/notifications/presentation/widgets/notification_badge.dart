import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Small count bubble, positioned by the caller — reused on the Home
/// AppBar bell and the Profile "Notifications" entry so both read the same
/// unread count without each building their own badge UI.
class NotificationBadge extends StatelessWidget {
  final int count;
  const NotificationBadge({super.key, required this.count});

  @override
  Widget build(BuildContext context) {
    if (count <= 0) return const SizedBox.shrink();
    final label = count > 99 ? '99+' : '$count';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
      constraints: const BoxConstraints(minWidth: 16),
      decoration: const BoxDecoration(color: Color(0xFFE74C3C), shape: BoxShape.circle),
      child: Text(
        label,
        textAlign: TextAlign.center,
        style: GoogleFonts.outfit(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.w800),
      ),
    );
  }
}
