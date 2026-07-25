import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/support_repository.dart';
import 'support_providers.dart';

const _unset = Object();

class TicketsFilter {
  final String? status;
  final int limit;
  final int offset;

  const TicketsFilter({this.status, this.limit = 20, this.offset = 0});

  TicketsFilter copyWith({Object? status = _unset, int? offset}) => TicketsFilter(
        status: status == _unset ? this.status : status as String?,
        limit: limit,
        offset: offset ?? this.offset,
      );
}

class TicketsFilterNotifier extends Notifier<TicketsFilter> {
  @override
  TicketsFilter build() => const TicketsFilter();

  void setStatus(String? value) => state = state.copyWith(status: value, offset: 0);

  void setOffset(int value) => state = state.copyWith(offset: value);
}

final ticketsFilterProvider = NotifierProvider<TicketsFilterNotifier, TicketsFilter>(TicketsFilterNotifier.new);

class TicketsListController extends AsyncNotifier<TicketListResult> {
  @override
  Future<TicketListResult> build() async {
    final filter = ref.watch(ticketsFilterProvider);
    final repo = ref.watch(supportRepositoryProvider);
    return repo.listTickets(status: filter.status, limit: filter.limit, offset: filter.offset);
  }

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }
}

final ticketsListControllerProvider =
    AsyncNotifierProvider<TicketsListController, TicketListResult>(TicketsListController.new);
