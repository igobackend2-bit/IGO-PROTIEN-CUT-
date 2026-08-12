import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/offer.dart';
import 'countdown_timer.dart';
import 'offer_badge.dart';

/// Full-width offer card used on the Offers Screen for Featured / Festival
/// campaigns, and for Flash Sale entries (via [showCountdown] /
/// [showStock]). Tapping a card with a coupon code copies it, mirroring
/// the same tap behavior as Home's offer row so the two never diverge.
class OfferBannerCard extends StatelessWidget {
  final Offer offer;
  final bool showCountdown;
  final bool showStock;
  final VoidCallback? onTap;

  const OfferBannerCard({
    super.key,
    required this.offer,
    this.showCountdown = false,
    this.showStock = false,
    this.onTap,
  });

  Gradient get _gradient => switch (offer.type) {
        OfferType.flashSale => const LinearGradient(colors: [Color(0xFFBA4A00), Color(0xFFE67E22)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        OfferType.festival => const LinearGradient(colors: [Color(0xFF8E44AD), Color(0xFFC0392B)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        OfferType.featured => AppColors.heroBannerGradient,
      };

  void _handleTap(BuildContext context) {
    if (onTap != null) {
      onTap!();
      return;
    }
    final code = offer.couponCode;
    if (code == null) return;
    Clipboard.setData(ClipboardData(text: code));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$code copied to clipboard', style: GoogleFonts.outfit()), backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final stockFraction = (showStock && offer.totalQuantity != null && offer.totalQuantity! > 0)
        ? (offer.remainingQuantity ?? 0) / offer.totalQuantity!
        : null;

    return GestureDetector(
      onTap: () => _handleTap(context),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(gradient: _gradient, borderRadius: BorderRadius.circular(20)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                OfferBadge(offer: offer),
                const Spacer(),
                if (showCountdown) CountdownTimer(endsAt: offer.endDate),
              ],
            ),
            const SizedBox(height: 10),
            Text(offer.title, style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.white)),
            const SizedBox(height: 4),
            Text(offer.description, style: GoogleFonts.outfit(fontSize: 12.5, color: Colors.white.withOpacity(0.9), height: 1.35)),
            if (stockFraction != null) ...[
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: stockFraction.clamp(0, 1),
                  minHeight: 6,
                  backgroundColor: Colors.white.withOpacity(0.25),
                  valueColor: const AlwaysStoppedAnimation(Colors.white),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${offer.remainingQuantity ?? 0} of ${offer.totalQuantity} left',
                style: GoogleFonts.outfit(fontSize: 10.5, color: Colors.white.withOpacity(0.85), fontWeight: FontWeight.w600),
              ),
            ],
            if (offer.couponCode != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.18),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white.withOpacity(0.4), style: BorderStyle.solid),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(offer.couponCode!, style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.5)),
                    const SizedBox(width: 6),
                    const Icon(Icons.copy_rounded, size: 13, color: Colors.white),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
