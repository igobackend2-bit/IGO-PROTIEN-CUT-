import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/delivery_otp_status.dart';
import '../providers/delivery_providers.dart';

/// Shows the delivery OTP (share it with your delivery partner, same as
/// the original DeliveryOtpCard) plus the real confirmation step: whoever
/// is holding the phone enters the code to mark the delivery complete.
/// There's no separate Delivery Partner App yet to submit this from a
/// driver's device, so the customer app is the stand-in entry point for
/// now — verify-delivery-otp / complete-delivery don't care which client
/// calls them, so a future partner app can take over this exact flow with
/// no server-side change.
class DeliveryOtpVerifyCard extends ConsumerStatefulWidget {
  final String orderId;
  final DeliveryOtpStatus otpStatus;

  const DeliveryOtpVerifyCard({super.key, required this.orderId, required this.otpStatus});

  @override
  ConsumerState<DeliveryOtpVerifyCard> createState() => _DeliveryOtpVerifyCardState();
}

class _DeliveryOtpVerifyCardState extends ConsumerState<DeliveryOtpVerifyCard> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(otpVerifyProvider(widget.orderId));

    if (widget.otpStatus.isVerified || state.isComplete) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: AppColors.success.withOpacity(0.08), borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.success.withOpacity(0.3))),
        child: Row(
          children: [
            const Icon(Icons.verified_rounded, color: AppColors.success, size: 22),
            const SizedBox(width: 10),
            Expanded(child: Text('Delivery confirmed!', style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800, color: AppColors.success))),
          ],
        ),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.25), blurRadius: 12, offset: const Offset(0, 6))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.verified_user_rounded, color: Colors.white, size: 26),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Share this OTP with your delivery partner', style: GoogleFonts.outfit(fontSize: 11.5, color: Colors.white.withOpacity(0.9), fontWeight: FontWeight.w600)),
                    const SizedBox(height: 3),
                    Text(widget.otpStatus.otpCode, style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 6)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text('Enter OTP to confirm delivery', style: GoogleFonts.outfit(fontSize: 12, color: Colors.white.withOpacity(0.9), fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(4)],
                  style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, letterSpacing: 4, color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    hintText: '••••',
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              ElevatedButton(
                onPressed: state.isSubmitting ? null : () => ref.read(otpVerifyProvider(widget.orderId).notifier).submit(_controller.text),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: state.isSubmitting
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
                    : Text('Confirm', style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 13)),
              ),
            ],
          ),
          if (state.error != null) ...[
            const SizedBox(height: 8),
            Text(state.error!, style: GoogleFonts.outfit(fontSize: 11.5, color: Colors.white, fontWeight: FontWeight.w600)),
          ],
        ],
      ),
    );
  }
}
