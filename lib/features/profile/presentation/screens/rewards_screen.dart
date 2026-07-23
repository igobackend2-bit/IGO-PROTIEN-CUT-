import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../loyalty/presentation/providers/loyalty_providers.dart';
import '../../../loyalty/presentation/screens/membership_screen.dart';
import '../../../loyalty/presentation/widgets/loyalty_states.dart';
import '../../../loyalty/presentation/widgets/reward_transaction_tile.dart';
import '../../../loyalty/presentation/widgets/tier_progress_card.dart';

/// Extended in Phase 13 — points, tier and history are now real, driven by
/// loyaltyProvider's reward_transactions ledger, replacing the Phase 10
/// hardcoded-zero placeholder in place.
class RewardsScreen extends ConsumerWidget {
  const RewardsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(loyaltyProvider);
    final notifier = ref.read(loyaltyProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Rewards', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
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
                      if (state.summary.expiringPoints > 0) ...[
                        const SizedBox(height: 12),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(color: AppColors.warning.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                          child: Row(
                            children: [
                              const Icon(Icons.timer_outlined, size: 16, color: AppColors.warning),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  '${state.summary.expiringPoints} points expiring within 30 days',
                                  style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.warning),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(child: _statCard('Current Points', '${state.summary.currentPoints}')),
                          const SizedBox(width: 12),
                          Expanded(child: _statCard('Lifetime Points', '${state.summary.lifetimePoints}')),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Text('Points History', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      const SizedBox(height: 10),
                      if (state.rewardTransactions.isEmpty)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 28),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
                          child: Column(
                            children: [
                              const Icon(Icons.emoji_events_outlined, size: 36, color: AppColors.textHint),
                              const SizedBox(height: 10),
                              Text('Place your first order to start earning points.', style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary)),
                            ],
                          ),
                        )
                      else
                        ...state.rewardTransactions.map((t) => RewardTransactionTile(transaction: t)),
                    ],
                  ),
                ),
    );
  }

  Widget _statCard(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.divider)),
      child: Column(
        children: [
          Text(value, style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.primary)),
          const SizedBox(height: 2),
          Text(label, style: GoogleFonts.outfit(fontSize: 10.5, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
