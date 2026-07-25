import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/cart_summary.dart';

class StickyCheckoutBar extends StatelessWidget {
  final CartSummary summary;
  final bool isEmpty;
  final bool isCheckingOut;
  final VoidCallback onCheckout;

  const StickyCheckoutBar({
    super.key,
    required this.summary,
    required this.isEmpty,
    required this.isCheckingOut,
    required this.onCheckout,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 20, right: 20, top: 14, bottom: MediaQuery.of(context).padding.bottom + 14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(top: BorderSide(color: AppColors.divider, width: 1)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, -4))],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Total', style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textHint, fontWeight: FontWeight.w600)),
                Text(
                  '₹${summary.grandTotal.toStringAsFixed(0)}',
                  style: GoogleFonts.outfit(fontSize: 19, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
              ],
            ),
          ),
          SizedBox(
            width: 180,
            height: 50,
            child: ElevatedButton(
              onPressed: (isEmpty || isCheckingOut) ? null : onCheckout,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                disabledBackgroundColor: Colors.grey.shade300,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: isCheckingOut
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white))
                  : Text('Proceed to Checkout', textAlign: TextAlign.center, style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }
}
