import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../data/models/product_review_model.dart';

class RatingSummaryCard extends StatelessWidget {
  final ReviewSummary summary;
  const RatingSummaryCard({super.key, required this.summary});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Column(
                children: [
                  Text(summary.average.toStringAsFixed(1), style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(5, (i) {
                      final filled = i < summary.average.round();
                      return Icon(filled ? Icons.star_rounded : Icons.star_outline_rounded, color: const Color(0xFFF39C12), size: 14);
                    }),
                  ),
                  const SizedBox(height: 2),
                  Text('${summary.count} ${summary.count == 1 ? 'review' : 'reviews'}', style: GoogleFonts.outfit(fontSize: 10.5, color: AppColors.textHint)),
                ],
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [5, 4, 3, 2, 1].map((star) {
                    final count = summary.starCounts[star] ?? 0;
                    final fraction = summary.count == 0 ? 0.0 : count / summary.count;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          Text('$star', style: GoogleFonts.outfit(fontSize: 10.5, color: AppColors.textHint)),
                          const SizedBox(width: 4),
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: fraction,
                                minHeight: 6,
                                backgroundColor: AppColors.surfaceLight,
                                valueColor: const AlwaysStoppedAnimation(Color(0xFFF39C12)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          SizedBox(width: 24, child: Text('$count', style: GoogleFonts.outfit(fontSize: 10, color: AppColors.textHint))),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
          if (summary.count > 0) ...[
            const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(color: AppColors.divider, height: 1)),
            Row(
              children: [
                const Icon(Icons.thumb_up_alt_outlined, size: 16, color: AppColors.success),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${summary.recommendPercent.toStringAsFixed(0)}% of reviewers would recommend this product',
                    style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
