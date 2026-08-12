import 'package:data_table_2/data_table_2.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/permissions/permission_codes.dart';
import '../../../../core/permissions/permission_gate.dart';
import '../../../../core/utils/debouncer.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/confirm_dialog.dart';
import '../../../../core/widgets/paginated_table.dart';
import '../../../../core/widgets/search_filter_bar.dart';
import '../../domain/product.dart';
import '../categories_controller.dart';
import '../products_list_controller.dart';
import '../products_providers.dart';
import '../widgets/product_form_dialog.dart';
import 'categories_tab.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> with SingleTickerProviderStateMixin {
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
        Row(
          children: [
            Expanded(
              child: Text('Products', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
            ),
          ],
        ),
        const SizedBox(height: 12),
        TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: const [Tab(text: 'Products'), Tab(text: 'Categories')],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: const [_ProductsTab(), CategoriesTab()],
          ),
        ),
      ],
    );
  }
}

class _ProductsTab extends ConsumerStatefulWidget {
  const _ProductsTab();

  @override
  ConsumerState<_ProductsTab> createState() => _ProductsTabState();
}

class _ProductsTabState extends ConsumerState<_ProductsTab> {
  final _debouncer = Debouncer();

  @override
  void dispose() {
    _debouncer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filter = ref.watch(productsFilterProvider);
    final resultAsync = ref.watch(productsListControllerProvider);
    final categories = ref.watch(categoriesControllerProvider).value ?? const [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SearchFilterBar(
          hintText: 'Search products…',
          onSearchChanged: (v) => _debouncer.run(() => ref.read(productsFilterProvider.notifier).setSearch(v)),
          filters: [
            DropdownMenu<String?>(
              hintText: 'Category',
              initialSelection: filter.category,
              dropdownMenuEntries: [
                const DropdownMenuEntry(value: null, label: 'All categories'),
                for (final c in categories) DropdownMenuEntry(value: c.name, label: c.name),
              ],
              onSelected: (v) => ref.read(productsFilterProvider.notifier).setCategory(v),
            ),
            DropdownMenu<bool?>(
              hintText: 'Status',
              initialSelection: filter.isAvailable,
              dropdownMenuEntries: const [
                DropdownMenuEntry(value: null, label: 'All statuses'),
                DropdownMenuEntry(value: true, label: 'Published'),
                DropdownMenuEntry(value: false, label: 'Unpublished'),
              ],
              onSelected: (v) => ref.read(productsFilterProvider.notifier).setAvailability(v),
            ),
          ],
          actions: [
            PermissionGate(
              permission: PermissionCodes.productsManage,
              child: FilledButton.icon(
                onPressed: () async {
                  final created = await showProductFormDialog(context);
                  if (created == true) ref.read(productsListControllerProvider.notifier).refresh();
                },
                icon: const Icon(Icons.add),
                label: const Text('New product'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: resultAsync.when(
            loading: () => PaginatedTable<Product>(
              columns: _columns,
              items: const [],
              rowBuilder: (_) => const DataRow2(cells: []),
              total: 0,
              offset: filter.offset,
              limit: filter.limit,
              onOffsetChanged: (_) {},
              isLoading: true,
            ),
            error: (e, _) => PaginatedTable<Product>(
              columns: _columns,
              items: const [],
              rowBuilder: (_) => const DataRow2(cells: []),
              total: 0,
              offset: filter.offset,
              limit: filter.limit,
              onOffsetChanged: (_) {},
              errorMessage: e.toString(),
              onRetry: () => ref.read(productsListControllerProvider.notifier).refresh(),
            ),
            data: (result) => PaginatedTable<Product>(
              columns: _columns,
              items: result.products,
              total: result.total,
              offset: filter.offset,
              limit: filter.limit,
              onOffsetChanged: (v) => ref.read(productsFilterProvider.notifier).setOffset(v),
              emptyMessage: 'No products match your filters.',
              rowBuilder: (product) => _productRow(context, ref, product),
            ),
          ),
        ),
      ],
    );
  }

  static const _columns = [
    DataColumn2(label: Text('Name'), size: ColumnSize.L),
    DataColumn2(label: Text('Category')),
    DataColumn2(label: Text('Price'), numeric: true),
    DataColumn2(label: Text('Stock'), numeric: true),
    DataColumn2(label: Text('Status')),
    DataColumn2(label: Text('Actions'), size: ColumnSize.L),
  ];

  DataRow2 _productRow(BuildContext context, WidgetRef ref, Product product) {
    return DataRow2(
      cells: [
        DataCell(Text(product.name, overflow: TextOverflow.ellipsis)),
        DataCell(Text(product.category ?? '—')),
        DataCell(Text(Formatters.currency(product.price))),
        DataCell(Text(product.stockQuantity.toString())),
        DataCell(_StatusChip(isAvailable: product.isAvailable)),
        DataCell(
          PermissionGate(
            permission: PermissionCodes.productsManage,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  tooltip: 'Edit',
                  icon: const Icon(Icons.edit_outlined, size: 18),
                  onPressed: () async {
                    final saved = await showProductFormDialog(context, existing: product);
                    if (saved == true) ref.read(productsListControllerProvider.notifier).refresh();
                  },
                ),
                IconButton(
                  tooltip: product.isAvailable ? 'Unpublish' : 'Publish',
                  icon: Icon(product.isAvailable ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 18),
                  onPressed: () async {
                    await ref.read(productsRepositoryProvider).setPublished(product.id, !product.isAvailable);
                    ref.read(productsListControllerProvider.notifier).refresh();
                  },
                ),
                IconButton(
                  tooltip: 'Delete',
                  icon: const Icon(Icons.delete_outline, size: 18),
                  onPressed: () async {
                    final confirmed = await showConfirmDialog(
                      context,
                      title: 'Delete product?',
                      message: 'This permanently deletes "${product.name}". This cannot be undone.',
                      confirmLabel: 'Delete',
                      destructive: true,
                    );
                    if (confirmed) {
                      await ref.read(productsRepositoryProvider).delete(product.id);
                      ref.read(productsListControllerProvider.notifier).refresh();
                    }
                  },
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _StatusChip extends StatelessWidget {
  final bool isAvailable;

  const _StatusChip({required this.isAvailable});

  @override
  Widget build(BuildContext context) {
    final Color color = isAvailable ? Colors.green.shade700 : Colors.grey.shade700;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
      child: Text(
        isAvailable ? 'Published' : 'Unpublished',
        style: TextStyle(color: color, fontSize: 12),
      ),
    );
  }
}
