import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../models/order_status.dart';
import '../../data/repositories/order_repository_impl.dart';
import '../../domain/entities/order_summary.dart';
import '../../domain/repositories/order_repository.dart';

final orderRepositoryProvider = Provider<OrderRepository>((ref) => OrderRepositoryImpl());

/// Live, single-order view used by both Order Detail and Tracking — backed
/// by Supabase Realtime (OrderService.watchOrder), so both screens auto
/// refresh on status/ETA/delivery-partner changes without polling.
final orderStreamProvider = StreamProvider.autoDispose.family<OrderSummary?, String>((ref, orderId) {
  return ref.watch(orderRepositoryProvider).watchOrder(orderId);
});

final orderRatingProvider = FutureProvider.autoDispose.family<Map<String, dynamic>?, String>((ref, orderId) {
  return ref.watch(orderRepositoryProvider).fetchRating(orderId);
});

final ordersListProvider = StateNotifierProvider<OrdersListNotifier, OrdersListState>((ref) {
  return OrdersListNotifier(ref.read(orderRepositoryProvider));
});

class OrdersListState {
  final List<OrderSummary> orders;
  final bool isLoading;
  final Object? error;

  const OrdersListState({this.orders = const [], this.isLoading = true, this.error});

  List<OrderSummary> get current => orders.where((o) => o.status.isActive).toList();
  List<OrderSummary> get past => orders.where((o) => !o.status.isActive).toList();

  OrdersListState copyWith({List<OrderSummary>? orders, bool? isLoading, Object? error, bool clearError = false}) {
    return OrdersListState(
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class OrdersListNotifier extends StateNotifier<OrdersListState> {
  final OrderRepository _repository;

  OrdersListNotifier(this._repository) : super(const OrdersListState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final orders = await _repository.fetchOrders();
      state = state.copyWith(orders: orders, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e);
    }
  }

  Future<void> refresh() => load();
  Future<void> retry() => load();

  Future<bool> cancelOrder(String orderId, {String? reason}) async {
    final previous = state.orders;
    final target = previous.where((o) => o.id == orderId).firstOrNull;
    if (target == null || !target.status.isCancellable) return false;

    state = state.copyWith(
      orders: previous
          .map((o) => o.id == orderId
              ? OrderSummary(
                  id: o.id,
                  totalPrice: o.totalPrice,
                  status: OrderStatus.cancelled,
                  createdAt: o.createdAt,
                  items: o.items,
                  deliverySlot: o.deliverySlot,
                  paymentMethod: o.paymentMethod,
                  address: o.address,
                  deliveryPartner: o.deliveryPartner,
                )
              : o)
          .toList(),
    );

    try {
      await _repository.cancelOrder(orderId, reason: reason);
      return true;
    } catch (_) {
      state = state.copyWith(orders: previous);
      return false;
    }
  }
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
