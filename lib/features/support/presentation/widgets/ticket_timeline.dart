import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/ticket_status.dart';

/// Vertical progress stepper for a ticket's status — same visual language
/// as Orders' OrderTimeline. Relabels each step for `return`-category
/// tickets via [isReturn] rather than tracking a second status field.
class TicketTimeline extends StatelessWidget {
  final TicketStatus status;
  final bool isReturn;
  const TicketTimeline({super.key, required this.status, this.isReturn = false});

  @override
  Widget build(BuildContext context) {
    final currentIndex = status.timelineIndex;
    final steps = TicketStatus.timelineSteps;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(isReturn ? 'Return Timeline' : 'Ticket Timeline', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
          const SizedBox(height: 14),
          ...List.generate(steps.length, (index) {
            final step = steps[index];
            final isDone = index <= currentIndex;
            final isCurrent = index == currentIndex;
            final isLast = index == steps.length - 1;
            final label = isReturn ? step.returnLabel : step.label;

            return IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: isDone ? AppColors.primaryGradient : null,
                          color: isDone ? null : Colors.grey.shade200,
                          border: isCurrent ? Border.all(color: AppColors.accent, width: 2) : null,
                        ),
                        child: isDone ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
                      ),
                      if (!isLast) Expanded(child: Container(width: 2, color: index < currentIndex ? AppColors.primary : Colors.grey.shade200)),
                    ],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(bottom: isLast ? 0 : 16, top: 2),
                      child: Text(
                        label,
                        style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: isDone ? FontWeight.w800 : FontWeight.w600, color: isDone ? AppColors.textPrimary : AppColors.textHint),
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
