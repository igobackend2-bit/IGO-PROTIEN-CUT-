import '../../../../models/membership_tier.dart';
import 'achievement.dart';
import 'reward_transaction.dart';
import 'wallet_transaction.dart';

/// Every field here is derived from the real reward_transactions /
/// wallet_transactions ledgers — nothing is a separately-stored, possibly
/// stale counter.
class LoyaltySummary {
  final int currentPoints;
  final int lifetimePoints;
  final int expiringPoints;
  final MembershipTier tier;
  final double walletBalance;
  final double cashbackCredited;
  final double cashbackPending;
  final int successfulReferrals;
  final int referralPointsEarned;
  final double referralCashEarned;
  final int unlockedAchievementsCount;
  final int totalAchievementsCount;

  const LoyaltySummary({
    required this.currentPoints,
    required this.lifetimePoints,
    required this.expiringPoints,
    required this.tier,
    required this.walletBalance,
    required this.cashbackCredited,
    required this.cashbackPending,
    required this.successfulReferrals,
    required this.referralPointsEarned,
    required this.referralCashEarned,
    required this.unlockedAchievementsCount,
    required this.totalAchievementsCount,
  });

  static const empty = LoyaltySummary(
    currentPoints: 0,
    lifetimePoints: 0,
    expiringPoints: 0,
    tier: MembershipTier.bronze,
    walletBalance: 0,
    cashbackCredited: 0,
    cashbackPending: 0,
    successfulReferrals: 0,
    referralPointsEarned: 0,
    referralCashEarned: 0,
    unlockedAchievementsCount: 0,
    totalAchievementsCount: 0,
  );

  factory LoyaltySummary.compute({
    required List<RewardTransaction> rewards,
    required List<WalletTransaction> walletTxns,
    required List<Achievement> achievements,
  }) {
    final lifetimePoints = rewards.fold<int>(0, (sum, r) => sum + r.points);
    final currentPoints = rewards.where((r) => !r.isExpired).fold<int>(0, (sum, r) => sum + r.points);
    final expiringPoints = rewards.where((r) => r.isExpiringSoon).fold<int>(0, (sum, r) => sum + r.points);

    final walletBalance = walletTxns.where((w) => w.status == 'credited').fold<double>(0, (sum, w) => sum + w.amount);
    final cashbackCredited = walletTxns.where((w) => w.type == 'cashback' && w.status == 'credited').fold<double>(0, (sum, w) => sum + w.amount);
    final cashbackPending = walletTxns.where((w) => w.type == 'cashback' && w.status == 'pending').fold<double>(0, (sum, w) => sum + w.amount);

    final referralRewards = rewards.where((r) => r.type == 'referral').toList();
    final referralWalletTxns = walletTxns.where((w) => w.type == 'referral_bonus').toList();

    return LoyaltySummary(
      currentPoints: currentPoints,
      lifetimePoints: lifetimePoints,
      expiringPoints: expiringPoints,
      tier: MembershipTierX.fromPoints(currentPoints),
      walletBalance: walletBalance,
      cashbackCredited: cashbackCredited,
      cashbackPending: cashbackPending,
      successfulReferrals: referralRewards.length,
      referralPointsEarned: referralRewards.fold<int>(0, (sum, r) => sum + r.points),
      referralCashEarned: referralWalletTxns.fold<double>(0, (sum, w) => sum + w.amount),
      unlockedAchievementsCount: achievements.where((a) => a.isUnlocked).length,
      totalAchievementsCount: achievements.length,
    );
  }

  double get progressToNextTier {
    final next = tier.next;
    if (next == null) return 1;
    final span = next.requiredPoints - tier.requiredPoints;
    if (span <= 0) return 1;
    return ((currentPoints - tier.requiredPoints) / span).clamp(0, 1).toDouble();
  }

  int? get pointsToNextTier {
    final next = tier.next;
    if (next == null) return null;
    return (next.requiredPoints - currentPoints).clamp(0, 1 << 30);
  }
}
