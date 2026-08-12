import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/permissions/permission_codes.dart';
import '../../../../core/permissions/permission_gate.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../products/domain/product.dart';
import '../inventory_providers.dart';
import '../widgets/inventory_history_dialog.dart';
import '../widgets/stock_adjustment_dialog.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Inventory', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: const [Tab(text: 'Low stock'), Tab(text: 'Out of stock')],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: const [_StockList(kind: _StockKind.low), _StockList(kind: _StockKind.out)],
          ),
        ),
      ],
    );
  }
}

enum _StockKind { low, out }

class _StockList extends ConsumerWidget {
  final _StockKind kind;

  const _StockList({required this.kind});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLow = kind == _StockKind.low;
    final async = isLow ? ref.watch(lowStockControllerProvider) : ref.watch(outOfStockControllerProvider);

    return async.when(
      loading: () => const LoadingView(),
      error: (e, _) => ErrorRetryView(
        message: e.toString(),
        onRetry: () => isLow
            ? ref.read(lowStockControllerProvider.notifier).refresh()
            : ref.read(outOfStockControllerProvider.notifier).refresh(),
      ),
      data: (products) {
        if (products.isEmpty) {
          return EmptyStateView(message: isLow ? 'No low-stock products.' : 'No out-of-stock products.');
        }
        return ListView.separated(
          itemCount: products.length,
          separatorBuilder: (context, index) => const Divider(height: 1),
          itemBuilder: (context, index) => _StockRow(product: products[index], kind: kind),
        );
      },
    );
  }
}

class _StockRow extends ConsumerWidget {
  final Product product;
  final _StockKind kind;

  const _StockRow({required this.product, required this.kind});

  void _refresh(WidgetRef ref) {
    ref.read(lowStockControllerProvider.notifier).refresh();
    ref.read(outOfStockControllerProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scheme = Theme.of(context).colorScheme;
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: (kind == _StockKind.out ? Colors.red : Colors.orange).withValues(alpha: 0.12),
        child: Icon(
          kind == _StockKind.out ? Icons.remove_shopping_cart_outlined : Icons.warning_amber_outlined,
          color: kind == _StockKind.out ? Colors.red : Colors.orange,
        ),
      ),
      title: Text(product.name),
      subtitle: Text(
        'Stock: ${product.stockQuantity} · Threshold: ${product.lowStockThreshold}'
        '${product.category != null ? ' · ${product.category}' : ''}',
      ),
      trailing: PermissionGate(
        permission: PermissionCodes.inventoryManage,
        fallback: TextButton(
          onPressed: () => showInventoryHistoryDialog(context, product),
          child: const Text('History'),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextButton(
              onPressed: () => showInventoryHistoryDialog(context, product),
              child: const Text('History'),
            ),
            const SizedBox(width: 8),
            FilledButton.tonal(
              onPressed: () async {
                final changed = await showStockAdjustmentDialog(context, product);
                if (changed == true) _refresh(ref);
              },
              style: FilledButton.styleFrom(backgroundColor: scheme.primaryContainer),
              child: const Text('Adjust'),
            ),
          ],
        ),
      ),
    );
  }
}
