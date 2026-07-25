import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../products/domain/product.dart';
import '../../domain/inventory_history_entry.dart';
import '../inventory_providers.dart';

void showInventoryHistoryDialog(BuildContext context, Product product) {
  showDialog(
    context: context,
    builder: (context) => _InventoryHistoryDialog(product: product),
  );
}

final _historyProvider = FutureProvider.autoDispose.family<List<InventoryHistoryEntry>, String>((ref, productId) {
  return ref.watch(inventoryRepositoryProvider).history(productId: productId);
});

class _InventoryHistoryDialog extends ConsumerWidget {
  final Product product;

  const _InventoryHistoryDialog({required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(_historyProvider(product.id));

    return Dialog(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520, maxHeight: 520),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Stock history — ${product.name}', style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
              Expanded(
                child: historyAsync.when(
                  loading: () => const LoadingView(),
                  error: (e, _) => ErrorRetryView(
                    message: e.toString(),
                    onRetry: () => ref.invalidate(_historyProvider(product.id)),
                  ),
                  data: (entries) {
                    if (entries.isEmpty) return const EmptyStateView(message: 'No stock movements yet.');
                    return ListView.separated(
                      itemCount: entries.length,
                      separatorBuilder: (context, index) => const Divider(height: 1),
                      itemBuilder: (context, index) {
                        final entry = entries[index];
                        final positive = entry.quantityChange >= 0;
                        return ListTile(
                          dense: true,
                          contentPadding: EdgeInsets.zero,
                          leading: Icon(
                            positive ? Icons.add_circle_outline : Icons.remove_circle_outline,
                            color: positive ? Colors.green : Colors.red,
                          ),
                          title: Text('${entry.changeType} · ${positive ? '+' : ''}${entry.quantityChange}'),
                          subtitle: Text(
                            '${entry.reason?.isNotEmpty == true ? entry.reason : 'No reason given'} · ${Formatters.dateTime(entry.createdAt)}',
                          ),
                          trailing: Text('→ ${entry.resultingStock}'),
                        );
                      },
                    );
                  },
                ),
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Close')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
