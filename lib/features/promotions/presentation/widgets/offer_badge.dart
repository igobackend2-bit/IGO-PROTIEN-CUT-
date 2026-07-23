import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/offer.dart';

/// Small colored pill for an offer's discount, e.g. "25% OFF" / "FREE
/// DELIVERY" — color varies by offer type so Flash Sale reads urgent and
/// Festival reads celebratory.
class OfferBadge extends StatelessWidget {
  final Offer offer;
  const OfferBadge({super.key, required this.offer});

  Color get _color => switch (offer.type) {
        OfferType.flashSale => AppColors.error,
        OfferType.festival => AppColors.warning,
        OfferType.featured => AppColors.primary,
      };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: _color, borderRadius: BorderRadius.circular(6)),
      child: Text(
        offer.discountLabel,
        style: GoogleFonts.outfit(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.3),
      ),
    );
  }
}
