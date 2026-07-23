import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../providers/checkout_state.dart';

class CheckoutStepIndicator extends StatelessWidget {
  final CheckoutStep current;
  final ValueChanged<CheckoutStep> onTap;

  const CheckoutStepIndicator({super.key, required this.current, required this.onTap});

  static const _labels = {
    CheckoutStep.address: 'Address',
    CheckoutStep.deliverySlot: 'Slot',
    CheckoutStep.payment: 'Payment',
    CheckoutStep.review: 'Review',
  };

  @override
  Widget build(BuildContext context) {
    final steps = CheckoutStep.values;
    final currentIndex = steps.indexOf(current);

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: List.generate(steps.length, (index) {
          final step = steps[index];
          final isDone = index < currentIndex;
          final isCurrent = index == currentIndex;
          final isLast = index == steps.length - 1;

          return Expanded(
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => onTap(step),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: (isDone || isCurrent) ? AppColors.primaryGradient : null,
                          color: (isDone || isCurrent) ? null : Colors.grey.shade200,
                          border: isCurrent ? Border.all(color: AppColors.accent, width: 2) : null,
                        ),
                        child: Center(
                          child: isDone
                              ? const Icon(Icons.check_rounded, size: 15, color: Colors.white)
                              : Text(
                                  '${index + 1}',
                                  style: GoogleFonts.outfit(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w800,
                                    color: isCurrent ? Colors.white : Colors.grey.shade500,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _labels[step]!,
                        style: GoogleFonts.outfit(
                          fontSize: 9.5,
                          fontWeight: isCurrent ? FontWeight.w800 : FontWeight.w600,
                          color: isCurrent ? AppColors.primary : AppColors.textHint,
                        ),
                      ),
                    ],
                  ),
                ),
                if (!isLast)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Container(height: 2, color: isDone ? AppColors.primary : Colors.grey.shade200),
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }
}
