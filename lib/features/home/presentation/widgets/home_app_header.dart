import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../providers/home_providers.dart';

/// Top-of-hero row: personalized greeting + tappable delivery location.
class HomeAppHeader extends ConsumerWidget {
  const HomeAppHeader({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final name = ref.watch(greetingNameProvider);
    final location = ref.watch(selectedDeliveryLocationProvider);
    final greeting = _greetingForTime();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '$greeting, $name 👋',
                style: GoogleFonts.outfit(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Colors.white.withOpacity(0.9),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              InkWell(
                borderRadius: BorderRadius.circular(8),
                onTap: () => _openLocationSheet(context, ref),
                child: Row(
                  children: [
                    const Icon(Icons.location_on_rounded, color: Colors.white, size: 18),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        location,
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.white, size: 18),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        _NotificationBell(onTap: () => _showComingSoon(context, 'Notifications')),
      ],
    );
  }

  String _greetingForTime() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  void _showComingSoon(BuildContext context, String feature) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$feature coming soon!', style: GoogleFonts.outfit()),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  void _openLocationSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetContext) {
        final options = const [
          ('Kanathur, Chennai', 'Home • Uthandi, Kanathur, Chennai'),
          ('Anna Nagar, Chennai', 'Work • 2nd Ave, Anna Nagar, Chennai'),
        ];
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Select Delivery Location',
                  style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 16),
                ...options.map(
                  (o) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.location_on_rounded, color: Color(0xFF1D8348)),
                    title: Text(o.$1, style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 14)),
                    subtitle: Text(o.$2, style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey)),
                    onTap: () {
                      ref.read(selectedDeliveryLocationProvider.notifier).state = o.$1;
                      Navigator.pop(sheetContext);
                    },
                  ),
                ),
                const Divider(),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.add_location_alt_outlined, color: Colors.grey),
                  title: Text('Add New Address', style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 14, color: Colors.grey)),
                  onTap: () {
                    Navigator.pop(sheetContext);
                    _showComingSoon(context, 'Address management');
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _NotificationBell extends StatelessWidget {
  final VoidCallback onTap;
  const _NotificationBell({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.15),
          shape: BoxShape.circle,
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            const Icon(Icons.notifications_none_rounded, color: Colors.white, size: 22),
            Positioned(
              top: 10,
              right: 11,
              child: Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Color(0xFFE67E22),
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
