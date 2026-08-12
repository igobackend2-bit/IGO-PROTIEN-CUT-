import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/membership_tier.dart';
import '../../../../utils/app_colors.dart';
import '../providers/loyalty_providers.dart';
import '../widgets/loyalty_states.dart';
import '../widgets/tier_progress_card.dart';

class MembershipScreen extends ConsumerWidget {
  const MembershipScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(loyaltyProvider);
    final notifier = ref.read(loyaltyProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Membership', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
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
                      TierProgressCard(summary: state.summary),
                      const SizedBox(height: 20),
                      Text('All Tiers', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      const SizedBox(height: 12),
                      ...MembershipTier.values.map((tier) => _tierCard(tier, state.summary.tier)),
                    ],
                  ),
                ),
    );
  }

  Widget _tierCard(MembershipTier tier, MembershipTier currentTier) {
    final isCurrent = tier == currentTier;
    final isUnlocked = tier.requiredPoints <= currentTier.requiredPoints;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isCurrent ? tier.color : AppColors.divider, width: isCurrent ? 1.5 : 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(color: tier.color.withOpacity(0.12), shape: BoxShape.circle),
                child: Icon(tier.icon, color: tier.color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tier.label, style: GoogleFonts.outfit(fontSize: 14.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                    Text('${tier.requiredPoints}+ points', style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint)),
                  ],
                ),
              ),
              if (isCurrent)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: tier.color, borderRadius: BorderRadius.circular(20)),
                  child: Text('Current', style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
                )
              else if (isUnlocked)
                const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 20),
            ],
          ),
          const SizedBox(height: 12),
          ...tier.benefits.map((b) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Row(
                  children: [
                    Icon(Icons.check_rounded, size: 14, color: isUnlocked ? AppColors.success : AppColors.textHint),
                    const SizedBox(width: 6),
                    Expanded(child: Text(b, style: GoogleFonts.outfit(fontSize: 12, color: isUnlocked ? AppColors.textSecondary : AppColors.textHint))),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}
