import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/coupon.dart';
import '../providers/cart_providers.dart';

class CouponInputCard extends ConsumerStatefulWidget {
  final AppliedCoupon? appliedCoupon;
  final bool isApplying;

  const CouponInputCard({super.key, required this.appliedCoupon, required this.isApplying});

  @override
  ConsumerState<CouponInputCard> createState() => _CouponInputCardState();
}

class _CouponInputCardState extends ConsumerState<CouponInputCard> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final coupon = widget.appliedCoupon;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: coupon != null ? _appliedView(coupon) : _inputView(),
    );
  }

  Widget _appliedView(AppliedCoupon coupon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(color: AppColors.success.withOpacity(0.1), shape: BoxShape.circle),
          child: const Icon(Icons.local_offer_rounded, color: AppColors.success, size: 18),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(coupon.code, style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
              Text(coupon.description, style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textHint)),
              if (coupon.cashbackAmount != null && coupon.cashbackAmount! > 0)
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(
                    '+ ₹${coupon.cashbackAmount!.toStringAsFixed(0)} cashback after delivery',
                    style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary),
                  ),
                ),
            ],
          ),
        ),
        TextButton(
          onPressed: () => ref.read(cartProvider.notifier).removeCoupon(),
          child: Text('Remove', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.error)),
        ),
      ],
    );
  }

  Widget _inputView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.local_offer_outlined, color: AppColors.primary, size: 18),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: _controller,
                textCapitalization: TextCapitalization.characters,
                style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w600),
                decoration: InputDecoration(
                  isDense: true,
                  border: InputBorder.none,
                  hintText: 'Enter coupon code',
                  hintStyle: GoogleFonts.outfit(fontSize: 13, color: AppColors.textHint, fontWeight: FontWeight.w400),
                ),
              ),
            ),
            widget.isApplying
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
                : TextButton(
                    onPressed: () {
                      final code = _controller.text.trim();
                      if (code.isEmpty) return;
                      ref.read(cartProvider.notifier).applyCoupon(code);
                    },
                    child: Text('APPLY', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.primary)),
                  ),
          ],
        ),
        if (!widget.isApplying)
          Padding(
            padding: const EdgeInsets.only(top: 4, left: 28),
            child: InkWell(
              onTap: () => ref.read(cartProvider.notifier).applyBestOffer(),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.auto_awesome_rounded, size: 14, color: AppColors.primary),
                  const SizedBox(width: 4),
                  Text('Apply best offer', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                ],
              ),
            ),
          ),
      ],
    );
  }
}
