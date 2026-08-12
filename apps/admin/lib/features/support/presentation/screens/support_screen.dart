import 'package:data_table_2/data_table_2.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/permissions/permission_codes.dart';
import '../../../../core/permissions/permission_gate.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/confirm_dialog.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../../core/widgets/paginated_table.dart';
import '../../domain/support_ticket.dart';
import '../faqs_controller.dart';
import '../tickets_list_controller.dart';
import '../widgets/faq_form_dialog.dart';
import '../widgets/ticket_detail_dialog.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> with SingleTickerProviderStateMixin {
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
        Text('Support', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: const [Tab(text: 'Tickets'), Tab(text: 'FAQs')],
        ),
        const SizedBox(height: 16),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: const [_TicketsTab(), _FaqsTab()],
          ),
        ),
      ],
    );
  }
}

class _TicketsTab extends ConsumerWidget {
  const _TicketsTab();

  static const _columns = [
    DataColumn2(label: Text('Customer'), size: ColumnSize.L),
    DataColumn2(label: Text('Category')),
    DataColumn2(label: Text('Status')),
    DataColumn2(label: Text('Updated')),
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(ticketsFilterProvider);
    final resultAsync = ref.watch(ticketsListControllerProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: DropdownMenu<String?>(
            hintText: 'Status',
            initialSelection: filter.status,
            dropdownMenuEntries: [
              const DropdownMenuEntry(value: null, label: 'All statuses'),
              for (final s in TicketStatus.all) DropdownMenuEntry(value: s, label: s),
            ],
            onSelected: (v) => ref.read(ticketsFilterProvider.notifier).setStatus(v),
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: resultAsync.when(
            loading: () => PaginatedTable<SupportTicket>(
              columns: _columns,
              items: const [],
              rowBuilder: (_) => const DataRow2(cells: []),
              total: 0,
              offset: filter.offset,
              limit: filter.limit,
              onOffsetChanged: (_) {},
              isLoading: true,
            ),
            error: (e, _) => PaginatedTable<SupportTicket>(
              columns: _columns,
              items: const [],
              rowBuilder: (_) => const DataRow2(cells: []),
              total: 0,
              offset: filter.offset,
              limit: filter.limit,
              onOffsetChanged: (_) {},
              errorMessage: e.toString(),
              onRetry: () => ref.read(ticketsListControllerProvider.notifier).refresh(),
            ),
            data: (result) => PaginatedTable<SupportTicket>(
              columns: _columns,
              items: result.tickets,
              total: result.total,
              offset: filter.offset,
              limit: filter.limit,
              onOffsetChanged: (v) => ref.read(ticketsFilterProvider.notifier).setOffset(v),
              emptyMessage: 'No support tickets.',
              rowBuilder: (ticket) => DataRow2(
                onTap: () => showTicketDetailDialog(
                  context,
                  ticket.id,
                  onChanged: () => ref.read(ticketsListControllerProvider.notifier).refresh(),
                ),
                cells: [
                  DataCell(Text(ticket.customerName ?? 'Customer')),
                  DataCell(Text(ticket.category ?? '—')),
                  DataCell(Text(ticket.status)),
                  DataCell(Text(Formatters.dateTime(ticket.updatedAt))),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _FaqsTab extends ConsumerWidget {
  const _FaqsTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final faqsAsync = ref.watch(faqsControllerProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Align(
          alignment: Alignment.centerRight,
          child: PermissionGate(
            permission: PermissionCodes.supportManage,
            child: FilledButton.icon(
              onPressed: () => showFaqFormDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('New FAQ'),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: faqsAsync.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(
              message: e.toString(),
              onRetry: () => ref.read(faqsControllerProvider.notifier).refresh(),
            ),
            data: (faqs) {
              if (faqs.isEmpty) return const EmptyStateView(message: 'No FAQs yet.');
              return ListView.separated(
                itemCount: faqs.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final faq = faqs[index];
                  return ListTile(
                    title: Text(faq.question),
                    subtitle: Text('${faq.category} · ${faq.answer}', maxLines: 2, overflow: TextOverflow.ellipsis),
                    trailing: PermissionGate(
                      permission: PermissionCodes.supportManage,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            tooltip: 'Edit',
                            icon: const Icon(Icons.edit_outlined, size: 18),
                            onPressed: () => showFaqFormDialog(context, existing: faq),
                          ),
                          IconButton(
                            tooltip: 'Delete',
                            icon: const Icon(Icons.delete_outline, size: 18),
                            onPressed: () async {
                              final confirmed = await showConfirmDialog(
                                context,
                                title: 'Delete FAQ?',
                                message: 'Delete "${faq.question}"?',
                                confirmLabel: 'Delete',
                                destructive: true,
                              );
                              if (confirmed) await ref.read(faqsControllerProvider.notifier).delete(faq.id);
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
