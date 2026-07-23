import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../models/payment_model.dart';
import '../../../../utils/app_colors.dart';
import '../../../../utils/id_format.dart';
import '../../../orders/presentation/screens/order_detail_screen.dart';
import '../providers/payment_providers.dart';
import '../widgets/payment_status_badge.dart';
import '../widgets/refund_timeline.dart';

class PaymentDetailScreen extends ConsumerWidget {
  final Payment payment;
  const PaymentDetailScreen({super.key, required this.payment});

  Future<void> _handleRetry(BuildContext context, WidgetRef ref) async {
    await ref.read(paymentDetailProvider(payment).notifier).retry();
    final result = ref.read(paymentDetailProvider(payment));
    if (!context.mounted) return;
    result.when(
      data: (p) => ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Retry submitted — status: ${p.status.label}', style: GoogleFonts.outfit()), behavior: SnackBarBehavior.floating),
      ),
      loading: () {},
      error: (_, __) => ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Retry failed. Please try again.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      ),
    );
  }

  Future<void> _handleRequestRefund(BuildContext context, WidgetRef ref) async {
    final controller = TextEditingController();
    final reason = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Request Refund', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: TextField(
          controller: controller,
          maxLines: 3,
          decoration: const InputDecoration(hintText: 'Reason for refund...'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, controller.text.trim().isEmpty ? 'Not specified' : controller.text.trim()),
            child: const Text('Submit'),
          ),
        ],
      ),
    );
    if (reason == null || !context.mounted) return;
    await ref.read(paymentDetailProvider(payment).notifier).requestRefund(reason: reason, amount: payment.amount);
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Refund requested.', style: GoogleFonts.outfit()), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(paymentDetailProvider(payment));
    final current = state.value ?? payment;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Payment Details', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Transaction Details', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800)),
                    PaymentStatusBadge(status: current.status),
                  ],
                ),
                const SizedBox(height: 14),
                _row('Transaction ID', current.transactionId ?? '—'),
                _row('Amount', '₹${current.amount.toStringAsFixed(0)}'),
                _row('Payment Method', current.paymentMethod),
                _row('Timestamp', DateFormat('dd MMM yyyy, hh:mm a').format(current.createdAt)),
                if (current.gatewayReference != null) _row('Gateway Reference', current.gatewayReference!),
              ],
            ),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: payment.orderId))),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
              child: Row(
                children: [
                  const Icon(Icons.receipt_long_rounded, color: AppColors.primary, size: 20),
                  const SizedBox(width: 12),
                  Expanded(child: Text('View Order #${shortId(current.orderId)}', style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w700))),
                  const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textHint),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          RefundTimeline(payment: current),
          const SizedBox(height: 20),
          if (current.isRetryable)
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: state.isLoading ? null : () => _handleRetry(context, ref),
                icon: const Icon(Icons.refresh_rounded),
                label: Text('Retry Payment', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
              ),
            )
          else if (current.status == PaymentStatus.success && !current.hasRefund)
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton.icon(
                onPressed: () => _handleRequestRefund(context, ref),
                icon: const Icon(Icons.currency_exchange_rounded),
                label: Text('Request Refund', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
                style: OutlinedButton.styleFrom(foregroundColor: AppColors.primary, side: const BorderSide(color: AppColors.primary), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
              ),
            ),
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary)),
          Flexible(
            child: Text(value, textAlign: TextAlign.right, style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          ),
        ],
      ),
    );
  }
}
