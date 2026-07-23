import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/notification_preferences.dart';
import '../providers/profile_providers.dart';

class NotificationSettingsScreen extends ConsumerWidget {
  const NotificationSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final prefsAsync = ref.watch(notificationPreferencesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Notification Settings', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: prefsAsync.when(
        data: (prefs) => _buildBody(context, ref, prefs),
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (_, __) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off_rounded, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text("Couldn't load your preferences.", style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary)),
              const SizedBox(height: 12),
              TextButton(onPressed: () => ref.read(notificationPreferencesProvider.notifier).retry(), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, NotificationPreferences prefs) {
    final notifier = ref.read(notificationPreferencesProvider.notifier);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _switchTile(
          icon: Icons.local_shipping_outlined,
          title: 'Order Updates',
          subtitle: 'Status changes, delivery ETA, and OTP alerts',
          value: prefs.orderUpdates,
          onChanged: (v) => notifier.toggle('notify_order_updates', v),
        ),
        _switchTile(
          icon: Icons.campaign_outlined,
          title: 'Promotions',
          subtitle: 'Discounts and limited-time deals',
          value: prefs.promotions,
          onChanged: (v) => notifier.toggle('notify_promotions', v),
        ),
        _switchTile(
          icon: Icons.local_offer_outlined,
          title: 'Offers',
          subtitle: 'New coupons and seasonal offers',
          value: prefs.offers,
          onChanged: (v) => notifier.toggle('notify_offers', v),
        ),
        _switchTile(
          icon: Icons.notifications_active_outlined,
          title: 'Stock Alerts',
          subtitle: 'When a wishlisted item is back in stock',
          value: prefs.stockAlerts,
          onChanged: (v) => notifier.toggle('notify_stock_alerts', v),
        ),
      ],
    );
  }

  Widget _switchTile({required IconData icon, required String title, required String subtitle, required bool value, required ValueChanged<bool> onChanged}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: SwitchListTile(
        contentPadding: EdgeInsets.zero,
        secondary: Icon(icon, color: AppColors.primary),
        title: Text(title, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700)),
        subtitle: Text(subtitle, style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
        value: value,
        activeThumbColor: AppColors.primary,
        onChanged: onChanged,
      ),
    );
  }
}
