import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/delivery_assignment.dart';

/// ETA + remaining distance — both come straight off `delivery_assignments`
/// (kept fresh by the Edge Functions), so this widget updates live off the
/// same Realtime stream driving the rest of the tracking screen, with no
/// separate polling.
class DeliveryEtaWidget extends StatelessWidget {
  final DeliveryAssignment assignment;
  const DeliveryEtaWidget({super.key, required this.assignment});

  @override
  Widget build(BuildContext context) {
    final eta = assignment.etaMinutes;
    final distanceKm = assignment.distanceKm;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: const BoxDecoration(color: AppColors.surfaceLight, shape: BoxShape.circle),
            child: const Icon(Icons.timer_outlined, color: AppColors.primary, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Estimated Arrival', style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(
                  eta == null ? 'Calculating…' : '$eta min${eta == 1 ? '' : 's'}',
                  style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
              ],
            ),
          ),
          if (distanceKm != null)
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('Distance', style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text('${distanceKm.toStringAsFixed(1)} km', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primary)),
              ],
            ),
        ],
      ),
    );
  }
}
