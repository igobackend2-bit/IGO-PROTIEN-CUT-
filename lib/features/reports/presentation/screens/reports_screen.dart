import 'package:data_table_2/data_table_2.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/csv_download_web.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../domain/report_result.dart';
import '../reports_providers.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> {
  String _reportType = ReportType.sales;
  DateTime _dateFrom = DateTime.now().subtract(const Duration(days: 30));
  DateTime _dateTo = DateTime.now();
  bool _downloadingCsv = false;

  Future<void> _pickDate({required bool isFrom}) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isFrom ? _dateFrom : _dateTo,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() => isFrom ? _dateFrom = picked : _dateTo = picked);
    }
  }

  void _generate() {
    ref.read(reportsControllerProvider.notifier).generate(
          reportType: _reportType,
          dateFrom: _dateFrom,
          dateTo: _dateTo,
        );
  }

  Future<void> _downloadCsv() async {
    setState(() => _downloadingCsv = true);
    try {
      final csv = await ref.read(reportsRepositoryProvider).generateCsv(
            reportType: _reportType,
            dateFrom: _dateFrom,
            dateTo: _dateTo,
          );
      downloadCsv(csv, '${_reportType}_report_${DateTime.now().millisecondsSinceEpoch}.csv');
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _downloadingCsv = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final resultAsync = ref.watch(reportsControllerProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Reports', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                SizedBox(
                  width: 200,
                  child: DropdownButtonFormField<String>(
                    initialValue: _reportType,
                    decoration: const InputDecoration(labelText: 'Report type'),
                    items: [
                      for (final t in ReportType.all) DropdownMenuItem(value: t, child: Text(ReportType.label(t))),
                    ],
                    onChanged: (v) => setState(() => _reportType = v ?? ReportType.sales),
                  ),
                ),
                OutlinedButton.icon(
                  onPressed: () => _pickDate(isFrom: true),
                  icon: const Icon(Icons.calendar_today_outlined, size: 16),
                  label: Text('From: ${Formatters.date(_dateFrom)}'),
                ),
                OutlinedButton.icon(
                  onPressed: () => _pickDate(isFrom: false),
                  icon: const Icon(Icons.calendar_today_outlined, size: 16),
                  label: Text('To: ${Formatters.date(_dateTo)}'),
                ),
                FilledButton.icon(
                  onPressed: _generate,
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Generate'),
                ),
                OutlinedButton.icon(
                  onPressed: _downloadingCsv ? null : _downloadCsv,
                  icon: _downloadingCsv
                      ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.download_outlined),
                  label: const Text('Download CSV'),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Expanded(
          child: resultAsync.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(message: e.toString(), onRetry: _generate),
            data: (result) {
              if (result == null) {
                return const EmptyStateView(
                  message: 'Choose a report type and date range, then Generate.',
                  icon: Icons.summarize_outlined,
                );
              }
              if (result.rows.isEmpty) {
                return const EmptyStateView(message: 'No data for this range.');
              }
              return DataTable2(
                minWidth: 900,
                isVerticalScrollBarVisible: true,
                columns: [for (final c in result.columns) DataColumn2(label: Text(c))],
                rows: [
                  for (final row in result.rows)
                    DataRow2(cells: [for (final c in result.columns) DataCell(Text(row[c]?.toString() ?? '—'))]),
                ],
              );
            },
          ),
        ),
      ],
    );
  }
}
