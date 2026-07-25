import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/users_repository.dart';
import 'users_providers.dart';

class UsersFilter {
  final String search;
  final int limit;
  final int offset;

  const UsersFilter({this.search = '', this.limit = 20, this.offset = 0});

  UsersFilter copyWith({String? search, int? offset}) => UsersFilter(
        search: search ?? this.search,
        limit: limit,
        offset: offset ?? this.offset,
      );
}

class UsersFilterNotifier extends Notifier<UsersFilter> {
  @override
  UsersFilter build() => const UsersFilter();

  void setSearch(String value) => state = state.copyWith(search: value, offset: 0);

  void setOffset(int value) => state = state.copyWith(offset: value);
}

final usersFilterProvider = NotifierProvider<UsersFilterNotifier, UsersFilter>(UsersFilterNotifier.new);

class UsersListController extends AsyncNotifier<CustomerListResult> {
  @override
  Future<CustomerListResult> build() async {
    final filter = ref.watch(usersFilterProvider);
    final repo = ref.watch(usersRepositoryProvider);
    return repo.list(search: filter.search, limit: filter.limit, offset: filter.offset);
  }

  Future<void> refresh() async {
    ref.invalidateSelf();
    await future;
  }
}

final usersListControllerProvider =
    AsyncNotifierProvider<UsersListController, CustomerListResult>(UsersListController.new);
