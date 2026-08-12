import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/achievement.dart';

class AchievementBadge extends StatelessWidget {
  final Achievement achievement;
  const AchievementBadge({super.key, required this.achievement});

  @override
  Widget build(BuildContext context) {
    final unlocked = achievement.isUnlocked;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: unlocked ? AppColors.primary.withOpacity(0.3) : AppColors.divider),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: unlocked ? AppColors.primary.withOpacity(0.12) : AppColors.surfaceLight,
              shape: BoxShape.circle,
            ),
            child: Icon(
              unlocked ? achievement.iconData : Icons.lock_outline_rounded,
              color: unlocked ? AppColors.primary : AppColors.textHint,
              size: 22,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(achievement.title, style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w700, color: unlocked ? AppColors.textPrimary : AppColors.textHint)),
                const SizedBox(height: 3),
                Text(achievement.description, style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
                if (unlocked && achievement.unlockedAt != null) ...[
                  const SizedBox(height: 4),
                  Text('Unlocked ${DateFormat('dd MMM yyyy').format(achievement.unlockedAt!)}', style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.success)),
                ],
              ],
            ),
          ),
          if (unlocked) const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 20),
        ],
      ),
    );
  }
}
