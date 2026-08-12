import '../../../../services/loyalty_service.dart';
import '../../domain/entities/achievement.dart';
import '../../domain/entities/reward_transaction.dart';
import '../../domain/entities/wallet_transaction.dart';
import '../../domain/repositories/loyalty_repository.dart';

class LoyaltyRepositoryImpl implements LoyaltyRepository {
  final LoyaltyService _service;
  LoyaltyRepositoryImpl({LoyaltyService? service}) : _service = service ?? LoyaltyService();

  @override
  Future<List<RewardTransaction>> fetchRewardTransactions() async {
    final raw = await _service.fetchRewardTransactions();
    return raw.map(RewardTransaction.fromMap).toList();
  }

  @override
  Future<List<WalletTransaction>> fetchWalletTransactions() async {
    final raw = await _service.fetchWalletTransactions();
    return raw.map(WalletTransaction.fromMap).toList();
  }

  @override
  Future<List<Achievement>> fetchAchievements() async {
    final raw = await _service.fetchAchievements();
    return raw.map(Achievement.fromMap).toList();
  }

  @override
  Future<String?> resolveReferralCode(String code) => _service.resolveReferralCode(code);
}
