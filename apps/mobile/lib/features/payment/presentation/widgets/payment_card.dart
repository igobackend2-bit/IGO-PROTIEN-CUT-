import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../models/payment_model.dart';
import '../../../../utils/app_colors.dart';
import '../../../../utils/id_format.dart';
import 'payment_status_badge.dart';

class PaymentCard extends StatelessWidget {
  final Payment payment;
  final VoidCallback onTap;

  const PaymentCard({super.key, required this.payment, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Order #${shortId(payment.orderId)}', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                PaymentStatusBadge(status: payment.status),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              payment.transactionId != null ? 'Txn ID: ${payment.transactionId}' : 'Txn ID: —',
              style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textHint),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.payments_outlined, size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 5),
                    Text(payment.paymentMethod, style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textSecondary)),
                  ],
                ),
                Text('₹${payment.amount.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary)),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              DateFormat('dd MMM yyyy, hh:mm a').format(payment.createdAt),
              style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint),
            ),
          ],
        ),
      ),
    );
  }
}
