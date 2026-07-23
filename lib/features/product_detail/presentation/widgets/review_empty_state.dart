import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';

class ReviewEmptyState extends StatelessWidget {
  const ReviewEmptyState({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 60),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(28),
              decoration: const BoxDecoration(color: AppColors.surfaceLight, shape: BoxShape.circle),
              child: const Icon(Icons.rate_review_outlined, size: 64, color: AppColors.primary),
            ),
            const SizedBox(height: 20),
            Text('No reviews yet', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            const SizedBox(height: 8),
            Text('Be the first to share your experience with this product!', textAlign: TextAlign.center, style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary, height: 1.4)),
          ],
        ),
      ),
    );
  }
}
