import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/membership_tier.dart';
import '../../domain/entities/loyalty_summary.dart';

class TierProgressCard extends StatelessWidget {
  final LoyaltySummary summary;
  const TierProgressCard({super.key, required this.summary});

  @override
  Widget build(BuildContext context) {
    final tier = summary.tier;
    final next = tier.next;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [tier.color, tier.color.withOpacity(0.75)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(tier.icon, color: Colors.white, size: 26),
              const SizedBox(width: 10),
              Text('${tier.label} Member', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
            ],
          ),
          const SizedBox(height: 4),
          Text('${summary.currentPoints} points', style: GoogleFonts.outfit(fontSize: 12.5, color: Colors.white.withOpacity(0.85))),
          const SizedBox(height: 16),
          if (next != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: summary.progressToNextTier,
                minHeight: 8,
                backgroundColor: Colors.white.withOpacity(0.25),
                valueColor: const AlwaysStoppedAnimation(Colors.white),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${summary.pointsToNextTier} points to ${next.label}',
              style: GoogleFonts.outfit(fontSize: 11.5, color: Colors.white.withOpacity(0.85)),
            ),
          ] else
            Text("You've reached the top tier!", style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w600, color: Colors.white)),
        ],
      ),
    );
  }
}
