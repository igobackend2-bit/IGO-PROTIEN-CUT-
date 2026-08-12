import 'package:data_table_2/data_table_2.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/debouncer.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/paginated_table.dart';
import '../../../../core/widgets/search_filter_bar.dart';
import '../../domain/order.dart';
import '../../domain/order_status.dart';
import '../orders_list_controller.dart';
import '../widgets/order_detail_dialog.dart';

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  final _debouncer = Debouncer();

  @override
  void dispose() {
    _debouncer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filter = ref.watch(ordersFilterProvider);
    final resultAsync = ref.watch(ordersListControllerProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Orders', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 16),
        SearchFilterBar(
          hintText: 'Filter by customer ID…',
          onSearchChanged: (v) => _debouncer.run(() => ref.read(ordersFilterProvider.notifier).setUserId(v)),
          filters: [
            DropdownMenu<String?>(
              hintText: 'Status',
              initialSelection: filter.status,
              dropdownMenuEntries: [
                const DropdownMenuEntry(value: null, label: 'All statuses'),
                for (final s in OrderStatus.all) DropdownMenuEntry(value: s, label: s),
              ],
              onSelected: (v) => ref.read(ordersFilterProvider.notifier).setStatus(v),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: resultAsync.when(
            loading: () => PaginatedTable<Order>(
              columns: _columns,
              items: const [],
              rowBuilder: (_) => const DataRow2(cells: []),
              total: 0,
              offset: filter.offset,
              limit: filter.limit,
              onOffsetChanged: (_) {},
              isLoading: true,
            ),
            error: (e, _) => PaginatedTable<Order>(
              columns: _columns,
              items: const [],
              rowBuilder: (_) => const DataRow2(cells: []),
              total: 0,
              offset: filter.offset,
              limit: filter.limit,
              onOffsetChanged: (_) {},
              errorMessage: e.toString(),
              onRetry: () => ref.read(ordersListControllerProvider.notifier).refresh(),
            ),
            data: (result) => PaginatedTable<Order>(
              columns: _columns,
              items: result.orders,
              total: result.total,
              offset: filter.offset,
              limit: filter.limit,
              onOffsetChanged: (v) => ref.read(ordersFilterProvider.notifier).setOffset(v),
              emptyMessage: 'No orders match your filters.',
              rowBuilder: (order) => DataRow2(
                onTap: () => showOrderDetailDialog(
                  context,
                  order.id,
                  onChanged: () => ref.read(ordersListControllerProvider.notifier).refresh(),
                ),
                cells: [
                  DataCell(Text('#${order.id.substring(0, order.id.length.clamp(0, 8))}')),
                  DataCell(Text(Formatters.dateTime(order.createdAt))),
                  DataCell(Text(order.status)),
                  DataCell(Text(Formatters.currency(order.totalPrice))),
                  DataCell(Text(order.paymentMethod ?? '—')),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  static const _columns = [
    DataColumn2(label: Text('Order')),
    DataColumn2(label: Text('Date'), size: ColumnSize.L),
    DataColumn2(label: Text('Status')),
    DataColumn2(label: Text('Total'), numeric: true),
    DataColumn2(label: Text('Payment')),
  ];
}
