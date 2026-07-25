import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../utils/app_colors.dart';
import '../../../loyalty/presentation/providers/loyalty_providers.dart';
import '../../../loyalty/presentation/widgets/loyalty_states.dart';
import '../../../loyalty/presentation/widgets/reward_transaction_tile.dart';
import '../providers/profile_providers.dart';

/// Extended in Phase 13 — the referral code (still derived client-side from
/// the user's id, matching the same scheme now also stored on `profiles`
/// for signup-time lookup) is real and redeemable: a new signup entering it
/// links `referred_by`, and when that friend's first order is delivered
/// the referrer is credited here for real via reward_transactions /
/// wallet_transactions.
class ReferralScreen extends ConsumerWidget {
  const ReferralScreen({super.key});

  String _codeFor(String userId) {
    final clean = userId.replaceAll('-', '').toUpperCase();
    return 'PC${clean.substring(0, clean.length < 8 ? clean.length : 8)}';
  }

  void _copy(BuildContext context, String code) {
    Clipboard.setData(ClipboardData(text: code));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Referral code copied', style: GoogleFonts.outfit()), backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProfileProvider).value;
    final code = user == null ? '' : _codeFor(user.id);
    final loyaltyState = ref.watch(loyaltyProvider);
    final loyaltyNotifier = ref.read(loyaltyProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Referral', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: loyaltyState.isLoading
          ? const LoyaltySkeleton()
          : loyaltyState.error != null
              ? LoyaltyErrorState(onRetry: loyaltyNotifier.retry)
              : RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: loyaltyNotifier.refresh,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    children: [
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(20)),
                        child: Column(
                          children: [
                            Text('Invite Friends, Earn Rewards', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white), textAlign: TextAlign.center),
                            const SizedBox(height: 4),
                            Text('You get 100 points + ₹50, and they get 15% off their first order', style: GoogleFonts.outfit(fontSize: 11, color: Colors.white.withOpacity(0.85)), textAlign: TextAlign.center),
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                              decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white38)),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(code, style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 1.5)),
                                  const SizedBox(width: 12),
                                  GestureDetector(onTap: () => _copy(context, code), child: const Icon(Icons.copy_rounded, color: Colors.white, size: 20)),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                onPressed: code.isEmpty
                                    ? null
                                    : () => Share.share(
                                          'Join me on Protein Cuts! Use my referral code $code when you sign up, '
                                          'then apply coupon REFER15 at checkout for 15% off your first order.',
                                          subject: 'Join Protein Cuts',
                                        ),
                                icon: const Icon(Icons.ios_share_rounded, size: 18),
                                label: Text('Share Referral Code', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                              ),
                            ),
                            const SizedBox(height: 12),
                            GestureDetector(
                              onTap: () => _copy(context, 'REFER15'),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.card_giftcard_rounded, size: 14, color: Colors.white),
                                    const SizedBox(width: 6),
                                    Text('Friend\'s discount code: REFER15', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
                                    const SizedBox(width: 6),
                                    const Icon(Icons.copy_rounded, size: 12, color: Colors.white70),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(child: _statCard('Successful Referrals', '${loyaltyState.summary.successfulReferrals}')),
                          const SizedBox(width: 12),
                          Expanded(child: _statCard('Points Earned', '${loyaltyState.summary.referralPointsEarned}')),
                          const SizedBox(width: 12),
                          Expanded(child: _statCard('Cash Earned', '₹${loyaltyState.summary.referralCashEarned.toStringAsFixed(0)}')),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Text('Referral History', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      const SizedBox(height: 10),
                      Builder(builder: (context) {
                        final referralRewards = loyaltyState.rewardTransactions.where((r) => r.type == 'referral').toList();
                        if (referralRewards.isEmpty) {
                          return Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 28),
                            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
                            child: Column(
                              children: [
                                const Icon(Icons.people_outline_rounded, size: 36, color: AppColors.textHint),
                                const SizedBox(height: 10),
                                Text("You haven't referred anyone yet.", style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary)),
                              ],
                            ),
                          );
                        }
                        return Column(children: referralRewards.map((r) => RewardTransactionTile(transaction: r)).toList());
                      }),
                    ],
                  ),
                ),
    );
  }

  Widget _statCard(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.divider)),
      child: Column(
        children: [
          Text(value, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary)),
          const SizedBox(height: 2),
          Text(label, textAlign: TextAlign.center, style: GoogleFonts.outfit(fontSize: 9.5, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
