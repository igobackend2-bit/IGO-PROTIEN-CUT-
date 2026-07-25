import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/responsive.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../../../core/widgets/stat_card.dart';
import '../dashboard_controller.dart';
import '../widgets/recent_activity_list.dart';
import '../widgets/sales_trend_chart.dart';
import '../widgets/top_entries_bar_chart.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync = ref.watch(dashboardControllerProvider);
    final period = ref.watch(dashboardPeriodProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text('Dashboard', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
            ),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'daily', label: Text('Daily')),
                ButtonSegment(value: 'weekly', label: Text('Weekly')),
                ButtonSegment(value: 'monthly', label: Text('Monthly')),
              ],
              selected: {period},
              onSelectionChanged: (s) => ref.read(dashboardPeriodProvider.notifier).state = s.first,
            ),
            IconButton(
              tooltip: 'Refresh',
              icon: const Icon(Icons.refresh),
              onPressed: () => ref.read(dashboardControllerProvider.notifier).refresh(),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Expanded(
          child: summaryAsync.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(
              message: e.toString(),
              onRetry: () => ref.read(dashboardControllerProvider.notifier).refresh(),
            ),
            data: (summary) => SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: Responsive.statColumns(context),
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 1.9,
                    children: [
                      StatCard(
                        label: 'Revenue (${summary.period})',
                        value: Formatters.currency(summary.revenue),
                        icon: Icons.payments_outlined,
                        accent: statColor(0),
                      ),
                      StatCard(
                        label: 'Orders (${summary.period})',
                        value: Formatters.compactNumber(summary.orderCount),
                        icon: Icons.receipt_long_outlined,
                        accent: statColor(1),
                      ),
                      StatCard(
                        label: 'Customers',
                        value: Formatters.compactNumber(summary.totalCustomers),
                        icon: Icons.people_outline,
                        trend: '${summary.newCustomers} new',
                        accent: statColor(2),
                      ),
                      StatCard(
                        label: 'Products',
                        value: Formatters.compactNumber(summary.totalProducts),
                        icon: Icons.inventory_2_outlined,
                        accent: statColor(3),
                      ),
                      StatCard(
                        label: 'Low Stock',
                        value: Formatters.compactNumber(summary.lowStockCount),
                        icon: Icons.warning_amber_outlined,
                        accent: statColor(4),
                      ),
                      StatCard(
                        label: 'Pending Deliveries',
                        value: Formatters.compactNumber(summary.pendingDeliveries),
                        icon: Icons.local_shipping_outlined,
                        accent: statColor(5),
                      ),
                      StatCard(
                        label: 'Open Tickets',
                        value: Formatters.compactNumber(summary.openTickets),
                        icon: Icons.support_agent_outlined,
                        accent: statColor(6),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Sales trend (last 30 days)', style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(height: 16),
                          SizedBox(height: 260, child: SalesTrendChart(data: summary.salesTrend)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final stacked = constraints.maxWidth < 900;
                      final topProducts = Card(
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
                      final topCategories = Card(
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
                        return Column(children: [topProducts, const SizedBox(height: 16), topCategories]);
                      }
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(child: topProducts),
                          const SizedBox(width: 16),
                          Expanded(child: topCategories),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Recent activity', style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(height: 8),
                          RecentActivityList(orders: summary.recentOrders),
                        ],
                      ),
                    ),
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
