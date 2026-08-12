import 'package:data_table_2/data_table_2.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/permissions/permission_codes.dart';
import '../../../../core/permissions/permission_gate.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../../core/widgets/paginated_table.dart';
import '../../domain/delivery_assignment.dart';
import '../assignments_list_controller.dart';
import '../partners_controller.dart';
import '../widgets/live_status_dialog.dart';
import '../widgets/partner_form_dialog.dart';
import '../widgets/reassign_dialog.dart';

class DeliveryScreen extends StatefulWidget {
  const DeliveryScreen({super.key});

  @override
  State<DeliveryScreen> createState() => _DeliveryScreenState();
}

class _DeliveryScreenState extends State<DeliveryScreen> with SingleTickerProviderStateMixin {
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
        Text('Delivery', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: const [Tab(text: 'Assignments'), Tab(text: 'Partners')],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: const [_AssignmentsTab(), _PartnersTab()],
          ),
        ),
      ],
    );
  }
}

class _AssignmentsTab extends ConsumerWidget {
  const _AssignmentsTab();

  static const _columns = [
    DataColumn2(label: Text('Order')),
    DataColumn2(label: Text('Partner'), size: ColumnSize.L),
    DataColumn2(label: Text('Status')),
    DataColumn2(label: Text('Assigned')),
    DataColumn2(label: Text('ETA (min)'), numeric: true),
    DataColumn2(label: Text('Actions'), size: ColumnSize.L),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(assignmentsFilterProvider);
    final resultAsync = ref.watch(assignmentsListControllerProvider);

    return resultAsync.when(
      loading: () => PaginatedTable<DeliveryAssignment>(
        columns: _columns,
        items: const [],
        rowBuilder: (_) => const DataRow2(cells: []),
        total: 0,
        offset: filter.offset,
        limit: filter.limit,
        onOffsetChanged: (_) {},
        isLoading: true,
      ),
      error: (e, _) => PaginatedTable<DeliveryAssignment>(
        columns: _columns,
        items: const [],
        rowBuilder: (_) => const DataRow2(cells: []),
        total: 0,
        offset: filter.offset,
        limit: filter.limit,
        onOffsetChanged: (_) {},
        errorMessage: e.toString(),
        onRetry: () => ref.read(assignmentsListControllerProvider.notifier).refresh(),
      ),
      data: (result) => PaginatedTable<DeliveryAssignment>(
        columns: _columns,
        items: result.assignments,
        total: result.total,
        offset: filter.offset,
        limit: filter.limit,
        onOffsetChanged: (v) => ref.read(assignmentsFilterProvider.notifier).setOffset(v),
        emptyMessage: 'No delivery assignments yet.',
        rowBuilder: (assignment) {
          final orderRef = assignment.orderId ?? assignment.id;
          final shortRef = orderRef.substring(0, orderRef.length.clamp(0, 8));
          return DataRow2(
            cells: [
              DataCell(Text('#$shortRef')),
              DataCell(Text(assignment.partner?.name ?? '—')),
              DataCell(Text(assignment.status)),
              DataCell(Text(Formatters.dateTime(assignment.assignedAt))),
              DataCell(Text(assignment.etaMinutes?.toString() ?? '—')),
              DataCell(
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextButton(
                      onPressed: () => showLiveStatusDialog(context, assignment.id),
                      child: const Text('Live status'),
                    ),
                    PermissionGate(
                      permission: PermissionCodes.deliveryManage,
                      child: TextButton(
                        onPressed: () async {
                          final changed = await showReassignDialog(context, assignment);
                          if (changed == true) ref.read(assignmentsListControllerProvider.notifier).refresh();
                        },
                        child: const Text('Reassign'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _PartnersTab extends ConsumerWidget {
  const _PartnersTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final partnersAsync = ref.watch(partnersControllerProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: PermissionGate(
            permission: PermissionCodes.deliveryManage,
            child: FilledButton.icon(
              onPressed: () => showPartnerFormDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('New partner'),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: partnersAsync.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(
              message: e.toString(),
              onRetry: () => ref.read(partnersControllerProvider.notifier).refresh(),
            ),
            data: (partners) {
              if (partners.isEmpty) return const EmptyStateView(message: 'No delivery partners yet.');
              return ListView.separated(
                itemCount: partners.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final partner = partners[index];
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundImage: partner.photoUrl != null ? NetworkImage(partner.photoUrl!) : null,
                      child: partner.photoUrl == null ? const Icon(Icons.local_shipping_outlined) : null,
                    ),
                    title: Text(partner.name),
                    subtitle: Text(
                      '${partner.phone} · ${partner.vehicleType ?? ''} ${partner.vehicleNumber ?? ''} · ★ ${partner.rating}',
                    ),
                    trailing: PermissionGate(
                      permission: PermissionCodes.deliveryManage,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Switch(
                            value: partner.isActive,
                            onChanged: (_) => ref.read(partnersControllerProvider.notifier).toggleActive(partner),
                          ),
                          IconButton(
                            tooltip: 'Edit',
                            icon: const Icon(Icons.edit_outlined, size: 18),
                            onPressed: () => showPartnerFormDialog(context, existing: partner),
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
