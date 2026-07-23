import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/order_summary.dart';

class DeliveryPartnerCard extends StatelessWidget {
  final DeliveryPartnerSummary partner;
  const DeliveryPartnerCard({super.key, required this.partner});

  Future<void> _call(BuildContext context) async {
    final uri = Uri(scheme: 'tel', path: partner.phone);
    final launched = await launchUrl(uri);
    if (!launched && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not open the dialer.', style: GoogleFonts.outfit()), behavior: SnackBarBehavior.floating),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: const BoxDecoration(color: AppColors.surfaceLight, shape: BoxShape.circle),
            child: const Icon(Icons.two_wheeler_rounded, color: AppColors.primary, size: 26),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Delivery Partner', style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(partner.name, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                if (partner.vehicleNumber != null || partner.rating != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Row(
                      children: [
                        if (partner.vehicleNumber != null)
                          Text(partner.vehicleNumber!, style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
                        if (partner.rating != null) ...[
                          const SizedBox(width: 8),
                          const Icon(Icons.star_rounded, size: 13, color: Color(0xFFF39C12)),
                          Text(partner.rating!.toStringAsFixed(1), style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
                        ],
                      ],
                    ),
                  ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () => _call(context),
            child: Container(
              width: 44,
              height: 44,
              decoration: const BoxDecoration(gradient: AppColors.primaryGradient, shape: BoxShape.circle),
              child: const Icon(Icons.call_rounded, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
