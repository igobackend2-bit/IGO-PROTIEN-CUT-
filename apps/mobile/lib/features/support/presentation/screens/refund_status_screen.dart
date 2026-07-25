import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/payment_model.dart';
import '../../../../utils/app_colors.dart';
import '../../../../utils/id_format.dart';
import '../../../payment/presentation/providers/payment_providers.dart';
import '../../../payment/presentation/widgets/refund_timeline.dart';
import '../widgets/support_states.dart';

/// Reuses the existing Payment module entirely — refund amount/status/
/// timeline data all come from `payments` via [paymentHistoryProvider] and
/// the pre-existing [RefundTimeline] widget. This screen only adds the
/// "Expected completion" disclosure and the Support-specific framing.
class RefundStatusScreen extends ConsumerWidget {
  const RefundStatusScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paymentsAsync = ref.watch(paymentHistoryProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Refund Status', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: paymentsAsync.when(
        data: (payments) {
          final refunds = payments.where((p) => p.hasRefund).toList();
          if (refunds.isEmpty) {
            return const SupportEmptyState(
              icon: Icons.currency_exchange_rounded,
              title: 'No refunds yet',
              message: "Refunds you request will show up here with their live status and timeline.",
            );
          }
          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => ref.invalidate(paymentHistoryProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              physics: const AlwaysScrollableScrollPhysics(),
              itemCount: refunds.length,
              separatorBuilder: (_, __) => const SizedBox(height: 14),
              itemBuilder: (context, index) => _RefundCard(payment: refunds[index]),
            ),
          );
        },
        loading: () => const SupportSkeleton(),
        error: (_, __) => SupportErrorState(onRetry: () => ref.invalidate(paymentHistoryProvider)),
      ),
    );
  }
}

class _RefundCard extends StatelessWidget {
  final Payment payment;
  const _RefundCard({required this.payment});

  @override
  Widget build(BuildContext context) {
    final isCompleted = payment.refundCompletedAt != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Order #${shortId(payment.orderId)}', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
        const SizedBox(height: 8),
        RefundTimeline(payment: payment),
        if (!isCompleted) ...[
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(12)),
            child: Row(
              children: [
                const Icon(Icons.schedule_rounded, size: 16, color: AppColors.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Expected completion: within 5-7 business days of your refund request.',
                    style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
