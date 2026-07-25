import 'package:data_table_2/data_table_2.dart';
import 'package:flutter/material.dart';

import 'empty_state_view.dart';
import 'error_retry_view.dart';
import 'loading_view.dart';

/// Shared list-screen table: wraps [DataTable2] with the loading/error/empty
/// states every module needs, plus an offset/limit pagination footer that
/// matches the `limit`/`offset` pagination every `admin-*` `list` action
/// uses server-side (see admin-products/admin-orders/etc `list`).
class PaginatedTable<T> extends StatelessWidget {
  final List<DataColumn2> columns;
  final List<T> items;
  final DataRow2 Function(T item) rowBuilder;
  final bool isLoading;
  final String? errorMessage;
  final VoidCallback? onRetry;
  final String emptyMessage;
  final int total;
  final int offset;
  final int limit;
  final ValueChanged<int> onOffsetChanged;

  const PaginatedTable({
    super.key,
    required this.columns,
    required this.items,
    required this.rowBuilder,
    required this.total,
    required this.offset,
    required this.limit,
    required this.onOffsetChanged,
    this.isLoading = false,
    this.errorMessage,
    this.onRetry,
    this.emptyMessage = 'No records found.',
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Expanded(child: _body(context)),
          const Divider(height: 1),
          _PaginationFooter(
            total: total,
            offset: offset,
            limit: limit,
            onOffsetChanged: onOffsetChanged,
          ),
        ],
      ),
    );
  }

  Widget _body(BuildContext context) {
    if (errorMessage != null) {
      return ErrorRetryView(message: errorMessage!, onRetry: onRetry ?? () {});
    }
    if (isLoading && items.isEmpty) {
      return const LoadingView();
    }
    if (items.isEmpty) {
      return EmptyStateView(message: emptyMessage);
    }
    return DataTable2(
      columns: columns,
      minWidth: 900,
      isVerticalScrollBarVisible: true,
      empty: EmptyStateView(message: emptyMessage),
      rows: items.map(rowBuilder).toList(),
      headingRowColor: WidgetStateProperty.all(
        Theme.of(context).colorScheme.primary.withValues(alpha: 0.06),
      ),
      headingTextStyle: TextStyle(
        fontWeight: FontWeight.w700,
        color: Theme.of(context).colorScheme.onSurface,
      ),
      dividerThickness: 0.6,
    );
  }
}

class _PaginationFooter extends StatelessWidget {
  final int total;
  final int offset;
  final int limit;
  final ValueChanged<int> onOffsetChanged;

  const _PaginationFooter({
    required this.total,
    required this.offset,
    required this.limit,
    required this.onOffsetChanged,
  });

  @override
  Widget build(BuildContext context) {
    final start = total == 0 ? 0 : offset + 1;
    final end = (offset + limit).clamp(0, total);
    final canPrev = offset > 0;
    final canNext = offset + limit < total;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text('$start–$end of $total', style: Theme.of(context).textTheme.bodySmall),
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: canPrev ? () => onOffsetChanged((offset - limit).clamp(0, total)) : null,
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: canNext ? () => onOffsetChanged(offset + limit) : null,
          ),
        ],
      ),
    );
  }
}
