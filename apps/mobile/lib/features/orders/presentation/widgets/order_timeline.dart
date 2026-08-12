import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/order_status.dart';
import '../../../../utils/app_colors.dart';

class OrderTimeline extends StatelessWidget {
  final OrderStatus status;
  const OrderTimeline({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    if (status == OrderStatus.cancelled || status == OrderStatus.refunded) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
        child: Row(
          children: [
            Icon(status.icon, color: status.color, size: 28),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                status == OrderStatus.cancelled ? 'This order was cancelled.' : 'This order was refunded.',
                style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w700, color: status.color),
              ),
            ),
          ],
        ),
      );
    }

    final currentIndex = status.timelineIndex;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Column(
        children: List.generate(OrderStatus.timelineSteps.length, (index) {
          final step = OrderStatus.timelineSteps[index];
          final isDone = index <= currentIndex;
          final isCurrent = index == currentIndex;
          final isLast = index == OrderStatus.timelineSteps.length - 1;

          return IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: isDone ? AppColors.primaryGradient : null,
                        color: isDone ? null : Colors.grey.shade200,
                        border: isCurrent ? Border.all(color: AppColors.accent, width: 2) : null,
                      ),
                      child: Icon(step.icon, size: 14, color: isDone ? Colors.white : Colors.grey.shade500),
                    ),
                    if (!isLast) Expanded(child: Container(width: 2, color: index < currentIndex ? AppColors.primary : Colors.grey.shade200)),
                  ],
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(bottom: isLast ? 0 : 20, top: 4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          step.label,
                          style: GoogleFonts.outfit(fontSize: 13, fontWeight: isDone ? FontWeight.w800 : FontWeight.w600, color: isDone ? AppColors.textPrimary : AppColors.textHint),
                        ),
                        if (isCurrent)
                          Padding(
                            padding: const EdgeInsets.only(top: 3),
                            child: Text('In progress...', style: GoogleFonts.outfit(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w600)),
                          ),
                      ],
                    ),
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
