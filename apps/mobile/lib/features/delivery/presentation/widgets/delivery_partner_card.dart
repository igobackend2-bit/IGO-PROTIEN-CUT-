import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/delivery_partner.dart';

/// Richer replacement for Orders' original DeliveryPartnerCard — adds
/// photo and vehicle type on top of name/phone/vehicle number/rating.
/// Shown only on the Tracking screen; Order Detail keeps the original
/// lightweight card unchanged.
class DeliveryPartnerCard extends StatelessWidget {
  final DeliveryPartner partner;
  const DeliveryPartnerCard({super.key, required this.partner});

  Future<void> _call(BuildContext context) async {
    final launched = await launchUrl(Uri(scheme: 'tel', path: partner.phone));
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
          ClipOval(
            child: SizedBox(
              width: 52,
              height: 52,
              child: partner.photoUrl == null
                  ? const ColoredBox(color: AppColors.surfaceLight, child: Icon(Icons.two_wheeler_rounded, color: AppColors.primary, size: 26))
                  : CachedNetworkImage(
                      imageUrl: partner.photoUrl!,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => const ColoredBox(color: AppColors.surfaceLight, child: Icon(Icons.two_wheeler_rounded, color: AppColors.primary, size: 26)),
                    ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Delivery Partner', style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(partner.name, style: GoogleFonts.outfit(fontSize: 14.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                const SizedBox(height: 3),
                Wrap(
                  spacing: 8,
                  runSpacing: 2,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    if (partner.vehicleType != null || partner.vehicleNumber != null)
                      Text(
                        [partner.vehicleType, partner.vehicleNumber].where((s) => s != null).join(' • '),
                        style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary),
                      ),
                    if (partner.rating != null)
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.star_rounded, size: 13, color: Color(0xFFF39C12)),
                          Text(partner.rating!.toStringAsFixed(1), style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
                        ],
                      ),
                  ],
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
