import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../providers/loyalty_providers.dart';
import '../widgets/achievement_badge.dart';
import '../widgets/loyalty_states.dart';

class AchievementScreen extends ConsumerWidget {
  const AchievementScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(loyaltyProvider);
    final notifier = ref.read(loyaltyProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Achievements', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: _buildBody(state, notifier),
    );
  }

  Widget _buildBody(LoyaltyState state, LoyaltyNotifier notifier) {
    if (state.isLoading) return const LoyaltySkeleton();
    if (state.error != null) return LoyaltyErrorState(onRetry: notifier.retry);
    if (state.achievements.isEmpty) {
      return const LoyaltyEmptyState(icon: Icons.emoji_events_outlined, title: 'No achievements yet', message: 'Achievements will appear here once available.');
    }

    final unlockedCount = state.achievements.where((a) => a.isUnlocked).length;

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: notifier.refresh,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(16)),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.emoji_events_rounded, color: Colors.white, size: 22),
                const SizedBox(width: 10),
                Text('$unlockedCount of ${state.achievements.length} unlocked', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ...state.achievements.map((a) => Padding(padding: const EdgeInsets.only(bottom: 10), child: AchievementBadge(achievement: a))),
        ],
      ),
    );
  }
}
