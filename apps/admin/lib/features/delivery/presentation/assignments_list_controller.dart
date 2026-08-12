import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/delivery_repository.dart';
import 'delivery_providers.dart';

const _unset = Object();

class AssignmentsFilter {
  final String? status;
  final int limit;
  final int offset;

  const AssignmentsFilter({this.status, this.limit = 20, this.offset = 0});

  AssignmentsFilter copyWith({Object? status = _unset, int? offset}) => AssignmentsFilter(
        status: status == _unset ? this.status : status as String?,
        limit: limit,
        offset: offset ?? this.offset,
      );
}

class AssignmentsFilterNotifier extends Notifier<AssignmentsFilter> {
  @override
  AssignmentsFilter build() => const AssignmentsFilter();

  void setStatus(String? value) => state = state.copyWith(status: value, offset: 0);

  void setOffset(int value) => state = state.copyWith(offset: value);
}

final assignmentsFilterProvider =
    NotifierProvider<AssignmentsFilterNotifier, AssignmentsFilter>(AssignmentsFilterNotifier.new);

class AssignmentsListController extends AsyncNotifier<DeliveryAssignmentListResult> {
  @override
  Future<DeliveryAssignmentListResult> build() async {
    final filter = ref.watch(assignmentsFilterProvider);
    final repo = ref.watch(deliveryRepositoryProvider);
    return repo.list(status: filter.status, limit: filter.limit, offset: filter.offset);
  }

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }
}

final assignmentsListControllerProvider =
    AsyncNotifierProvider<AssignmentsListController, DeliveryAssignmentListResult>(AssignmentsListController.new);
