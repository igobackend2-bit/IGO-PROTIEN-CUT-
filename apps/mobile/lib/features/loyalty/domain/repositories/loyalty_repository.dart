import '../entities/achievement.dart';
import '../entities/reward_transaction.dart';
import '../entities/wallet_transaction.dart';

abstract class LoyaltyRepository {
  Future<List<RewardTransaction>> fetchRewardTransactions();
  Future<List<WalletTransaction>> fetchWalletTransactions();
  Future<List<Achievement>> fetchAchievements();
  Future<String?> resolveReferralCode(String code);
}
