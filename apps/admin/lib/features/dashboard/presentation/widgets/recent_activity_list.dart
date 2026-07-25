import 'package:flutter/material.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/empty_state_view.dart';
import '../../domain/dashboard_summary.dart';

/// Most recent orders, standing in for a dedicated activity feed — there's
/// no `admin-activity` endpoint, and orders are the most representative
/// "what just happened" signal available from existing endpoints.
class RecentActivityList extends StatelessWidget {
  final List<RecentOrderEntry> orders;

  const RecentActivityList({super.key, required this.orders});

  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) {
      return const EmptyStateView(message: 'No recent orders.');
    }
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: orders.length,
      separatorBuilder: (context, index) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final order = orders[index];
        return ListTile(
          dense: true,
          contentPadding: EdgeInsets.zero,
          leading: CircleAvatar(
            radius: 16,
            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
            child: const Icon(Icons.receipt_long, size: 16),
          ),
          title: Text('Order #${order.id.substring(0, order.id.length.clamp(0, 8))}'),
          subtitle: Text('${order.status} · ${Formatters.dateTime(order.createdAt)}'),
          trailing: Text(Formatters.currency(order.totalPrice)),
        );
      },
    );
  }
}
