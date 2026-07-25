import 'package:data_table_2/data_table_2.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/debouncer.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/paginated_table.dart';
import '../../../../core/widgets/search_filter_bar.dart';
import '../../domain/customer_profile.dart';
import '../users_list_controller.dart';
import '../widgets/customer_detail_dialog.dart';

class UsersScreen extends ConsumerStatefulWidget {
  const UsersScreen({super.key});

  @override
  ConsumerState<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends ConsumerState<UsersScreen> {
  final _debouncer = Debouncer();

  @override
  void dispose() {
    _debouncer.dispose();
    super.dispose();
  }

  static const _columns = [
    DataColumn2(label: Text('Name'), size: ColumnSize.L),
    DataColumn2(label: Text('Phone')),
    DataColumn2(label: Text('Joined')),
  ];

  @override
  Widget build(BuildContext context) {
    final filter = ref.watch(usersFilterProvider);
    final resultAsync = ref.watch(usersListControllerProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Customers', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 16),
        SearchFilterBar(
          hintText: 'Search by name or phone…',
          onSearchChanged: (v) => _debouncer.run(() => ref.read(usersFilterProvider.notifier).setSearch(v)),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: resultAsync.when(
            loading: () => PaginatedTable<CustomerProfile>(
              columns: _columns,
              items: const [],
              rowBuilder: (_) => const DataRow2(cells: []),
              total: 0,
              offset: filter.offset,
              limit: filter.limit,
              onOffsetChanged: (_) {},
              isLoading: true,
            ),
            error: (e, _) => PaginatedTable<CustomerProfile>(
              columns: _columns,
              items: const [],
              rowBuilder: (_) => const DataRow2(cells: []),
              total: 0,
              offset: filter.offset,
              limit: filter.limit,
              onOffsetChanged: (_) {},
              errorMessage: e.toString(),
              onRetry: () => ref.read(usersListControllerProvider.notifier).refresh(),
            ),
            data: (result) => PaginatedTable<CustomerProfile>(
              columns: _columns,
              items: result.customers,
              total: result.total,
              offset: filter.offset,
              limit: filter.limit,
              onOffsetChanged: (v) => ref.read(usersFilterProvider.notifier).setOffset(v),
              emptyMessage: 'No customers match your search.',
              rowBuilder: (customer) => DataRow2(
                onTap: () => showCustomerDetailDialog(context, customer.id),
                cells: [
                  DataCell(Text(customer.fullName ?? 'Unnamed')),
                  DataCell(Text(customer.phoneNumber ?? '—')),
                  DataCell(Text(Formatters.date(customer.createdAt))),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
