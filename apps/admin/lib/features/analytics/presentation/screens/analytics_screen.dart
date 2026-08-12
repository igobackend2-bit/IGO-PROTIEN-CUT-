import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/responsive.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../../core/widgets/stat_card.dart';
import '../../../dashboard/presentation/widgets/top_entries_bar_chart.dart';
import '../analytics_controller.dart';

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final period = ref.watch(analyticsPeriodProvider);
    final summaryAsync = ref.watch(analyticsControllerProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text('Analytics', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
            ),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'daily', label: Text('Daily')),
                ButtonSegment(value: 'weekly', label: Text('Weekly')),
                ButtonSegment(value: 'monthly', label: Text('Monthly')),
              ],
              selected: {period},
              onSelectionChanged: (s) => ref.read(analyticsPeriodProvider.notifier).state = s.first,
            ),
            IconButton(
              tooltip: 'Force refresh (bypass cache)',
              icon: const Icon(Icons.refresh),
              onPressed: () => ref.read(analyticsControllerProvider.notifier).refresh(forceRefresh: true),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Expanded(
          child: summaryAsync.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(
              message: e.toString(),
              onRetry: () => ref.read(analyticsControllerProvider.notifier).refresh(),
            ),
            data: (summary) => SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (summary.cached)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        'Showing cached results for this period.',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(fontStyle: FontStyle.italic),
                      ),
                    ),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: Responsive.statColumns(context),
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 1.9,
                    children: [
                      StatCard(label: 'Revenue', value: Formatters.currency(summary.revenue), icon: Icons.payments_outlined),
                      StatCard(label: 'Orders', value: Formatters.compactNumber(summary.orderCount), icon: Icons.receipt_long_outlined),
                      StatCard(
                        label: 'Active customers',
                        value: Formatters.compactNumber(summary.activeCustomers),
                        icon: Icons.people_outline,
                      ),
                      StatCard(
                        label: 'New customers',
                        value: Formatters.compactNumber(summary.newCustomers),
                        icon: Icons.person_add_alt_outlined,
                      ),
                      StatCard(
                        label: 'Refunds',
                        value: Formatters.compactNumber(summary.refundCount),
                        icon: Icons.replay_outlined,
                        accent: Colors.redAccent,
                        trend: Formatters.currency(summary.refundAmount),
                      ),
                      StatCard(
                        label: 'Active subscriptions',
                        value: Formatters.compactNumber(summary.activeSubscriptions),
                        icon: Icons.autorenew,
                        trend: '${summary.newSubscriptions} new',
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final stacked = constraints.maxWidth < 900;
                      final products = Card(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Top products', style: Theme.of(context).textTheme.titleMedium),
                              const SizedBox(height: 16),
                              SizedBox(
                                height: 240,
                                child: TopEntriesBarChart(
                                  labels: summary.topProducts.map((e) => e.name).toList(),
                                  values: summary.topProducts.map((e) => e.revenue).toList(),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                      final categories = Card(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Top categories', style: Theme.of(context).textTheme.titleMedium),
                              const SizedBox(height: 16),
                              SizedBox(
                                height: 240,
                                child: TopEntriesBarChart(
                                  labels: summary.topCategories.map((e) => e.category).toList(),
                                  values: summary.topCategories.map((e) => e.revenue).toList(),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                      if (stacked) {
                        return Column(children: [products, const SizedBox(height: 16), categories]);
                      }
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [Expanded(child: products), const SizedBox(width: 16), Expanded(child: categories)],
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
