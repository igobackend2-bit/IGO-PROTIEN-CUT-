import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../utils/app_colors.dart';
import '../providers/profile_providers.dart';

class PrivacyScreen extends ConsumerStatefulWidget {
  const PrivacyScreen({super.key});

  @override
  ConsumerState<PrivacyScreen> createState() => _PrivacyScreenState();
}

class _PrivacyScreenState extends ConsumerState<PrivacyScreen> {
  bool _isLoggingOutAll = false;

  Future<void> _handleLogoutAllDevices() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Logout from all devices?', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: Text('You will be signed out everywhere, including this device.', style: GoogleFonts.outfit(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text('Logout Everywhere', style: GoogleFonts.outfit(color: AppColors.error, fontWeight: FontWeight.w700))),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _isLoggingOutAll = true);
    await ref.read(profileRepositoryProvider).logoutAllDevices();
    if (!mounted) return;
    Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
  }

  Future<void> _handleDeleteAccount() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Delete Account?', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: AppColors.error)),
        content: Text(
          'This permanently deletes your account and order history. We\'ll send your request to support to process — this can\'t be done automatically for your safety.',
          style: GoogleFonts.outfit(color: AppColors.textSecondary, fontSize: 13),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text('Request Deletion', style: GoogleFonts.outfit(color: AppColors.error, fontWeight: FontWeight.w700))),
        ],
      ),
    );
    if (confirmed != true) return;
    if (!mounted) return;

    final user = ref.read(userProfileProvider).value;
    await launchUrl(Uri(
      scheme: 'mailto',
      path: 'support@proteincuts.com',
      query: 'subject=Account Deletion Request&body=Please delete my Protein Cuts account.%0AAccount email: ${user?.email ?? ''}',
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Privacy', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [const Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 20), const SizedBox(width: 10), Text('Your Data', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700))]),
                const SizedBox(height: 10),
                Text(
                  'We store your profile details, delivery addresses, order and payment history, and wishlist to run your account. '
                  'We never sell your data. You can request deletion of your account and data at any time below.',
                  style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary, height: 1.5),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Material(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            child: ListTile(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: AppColors.divider)),
              leading: const Icon(Icons.devices_other_rounded, color: AppColors.primary),
              title: Text('Logout from all devices', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700)),
              subtitle: Text('End every active session, including this one', style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
              trailing: _isLoggingOutAll ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textHint),
              onTap: _isLoggingOutAll ? null : _handleLogoutAllDevices,
            ),
          ),
          const SizedBox(height: 12),
          Material(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            child: ListTile(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: AppColors.error.withOpacity(0.3))),
              leading: const Icon(Icons.delete_outline_rounded, color: AppColors.error),
              title: Text('Delete Account', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.error)),
              subtitle: Text('Permanently remove your account and data', style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
              onTap: _handleDeleteAccount,
            ),
          ),
        ],
      ),
    );
  }
}
