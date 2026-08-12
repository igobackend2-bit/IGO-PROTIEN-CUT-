import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';

class HelpfulButton extends StatelessWidget {
  final bool isHelpful;
  final int count;
  final VoidCallback onTap;

  const HelpfulButton({super.key, required this.isHelpful, required this.count, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isHelpful ? AppColors.primary.withOpacity(0.1) : AppColors.surfaceLight,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isHelpful ? AppColors.primary : AppColors.inputBorder),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isHelpful ? Icons.thumb_up_rounded : Icons.thumb_up_outlined,
              size: 14,
              color: isHelpful ? AppColors.primary : AppColors.textSecondary,
            ),
            const SizedBox(width: 6),
            Text(
              count > 0 ? 'Helpful ($count)' : 'Helpful',
              style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w700, color: isHelpful ? AppColors.primary : AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}
