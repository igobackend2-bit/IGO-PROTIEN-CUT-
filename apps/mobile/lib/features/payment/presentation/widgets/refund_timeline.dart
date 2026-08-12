import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../models/payment_model.dart';
import '../../../../utils/app_colors.dart';

class RefundTimeline extends StatelessWidget {
  final Payment payment;
  const RefundTimeline({super.key, required this.payment});

  @override
  Widget build(BuildContext context) {
    if (!payment.hasRefund) return const SizedBox.shrink();

    final isCompleted = payment.refundCompletedAt != null;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.currency_exchange_rounded, color: Color(0xFF7D3C98), size: 18),
              const SizedBox(width: 8),
              Text('Refund', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
              const Spacer(),
              Text(payment.refundStatus ?? 'Requested', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: const Color(0xFF7D3C98))),
            ],
          ),
          const SizedBox(height: 14),
          _step('Refund Requested', payment.refundRequestedAt, isDone: true),
          Container(margin: const EdgeInsets.only(left: 9), width: 2, height: 20, color: isCompleted ? const Color(0xFF7D3C98) : Colors.grey.shade300),
          _step('Refund Completed', payment.refundCompletedAt, isDone: isCompleted),
          if (payment.refundAmount != null) ...[
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Refund Amount', style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary)),
                Text('₹${payment.refundAmount!.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
              ],
            ),
          ],
          if (payment.refundReason != null) ...[
            const SizedBox(height: 8),
            Text('Reason: ${payment.refundReason}', style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textHint)),
          ],
        ],
      ),
    );
  }

  Widget _step(String label, DateTime? timestamp, {required bool isDone}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isDone ? const Color(0xFF7D3C98) : Colors.grey.shade300,
          ),
          child: isDone ? const Icon(Icons.check, size: 13, color: Colors.white) : null,
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: isDone ? AppColors.textPrimary : AppColors.textHint)),
              if (timestamp != null)
                Text(DateFormat('dd MMM yyyy, hh:mm a').format(timestamp), style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint)),
            ],
          ),
        ),
      ],
    );
  }
}
