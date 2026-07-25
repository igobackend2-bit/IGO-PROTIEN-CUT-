import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/repositories/loyalty_repository_impl.dart';
import '../../domain/entities/achievement.dart';
import '../../domain/entities/loyalty_summary.dart';
import '../../domain/entities/reward_transaction.dart';
import '../../domain/entities/wallet_transaction.dart';
import '../../domain/repositories/loyalty_repository.dart';

final loyaltyRepositoryProvider = Provider<LoyaltyRepository>((ref) => LoyaltyRepositoryImpl());

class LoyaltyState {
  final List<RewardTransaction> rewardTransactions;
  final List<WalletTransaction> walletTransactions;
  final List<Achievement> achievements;
  final bool isLoading;
  final Object? error;

  const LoyaltyState({
    this.rewardTransactions = const [],
    this.walletTransactions = const [],
    this.achievements = const [],
    this.isLoading = true,
    this.error,
  });

  LoyaltySummary get summary => LoyaltySummary.compute(
        rewards: rewardTransactions,
        walletTxns: walletTransactions,
        achievements: achievements,
      );

  LoyaltyState copyWith({
    List<RewardTransaction>? rewardTransactions,
    List<WalletTransaction>? walletTransactions,
    List<Achievement>? achievements,
    bool? isLoading,
    Object? error,
    bool clearError = false,
  }) {
    return LoyaltyState(
      rewardTransactions: rewardTransactions ?? this.rewardTransactions,
      walletTransactions: walletTransactions ?? this.walletTransactions,
      achievements: achievements ?? this.achievements,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

/// One shared provider backs every loyalty screen (Dashboard, Wallet,
/// Rewards, Referral, Achievements, Membership) so they all read the exact
/// same numbers — no separate queries per screen that could drift.
final loyaltyProvider = StateNotifierProvider.autoDispose<LoyaltyNotifier, LoyaltyState>((ref) {
  return LoyaltyNotifier(ref.read(loyaltyRepositoryProvider));
});

class LoyaltyNotifier extends StateNotifier<LoyaltyState> {
  final LoyaltyRepository _repository;

  LoyaltyNotifier(this._repository) : super(const LoyaltyState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final results = await Future.wait([
        _repository.fetchRewardTransactions(),
        _repository.fetchWalletTransactions(),
        _repository.fetchAchievements(),
      ]);
      state = state.copyWith(
        rewardTransactions: results[0] as List<RewardTransaction>,
        walletTransactions: results[1] as List<WalletTransaction>,
        achievements: results[2] as List<Achievement>,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e);
    }
  }

  Future<void> refresh() => load();
  Future<void> retry() => load();
}
