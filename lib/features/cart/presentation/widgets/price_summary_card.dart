import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/cart_summary.dart';

class PriceSummaryCard extends StatelessWidget {
  final CartSummary summary;
  const PriceSummaryCard({super.key, required this.summary});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Bill Summary', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 14),
          _row('Subtotal', '₹${summary.subtotal.toStringAsFixed(0)}'),
          const SizedBox(height: 10),
          _row('Delivery Charge', summary.deliveryFee == 0 ? 'FREE' : '₹${summary.deliveryFee.toStringAsFixed(0)}',
              valueColor: summary.deliveryFee == 0 ? AppColors.success : null),
          if (summary.discount > 0) ...[
            const SizedBox(height: 10),
            _row('Discount${summary.appliedCoupon != null ? ' (${summary.appliedCoupon!.code})' : ''}',
                '-₹${summary.discount.toStringAsFixed(0)}',
                valueColor: AppColors.success),
          ],
          const SizedBox(height: 10),
          _row('GST & Taxes', '₹${summary.tax.toStringAsFixed(0)}'),
          const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(height: 1, color: AppColors.divider)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Grand Total', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
              Text('₹${summary.grandTotal.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.primary)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _row(String label, String value, {Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary)),
        Text(value, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: valueColor ?? AppColors.textPrimary)),
      ],
    );
  }
}
