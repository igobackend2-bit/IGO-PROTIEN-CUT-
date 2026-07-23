import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../profile/presentation/screens/referral_screen.dart';
import '../../../profile/presentation/screens/rewards_screen.dart';
import '../../../profile/presentation/screens/wallet_screen.dart';
import '../../domain/entities/loyalty_summary.dart';
import '../providers/loyalty_providers.dart';
import '../widgets/achievement_badge.dart';
import '../widgets/loyalty_states.dart';
import '../widgets/tier_progress_card.dart';
import 'achievement_screen.dart';
import 'membership_screen.dart';

class LoyaltyDashboardScreen extends ConsumerWidget {
  const LoyaltyDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(loyaltyProvider);
    final notifier = ref.read(loyaltyProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Loyalty & Rewards', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: state.isLoading
          ? const LoyaltySkeleton()
          : state.error != null
              ? LoyaltyErrorState(onRetry: notifier.retry)
              : RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: notifier.refresh,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    children: [
                      GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MembershipScreen())),
                        child: TierProgressCard(summary: state.summary),
                      ),
                      const SizedBox(height: 16),
                      _statGrid(context, state.summary),
                      const SizedBox(height: 20),
                      _sectionHeader(
                        context,
                        title: 'Achievements',
                        subtitle: '${state.summary.unlockedAchievementsCount}/${state.summary.totalAchievementsCount} unlocked',
                        onViewAll: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AchievementScreen())),
                      ),
                      const SizedBox(height: 10),
                      if (state.achievements.isEmpty)
                        const LoyaltyEmptyState(icon: Icons.emoji_events_outlined, title: 'No achievements yet', message: '')
                      else
                        ...state.achievements.take(3).map((a) => Padding(padding: const EdgeInsets.only(bottom: 10), child: AchievementBadge(achievement: a))),
                    ],
                  ),
                ),
    );
  }

  Widget _statGrid(BuildContext context, LoyaltySummary summary) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.7,
      children: [
        _statTile(
          icon: Icons.card_giftcard_rounded,
          label: 'Reward Points',
          value: '${summary.currentPoints}',
          color: AppColors.primary,
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RewardsScreen())),
        ),
        _statTile(
          icon: Icons.account_balance_wallet_rounded,
          label: 'Wallet Balance',
          value: '₹${summary.walletBalance.toStringAsFixed(0)}',
          color: const Color(0xFF2471A3),
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen())),
        ),
        _statTile(
          icon: Icons.savings_rounded,
          label: 'Cashback Earned',
          value: '₹${summary.cashbackCredited.toStringAsFixed(0)}',
          color: AppColors.success,
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen())),
        ),
        _statTile(
          icon: Icons.groups_rounded,
          label: 'Referral Earnings',
          value: '₹${summary.referralCashEarned.toStringAsFixed(0)}',
          color: const Color(0xFF7D3C98),
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ReferralScreen())),
        ),
      ],
    );
  }

  Widget _statTile({required IconData icon, required String label, required String value, required Color color, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 20),
            const Spacer(),
            Text(value, style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
            Text(label, style: GoogleFonts.outfit(fontSize: 10.5, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(BuildContext context, {required String title, required String subtitle, required VoidCallback onViewAll}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            Text(subtitle, style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint)),
          ],
        ),
        TextButton(onPressed: onViewAll, child: Text('View All', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.primary))),
      ],
    );
  }
}
