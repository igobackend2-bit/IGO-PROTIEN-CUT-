import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/delivery_status.dart';

/// Fine-grained delivery-leg progress (Accepted → Delivered) — shown on the
/// Tracking screen once a partner is assigned, alongside (not replacing)
/// Orders' own OrderTimeline for the coarser order lifecycle.
class DeliveryTimeline extends StatelessWidget {
  final DeliveryStatus status;
  const DeliveryTimeline({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    if (status == DeliveryStatus.cancelled || status == DeliveryStatus.failed) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
        child: Row(
          children: [
            Icon(status.icon, color: status.color, size: 26),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                status == DeliveryStatus.cancelled ? 'This delivery was cancelled.' : 'This delivery attempt failed.',
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Delivery Timeline', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
          const SizedBox(height: 14),
          ...List.generate(DeliveryStatus.timelineSteps.length, (index) {
            final step = DeliveryStatus.timelineSteps[index];
            final isDone = index <= currentIndex;
            final isCurrent = index == currentIndex;
            final isLast = index == DeliveryStatus.timelineSteps.length - 1;

            return IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 26,
                        height: 26,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: isDone ? AppColors.primaryGradient : null,
                          color: isDone ? null : Colors.grey.shade200,
                          border: isCurrent ? Border.all(color: AppColors.accent, width: 2) : null,
                        ),
                        child: Icon(step.icon, size: 13, color: isDone ? Colors.white : Colors.grey.shade500),
                      ),
                      if (!isLast) Expanded(child: Container(width: 2, color: index < currentIndex ? AppColors.primary : Colors.grey.shade200)),
                    ],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(bottom: isLast ? 0 : 18, top: 3),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            step.label,
                            style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: isDone ? FontWeight.w800 : FontWeight.w600, color: isDone ? AppColors.textPrimary : AppColors.textHint),
                          ),
                          if (isCurrent)
                            Padding(
                              padding: const EdgeInsets.only(top: 2),
                              child: Text('In progress...', style: GoogleFonts.outfit(fontSize: 10.5, color: AppColors.primary, fontWeight: FontWeight.w600)),
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
