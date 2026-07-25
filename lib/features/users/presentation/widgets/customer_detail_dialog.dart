import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../domain/users_repository.dart';
import '../users_providers.dart';

final _customerDetailProvider = FutureProvider.autoDispose.family<CustomerDetail, String>((ref, userId) {
  return ref.watch(usersRepositoryProvider).getDetail(userId);
});

void showCustomerDetailDialog(BuildContext context, String userId) {
  showDialog(context: context, builder: (context) => _CustomerDetailDialog(userId: userId));
}

class _CustomerDetailDialog extends ConsumerWidget {
  final String userId;

  const _CustomerDetailDialog({required this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(_customerDetailProvider(userId));

    return Dialog(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 560, maxHeight: 620),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: async.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(
              message: e.toString(),
              onRetry: () => ref.invalidate(_customerDetailProvider(userId)),
            ),
            data: (detail) => _buildContent(context, detail),
          ),
        ),
      ),
    );
  }

  String _initial(String? name) {
    if (name == null || name.trim().isEmpty) return '?';
    return name.trim().substring(0, 1).toUpperCase();
  }

  Widget _buildContent(BuildContext context, CustomerDetail detail) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            CircleAvatar(child: Text(_initial(detail.profile.fullName))),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(detail.profile.fullName ?? 'Unnamed customer', style: Theme.of(context).textTheme.titleLarge),
                  Text(detail.email ?? detail.profile.phoneNumber ?? '—', style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(child: _stat(context, 'Orders', detail.orderCount.toString())),
            Expanded(child: _stat(context, 'Total spent', Formatters.currency(detail.totalSpent))),
            Expanded(child: _stat(context, 'Joined', Formatters.date(detail.profile.createdAt))),
          ],
        ),
        const SizedBox(height: 20),
        Expanded(
          child: DefaultTabController(
            length: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const TabBar(tabs: [Tab(text: 'Orders'), Tab(text: 'Rewards'), Tab(text: 'Subscriptions')]),
                Expanded(
                  child: TabBarView(
                    children: [
                      _ordersTab(context, detail),
                      const _UnavailableTab(message: 'Rewards data is not exposed by admin-users yet.'),
                      const _UnavailableTab(message: 'Subscriptions data is not exposed by admin-users yet.'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        Align(
          alignment: Alignment.centerRight,
          child: TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Close')),
        ),
      ],
    );
  }

  Widget _ordersTab(BuildContext context, CustomerDetail detail) {
    if (detail.recentOrders.isEmpty) {
      return const Center(child: Text('No orders yet.'));
    }
    return ListView.separated(
      itemCount: detail.recentOrders.length,
      separatorBuilder: (context, index) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final order = detail.recentOrders[index];
        return ListTile(
          dense: true,
          contentPadding: EdgeInsets.zero,
          title: Text('Order #${order.id.substring(0, order.id.length.clamp(0, 8))}'),
          subtitle: Text('${order.status} · ${Formatters.dateTime(order.createdAt)}'),
          trailing: Text(Formatters.currency(order.totalPrice)),
        );
      },
    );
  }

  Widget _stat(BuildContext context, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}

class _UnavailableTab extends StatelessWidget {
  final String message;

  const _UnavailableTab({required this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text(message, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
      ),
    );
  }
}
