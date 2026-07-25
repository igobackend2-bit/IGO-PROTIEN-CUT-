import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/permissions/permission_codes.dart';
import '../../../../core/permissions/permission_gate.dart';
import '../../../../core/widgets/confirm_dialog.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../categories_controller.dart';
import '../widgets/category_form_dialog.dart';

class CategoriesTab extends ConsumerWidget {
  const CategoriesTab({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesControllerProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: PermissionGate(
            permission: PermissionCodes.productsManage,
            child: FilledButton.icon(
              onPressed: () => showCategoryFormDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('New category'),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: categoriesAsync.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(
              message: e.toString(),
              onRetry: () => ref.read(categoriesControllerProvider.notifier).refresh(),
            ),
            data: (categories) {
              if (categories.isEmpty) return const EmptyStateView(message: 'No categories yet.');
              return ListView.separated(
                itemCount: categories.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final category = categories[index];
                  return ListTile(
                    leading: Text(category.emoji ?? '🏷️', style: const TextStyle(fontSize: 20)),
                    title: Text(category.name),
                    subtitle: Text('Order: ${category.displayOrder}'),
                    trailing: PermissionGate(
                      permission: PermissionCodes.productsManage,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Switch(
                            value: category.isActive,
                            onChanged: (v) =>
                                ref.read(categoriesControllerProvider.notifier).updateCategory(category.id, isActive: v),
                          ),
                          IconButton(
                            tooltip: 'Edit',
                            icon: const Icon(Icons.edit_outlined, size: 18),
                            onPressed: () => showCategoryFormDialog(context, existing: category),
                          ),
                          IconButton(
                            tooltip: 'Delete',
                            icon: const Icon(Icons.delete_outline, size: 18),
                            onPressed: () async {
                              final confirmed = await showConfirmDialog(
                                context,
                                title: 'Delete category?',
                                message: 'Delete "${category.name}"? This cannot be undone.',
                                confirmLabel: 'Delete',
                                destructive: true,
                              );
                              if (confirmed) {
                                await ref.read(categoriesControllerProvider.notifier).delete(category.id);
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
