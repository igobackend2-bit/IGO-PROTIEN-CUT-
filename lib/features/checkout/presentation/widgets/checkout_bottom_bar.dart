import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../providers/checkout_state.dart';

class CheckoutBottomBar extends StatelessWidget {
  final CheckoutStep step;
  final bool isFirstStep;
  final bool isPlacingOrder;
  final VoidCallback onBack;
  final VoidCallback onContinue;

  const CheckoutBottomBar({
    super.key,
    required this.step,
    required this.isFirstStep,
    required this.isPlacingOrder,
    required this.onBack,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    final isReview = step == CheckoutStep.review;

    return Container(
      padding: EdgeInsets.fromLTRB(16, 12, 16, MediaQuery.of(context).padding.bottom + 12),
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(top: BorderSide(color: AppColors.divider, width: 1)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, -4))],
      ),
      child: Row(
        children: [
          if (!isFirstStep) ...[
            OutlinedButton(
              onPressed: isPlacingOrder ? null : onBack,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.inputBorder),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: const Icon(Icons.arrow_back_rounded, color: AppColors.textSecondary),
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: ElevatedButton(
              onPressed: isPlacingOrder ? null : onContinue,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: isPlacingOrder
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.2, color: Colors.white))
                  : Text(
                      isReview ? 'Place Order' : 'Continue',
                      style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
