import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';

/// Customer-facing OTP shown once the order is out for delivery — share it
/// with the delivery partner to confirm receipt. There's no delivery-
/// partner app in this project to verify it against yet; this is the
/// display half of that flow.
class DeliveryOtpCard extends StatelessWidget {
  final String otp;
  const DeliveryOtpCard({super.key, required this.otp});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.25), blurRadius: 12, offset: const Offset(0, 6))],
      ),
      child: Row(
        children: [
          const Icon(Icons.verified_user_rounded, color: Colors.white, size: 28),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Share this OTP with your delivery partner', style: GoogleFonts.outfit(fontSize: 12, color: Colors.white.withOpacity(0.9), fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(otp, style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 6)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
