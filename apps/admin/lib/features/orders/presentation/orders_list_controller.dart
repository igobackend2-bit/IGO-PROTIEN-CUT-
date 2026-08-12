import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/orders_repository.dart';
import 'orders_providers.dart';

const _unset = Object();

class OrdersFilter {
  final String? status;
  final String userId;
  final int limit;
  final int offset;

  const OrdersFilter({this.status, this.userId = '', this.limit = 20, this.offset = 0});

  OrdersFilter copyWith({Object? status = _unset, String? userId, int? offset}) {
    return OrdersFilter(
      status: status == _unset ? this.status : status as String?,
      userId: userId ?? this.userId,
      limit: limit,
      offset: offset ?? this.offset,
    );
  }
}

class OrdersFilterNotifier extends Notifier<OrdersFilter> {
  @override
  OrdersFilter build() => const OrdersFilter();

  void setStatus(String? value) => state = state.copyWith(status: value, offset: 0);

  void setUserId(String value) => state = state.copyWith(userId: value, offset: 0);

  void setOffset(int value) => state = state.copyWith(offset: value);
}

final ordersFilterProvider = NotifierProvider<OrdersFilterNotifier, OrdersFilter>(OrdersFilterNotifier.new);

class OrdersListController extends AsyncNotifier<OrderListResult> {
  @override
  Future<OrderListResult> build() async {
    final filter = ref.watch(ordersFilterProvider);
    final repo = ref.watch(ordersRepositoryProvider);
    return repo.list(status: filter.status, userId: filter.userId, limit: filter.limit, offset: filter.offset);
  }

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }
}

final ordersListControllerProvider =
    AsyncNotifierProvider<OrdersListController, OrderListResult>(OrdersListController.new);
