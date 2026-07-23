import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../orders/presentation/providers/order_providers.dart';
import '../../data/repositories/subscription_repository_impl.dart';
import '../../domain/entities/subscription.dart';
import '../../domain/repositories/subscription_repository.dart';

final subscriptionRepositoryProvider = Provider<SubscriptionRepository>((ref) => SubscriptionRepositoryImpl());

class SubscriptionListState {
  final List<Subscription> subscriptions;
  final bool isLoading;
  final Object? error;

  const SubscriptionListState({this.subscriptions = const [], this.isLoading = true, this.error});

  List<Subscription> get active => subscriptions.where((s) => s.status == SubscriptionStatus.active && s.isDueForDelivery).toList();
  List<Subscription> get upcoming => subscriptions.where((s) => s.isUpcoming).toList();
  List<Subscription> get paused => subscriptions.where((s) => s.status == SubscriptionStatus.paused).toList();
  List<Subscription> get completed => subscriptions.where((s) => s.status == SubscriptionStatus.completed).toList();
  List<Subscription> get cancelled => subscriptions.where((s) => s.status == SubscriptionStatus.cancelled).toList();

  SubscriptionListState copyWith({List<Subscription>? subscriptions, bool? isLoading, Object? error, bool clearError = false}) {
    return SubscriptionListState(
      subscriptions: subscriptions ?? this.subscriptions,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

final subscriptionListProvider = StateNotifierProvider.autoDispose<SubscriptionListNotifier, SubscriptionListState>((ref) {
  return SubscriptionListNotifier(ref.read(subscriptionRepositoryProvider));
});

class SubscriptionListNotifier extends StateNotifier<SubscriptionListState> {
  final SubscriptionRepository _repository;

  SubscriptionListNotifier(this._repository) : super(const SubscriptionListState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final subscriptions = await _repository.fetchSubscriptions();
      state = state.copyWith(subscriptions: subscriptions, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e);
    }
  }

  Future<void> refresh() => load();
  Future<void> retry() => load();

  Future<bool> pause(Subscription subscription) => _optimisticStatusChange(subscription, SubscriptionStatus.paused, () => _repository.pause(subscription.id));

  Future<bool> resume(Subscription subscription, {required DateTime nextDelivery}) {
    return _optimisticStatusChange(subscription, SubscriptionStatus.active, () => _repository.resume(subscription.id, nextDelivery: nextDelivery));
  }

  Future<bool> cancel(Subscription subscription) => _optimisticStatusChange(subscription, SubscriptionStatus.cancelled, () => _repository.cancel(subscription.id));

  Future<bool> _optimisticStatusChange(Subscription subscription, SubscriptionStatus newStatus, Future<void> Function() action) async {
    final previous = state.subscriptions;
    state = state.copyWith(
      subscriptions: previous.map((s) => s.id == subscription.id ? _withStatus(s, newStatus) : s).toList(),
    );
    try {
      await action();
      await load(); // refetch for the real next_delivery / server truth
      return true;
    } catch (_) {
      state = state.copyWith(subscriptions: previous);
      return false;
    }
  }

  Future<bool> skipNextDelivery(Subscription subscription) async {
    try {
      await _repository.skipNextDelivery(subscription);
      await load();
      return true;
    } catch (_) {
      return false;
    }
  }

  Subscription _withStatus(Subscription s, SubscriptionStatus status) {
    return Subscription(
      id: s.id,
      userId: s.userId,
      product: s.product,
      address: s.address,
      quantity: s.quantity,
      variantId: s.variantId,
      scheduleType: s.scheduleType,
      weekdays: s.weekdays,
      interval: s.interval,
      nextDelivery: s.nextDelivery,
      deliverySlot: s.deliverySlot,
      paymentMethod: s.paymentMethod,
      status: status,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    );
  }
}

/// Runs the "generate due orders + send upcoming reminders" pass once per
/// app session — see SubscriptionService.processDueSubscriptions for why
/// this can't be true server-side scheduling.
final subscriptionProcessorProvider = Provider<SubscriptionProcessor>((ref) => SubscriptionProcessor(ref));

class SubscriptionProcessor {
  final Ref _ref;
  SubscriptionProcessor(this._ref);

  Future<void> runOnce() async {
    try {
      final repository = _ref.read(subscriptionRepositoryProvider);
      final processedCount = await repository.processDueSubscriptions();
      await repository.sendUpcomingDeliveryReminders();
      if (processedCount > 0) {
        _ref.invalidate(subscriptionListProvider);
        _ref.invalidate(ordersListProvider);
      }
    } catch (_) {
      // Best-effort background process — failures here shouldn't disrupt
      // the rest of the app from loading normally.
    }
  }
}
