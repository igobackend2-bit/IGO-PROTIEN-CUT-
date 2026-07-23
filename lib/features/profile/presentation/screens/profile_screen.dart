import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/user_model.dart';
import '../../../../services/auth_service.dart';
import '../../../../utils/app_colors.dart';
import '../../../notifications/presentation/providers/notification_providers.dart';
import '../../../notifications/presentation/screens/notification_center_screen.dart';
import '../../../notifications/presentation/widgets/notification_badge.dart';
import '../../../loyalty/presentation/screens/loyalty_dashboard_screen.dart';
import '../../../support/presentation/screens/support_center_screen.dart';
import '../../../subscriptions/presentation/screens/subscription_dashboard_screen.dart';
import '../../../payment/presentation/screens/payment_history_screen.dart';
import '../../../wishlist/presentation/screens/wishlist_screen.dart';
import '../providers/profile_providers.dart';
import 'change_password_screen.dart';
import 'coupons_screen.dart';
import '../../../promotions/presentation/screens/offers_screen.dart';
import 'edit_profile_screen.dart';
import 'language_screen.dart';
import 'notification_settings_screen.dart';
import 'payment_methods_screen.dart';
import 'privacy_screen.dart';
import 'referral_screen.dart';
import 'rewards_screen.dart';
import 'theme_screen.dart';
import 'wallet_screen.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  Future<void> _handleLogout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Logout?', style: GoogleFonts.outfit(color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
        content: Text('Are you sure you want to sign out?', style: GoogleFonts.outfit(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text('Cancel', style: GoogleFonts.outfit(color: AppColors.textSecondary))),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Logout', style: GoogleFonts.outfit(color: AppColors.primary, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      // Local preferences (theme/language) are deliberately left alone —
      // they're device settings, not account session state.
      await AuthService().logout();
      if (!context.mounted) return;
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(userProfileProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('My Profile', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: userAsync.when(
        data: (user) => _buildBody(context, ref, user),
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (_, __) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off_rounded, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text("Couldn't load your profile.", style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary)),
              const SizedBox(height: 12),
              TextButton(onPressed: () => ref.read(userProfileProvider.notifier).refresh(), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, UserModel user) {
    final unreadCount = ref.watch(notificationListProvider.select((s) => s.unreadCount));
    return ListView(
      physics: const BouncingScrollPhysics(),
      children: [
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
          child: Column(
            children: [
              _Avatar(user: user),
              const SizedBox(height: 16),
              Text(user.fullName, style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
              const SizedBox(height: 4),
              Text(user.email, style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
              if (user.phoneNumber.isNotEmpty) ...[
                const SizedBox(height: 2),
                Text(user.phoneNumber, style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
              ],
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const EditProfileScreen())),
                icon: const Icon(Icons.edit_outlined, size: 16),
                label: Text('Edit Profile', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 13)),
                style: OutlinedButton.styleFrom(foregroundColor: AppColors.primary, side: const BorderSide(color: AppColors.primary)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _sectionHeader('Account'),
        _option(
          context,
          Icons.notifications_none_rounded,
          'Notifications',
          () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationCenterScreen())),
          trailing: unreadCount > 0 ? NotificationBadge(count: unreadCount) : null,
        ),
        _option(context, Icons.location_on_rounded, 'Manage Addresses', () => Navigator.pushNamed(context, '/addresses')),
        _option(context, Icons.autorenew_rounded, 'My Subscriptions', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SubscriptionDashboardScreen()))),
        _option(context, Icons.favorite_border_rounded, 'My Wishlist', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WishlistScreen()))),
        _option(context, Icons.receipt_long_rounded, 'Payment History', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentHistoryScreen()))),
        _option(context, Icons.credit_card_rounded, 'Payment Methods', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PaymentMethodsScreen()))),
        _option(context, Icons.lock_outline_rounded, 'Change Password', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ChangePasswordScreen()))),
        const SizedBox(height: 12),
        _sectionHeader('Rewards & Offers'),
        _option(context, Icons.workspace_premium_rounded, 'Loyalty & Rewards', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoyaltyDashboardScreen()))),
        _option(context, Icons.celebration_outlined, 'Offers & Deals', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const OffersScreen()))),
        _option(context, Icons.local_offer_outlined, 'Coupons', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CouponsScreen()))),
        _option(context, Icons.card_giftcard_rounded, 'Referral', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReferralScreen()))),
        _option(context, Icons.emoji_events_outlined, 'Rewards', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RewardsScreen()))),
        _option(context, Icons.account_balance_wallet_outlined, 'Wallet', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen()))),
        const SizedBox(height: 12),
        _sectionHeader('Preferences'),
        _option(context, Icons.notifications_none_rounded, 'Notification Settings', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationSettingsScreen()))),
        _option(context, Icons.dark_mode_outlined, 'Theme', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ThemeScreen()))),
        _option(context, Icons.language_rounded, 'Language', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LanguageScreen()))),
        const SizedBox(height: 12),
        _sectionHeader('Privacy & Support'),
        _option(context, Icons.privacy_tip_outlined, 'Privacy', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PrivacyScreen()))),
        _option(context, Icons.help_outline_rounded, 'Help & Support', () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SupportCenterScreen()))),
        _option(context, Icons.logout_rounded, 'Sign Out', () => _handleLogout(context), isLogout: true),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 6),
      child: Text(title, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textHint, letterSpacing: 0.6)),
    );
  }

  Widget _option(BuildContext context, IconData icon, String title, VoidCallback onTap, {bool isLogout = false, Widget? trailing}) {
    return Material(
      color: Colors.white,
      child: ListTile(
        leading: Icon(icon, color: isLogout ? Colors.red : AppColors.primary),
        title: Text(
          title,
          style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w600, color: isLogout ? Colors.red : AppColors.textPrimary),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (trailing != null) ...[trailing, const SizedBox(width: 8)],
            const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textHint),
          ],
        ),
        onTap: onTap,
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  final UserModel user;
  const _Avatar({required this.user});

  @override
  Widget build(BuildContext context) {
    final url = user.profileImageUrl;
    return Container(
      width: 90,
      height: 90,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.primary, width: 3),
        color: AppColors.surfaceLight,
      ),
      child: ClipOval(
        child: (url != null && url.isNotEmpty)
            ? CachedNetworkImage(
                imageUrl: url,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => const Icon(Icons.person_rounded, size: 56, color: AppColors.primary),
              )
            : const Icon(Icons.person_rounded, size: 56, color: AppColors.primary),
      ),
    );
  }
}
