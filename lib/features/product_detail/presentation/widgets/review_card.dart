import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../utils/app_colors.dart';
import '../../data/models/product_review_model.dart';
import 'helpful_button.dart';
import 'review_photo_grid.dart';

class ReviewCard extends StatelessWidget {
  final ProductReview review;
  final bool isOwnReview;
  final VoidCallback onToggleHelpful;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const ReviewCard({
    super.key,
    required this.review,
    required this.isOwnReview,
    required this.onToggleHelpful,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(child: Text(review.userName, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary), overflow: TextOverflow.ellipsis)),
                        if (review.verifiedPurchase) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: AppColors.success.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.verified_rounded, size: 11, color: AppColors.success),
                                const SizedBox(width: 3),
                                Text('Verified Purchase', style: GoogleFonts.outfit(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.success)),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: List.generate(5, (i) => Icon(
                            i < review.rating ? Icons.star_rounded : Icons.star_outline_rounded,
                            color: const Color(0xFFF39C12),
                            size: 14,
                          )),
                    ),
                  ],
                ),
              ),
              Text(DateFormat('dd MMM yyyy').format(review.createdAt), style: GoogleFonts.outfit(fontSize: 10.5, color: AppColors.textHint)),
            ],
          ),
          if (review.title != null && review.title!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(review.title!, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          ],
          if (review.comment.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(review.comment, style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary, height: 1.4)),
          ],
          if (review.photos.isNotEmpty) ...[
            const SizedBox(height: 10),
            ReviewPhotoGrid(photos: review.photos),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              HelpfulButton(isHelpful: review.isHelpfulByMe, count: review.helpfulCount, onTap: onToggleHelpful),
              const Spacer(),
              if (isOwnReview) ...[
                IconButton(
                  onPressed: onEdit,
                  icon: const Icon(Icons.edit_outlined, size: 18, color: AppColors.textSecondary),
                  visualDensity: VisualDensity.compact,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
                const SizedBox(width: 14),
                IconButton(
                  onPressed: onDelete,
                  icon: const Icon(Icons.delete_outline_rounded, size: 18, color: AppColors.error),
                  visualDensity: VisualDensity.compact,
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ],
          ),
          if (review.reply != null) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(12)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.storefront_rounded, size: 14, color: AppColors.primary),
                      const SizedBox(width: 6),
                      Text(review.reply!.repliedBy, style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w800, color: AppColors.primary)),
                      const Spacer(),
                      Text(DateFormat('dd MMM yyyy').format(review.reply!.createdAt), style: GoogleFonts.outfit(fontSize: 9.5, color: AppColors.textHint)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(review.reply!.reply, style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textSecondary, height: 1.4)),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
