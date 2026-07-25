import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../address/presentation/providers/address_providers.dart';
import '../../../address/presentation/screens/address_form_screen.dart';
import '../../../notifications/presentation/providers/notification_providers.dart';
import '../../../notifications/presentation/screens/notification_center_screen.dart';
import '../../../notifications/presentation/widgets/notification_badge.dart';
import '../../../wishlist/presentation/screens/wishlist_screen.dart';
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
        _HeaderIconButton(
          icon: Icons.favorite_border_rounded,
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WishlistScreen())),
        ),
        const SizedBox(width: 10),
        const _NotificationBell(),
      ],
    );
  }

  String _greetingForTime() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  void _openLocationSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetContext) {
        return Consumer(
          builder: (context, sheetRef, _) {
            final addressState = sheetRef.watch(addressListProvider);
            final savedAddresses = addressState.addresses;

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
                    if (savedAddresses.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Text(
                          'No saved addresses yet.',
                          style: GoogleFonts.outfit(fontSize: 13, color: Colors.grey),
                        ),
                      )
                    else
                      ...savedAddresses.map(
                        (address) => ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: Icon(
                            address.isDefault ? Icons.location_on_rounded : Icons.location_on_outlined,
                            color: const Color(0xFF1D8348),
                          ),
                          title: Text(
                            '${address.area}, ${address.city}',
                            style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 14),
                          ),
                          subtitle: Text(
                            '${address.addressType.label} • ${address.formattedOneLine}',
                            style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          onTap: () {
                            ref.read(selectedDeliveryLocationProvider.notifier).state = '${address.area}, ${address.city}';
                            Navigator.pop(sheetContext);
                          },
                        ),
                      ),
                    const Divider(),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.add_location_alt_outlined, color: Color(0xFF1D8348)),
                      title: Text('Add New Address', style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 14, color: const Color(0xFF1D8348))),
                      onTap: () {
                        Navigator.pop(sheetContext);
                        Navigator.push(context, MaterialPageRoute(builder: (_) => const AddressFormScreen()));
                      },
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _HeaderIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _HeaderIconButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), shape: BoxShape.circle),
        child: Icon(icon, color: Colors.white, size: 20),
      ),
    );
  }
}

class _NotificationBell extends ConsumerWidget {
  const _NotificationBell();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadCount = ref.watch(notificationListProvider.select((s) => s.unreadCount));

    return GestureDetector(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationCenterScreen())),
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
            Positioned(top: 6, right: 6, child: NotificationBadge(count: unreadCount)),
          ],
        ),
      ),
    );
  }
}
