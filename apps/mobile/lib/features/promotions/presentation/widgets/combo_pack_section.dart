import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/combo_pack.dart';
import 'combo_pack_card.dart';

/// Horizontal "Combo Deals" row — same section shape as Home's other
/// product sliders (title + horizontal scroll), reused on both Home and
/// the Offers Screen.
class ComboPackSection extends StatelessWidget {
  final List<ComboPack> comboPacks;
  final String title;
  final String subtitle;

  const ComboPackSection({super.key, required this.comboPacks, this.title = '🎁 Combo Deals', this.subtitle = 'Bundle up and save more'});

  @override
  Widget build(BuildContext context) {
    if (comboPacks.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
              const SizedBox(height: 2),
              Text(subtitle, style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textHint)),
            ],
          ),
        ),
        SizedBox(
          height: 218,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: comboPacks.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) => ComboPackCard(pack: comboPacks[index]),
          ),
        ),
      ],
    );
  }
}
