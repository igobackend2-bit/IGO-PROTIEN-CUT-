import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/permissions/permission_codes.dart';
import '../../../../core/permissions/permission_gate.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/confirm_dialog.dart';
import '../../../../core/widgets/error_retry_view.dart';
import '../../../../core/widgets/loading_view.dart';
import '../../domain/order.dart';
import '../../domain/order_status.dart';
import '../../domain/orders_repository.dart';
import '../../domain/payment.dart';
import '../orders_providers.dart';

final orderDetailProvider = FutureProvider.autoDispose.family<OrderDetail, String>((ref, orderId) {
  return ref.watch(ordersRepositoryProvider).getDetail(orderId);
});

void showOrderDetailDialog(BuildContext context, String orderId, {VoidCallback? onChanged}) {
  showDialog(
    context: context,
    builder: (context) => _OrderDetailDialog(orderId: orderId, onChanged: onChanged),
  );
}

class _OrderDetailDialog extends ConsumerStatefulWidget {
  final String orderId;
  final VoidCallback? onChanged;

  const _OrderDetailDialog({required this.orderId, this.onChanged});

  @override
  ConsumerState<_OrderDetailDialog> createState() => _OrderDetailDialogState();
}

class _OrderDetailDialogState extends ConsumerState<_OrderDetailDialog> {
  bool _busy = false;

  Future<void> _run(Future<void> Function() action) async {
    setState(() => _busy = true);
    try {
      await action();
      ref.invalidate(orderDetailProvider(widget.orderId));
      widget.onChanged?.call();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final detailAsync = ref.watch(orderDetailProvider(widget.orderId));
    final repo = ref.read(ordersRepositoryProvider);

    return Dialog(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 620, maxHeight: 680),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: detailAsync.when(
            loading: () => const LoadingView(),
            error: (e, _) => ErrorRetryView(
              message: e.toString(),
              onRetry: () => ref.invalidate(orderDetailProvider(widget.orderId)),
            ),
            data: (detail) => _buildContent(context, detail, repo),
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, OrderDetail detail, OrdersRepository repo) {
    final order = detail.order;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text('Order #${order.id.substring(0, order.id.length.clamp(0, 8))}',
                  style: Theme.of(context).textTheme.titleLarge),
            ),
            _StatusBadge(status: order.status),
          ],
        ),
        const SizedBox(height: 4),
        Text(Formatters.dateTime(order.createdAt), style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 16),
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (order.address != null) ...[
                  Text('Delivery address', style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 4),
                  Text('${order.address!.fullName ?? ''} · ${order.address!.phone ?? ''}'),
                  Text(order.address!.oneLine, style: Theme.of(context).textTheme.bodySmall),
                  const SizedBox(height: 16),
                ],
                Text('Items', style: Theme.of(context).textTheme.titleSmall),
                const SizedBox(height: 4),
                ...order.items.map(
                  (item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        Expanded(child: Text(item.productName ?? 'Product')),
                        Text('× ${item.quantity}'),
                        const SizedBox(width: 12),
                        SizedBox(width: 80, child: Text(Formatters.currency(item.price * item.quantity), textAlign: TextAlign.right)),
                      ],
                    ),
                  ),
                ),
                const Divider(),
                _summaryRow('Delivery fee', order.deliveryFee),
                _summaryRow('Tax', order.taxAmount),
                _summaryRow('Discount', order.discountAmount == null ? null : -order.discountAmount!),
                _summaryRow('Total', order.totalPrice, bold: true),
                if (order.cancelReason != null) ...[
                  const SizedBox(height: 12),
                  Text('Cancel reason: ${order.cancelReason}', style: Theme.of(context).textTheme.bodySmall),
                ],
                if (detail.payments.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text('Payments', style: Theme.of(context).textTheme.titleSmall),
                  const SizedBox(height: 4),
                  ...detail.payments.map((payment) => _PaymentRow(
                        payment: payment,
                        busy: _busy,
                        onRefund: () => _run(() => repo.refund(paymentId: payment.id)),
                      )),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        PermissionGate(
          permission: PermissionCodes.ordersManage,
          child: _ActionBar(order: order, busy: _busy, run: _run, repo: repo),
        ),
      ],
    );
  }

  Widget _summaryRow(String label, num? value, {bool bold = false}) {
    if (value == null) return const SizedBox.shrink();
    final style = bold ? const TextStyle(fontWeight: FontWeight.w700) : null;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [Text(label, style: style), Text(Formatters.currency(value), style: style)],
      ),
    );
  }
}

class _PaymentRow extends StatelessWidget {
  final Payment payment;
  final bool busy;
  final VoidCallback onRefund;

  const _PaymentRow({required this.payment, required this.busy, required this.onRefund});

  @override
  Widget build(BuildContext context) {
    final canRefund = payment.status == 'Completed';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(child: Text('${payment.paymentMethod ?? 'Payment'} · ${payment.status}')),
          Text(Formatters.currency(payment.amount)),
          if (canRefund) ...[
            const SizedBox(width: 8),
            PermissionGate(
              permission: PermissionCodes.paymentsManage,
              child: TextButton(
                onPressed: busy
                    ? null
                    : () async {
                        final confirmed = await showConfirmDialog(
                          context,
                          title: 'Refund payment?',
                          message: 'Refund ${Formatters.currency(payment.amount)}?',
                          confirmLabel: 'Refund',
                          destructive: true,
                        );
                        if (confirmed) onRefund();
                      },
                child: const Text('Refund'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ActionBar extends StatelessWidget {
  final Order order;
  final bool busy;
  final Future<void> Function(Future<void> Function()) run;
  final OrdersRepository repo;

  const _ActionBar({required this.order, required this.busy, required this.run, required this.repo});

  @override
  Widget build(BuildContext context) {
    final buttons = <Widget>[];

    void add(String label, Future<void> Function() action, {bool destructive = false}) {
      buttons.add(
        destructive
            ? OutlinedButton(
                onPressed: busy ? null : () => run(action),
                style: OutlinedButton.styleFrom(foregroundColor: Theme.of(context).colorScheme.error),
                child: Text(label),
              )
            : FilledButton(onPressed: busy ? null : () => run(action), child: Text(label)),
      );
    }

    switch (order.status) {
      case OrderStatus.pending:
        add('Accept', () => repo.accept(order.id));
        add('Reject', () => repo.reject(order.id), destructive: true);
      case OrderStatus.accepted:
        add('Start packing', () => repo.pack(order.id));
        add('Cancel', () => repo.cancel(order.id), destructive: true);
      case OrderStatus.packing:
        add('Mark ready', () => repo.ready(order.id));
        add('Cancel', () => repo.cancel(order.id), destructive: true);
      case OrderStatus.ready:
        add('Assign delivery', () => repo.assignDelivery(order.id));
        add('Cancel', () => repo.cancel(order.id), destructive: true);
      default:
        break;
    }

    if (buttons.isEmpty) return const SizedBox.shrink();
    return Wrap(spacing: 8, runSpacing: 8, children: buttons);
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;

  const _StatusBadge({required this.status});

  Color _colorFor(String status) {
    switch (status) {
      case OrderStatus.delivered:
        return Colors.green;
      case OrderStatus.cancelled:
      case OrderStatus.refunded:
        return Colors.red;
      case OrderStatus.pending:
        return Colors.orange;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _colorFor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
      child: Text(status, style: TextStyle(color: color, fontWeight: FontWeight.w600)),
    );
  }
}
