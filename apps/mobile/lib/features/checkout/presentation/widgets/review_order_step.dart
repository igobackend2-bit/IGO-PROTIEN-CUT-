import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../cart/presentation/providers/cart_providers.dart';
import '../../../cart/presentation/widgets/coupon_input_card.dart';
import '../../../cart/presentation/widgets/price_summary_card.dart';
import '../providers/checkout_providers.dart';

/// Reuses Cart's existing PriceSummaryCard and CouponInputCard (same bill
/// breakdown + coupon logic already built for Phase 4) rather than
/// re-implementing pricing/coupon UI here — this step only adds what's new:
/// order items, delivery details summary, instructions and gift note.
class ReviewOrderStep extends ConsumerWidget {
  const ReviewOrderStep({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartProvider);
    final summary = ref.watch(cartSummaryProvider);
    final checkoutState = ref.watch(checkoutProvider);
    final notifier = ref.read(checkoutProvider.notifier);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _sectionCard(
          title: 'Delivery Details',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (checkoutState.selectedAddress != null) ...[
                _detailRow(Icons.location_on_outlined, checkoutState.selectedAddress!.formattedOneLine),
                const SizedBox(height: 8),
              ],
              if (checkoutState.selectedSlot != null)
                _detailRow(
                  Icons.schedule_rounded,
                  '${checkoutState.selectedSlot!.dayLabel}, ${checkoutState.selectedSlot!.timeRangeLabel}',
                ),
              const SizedBox(height: 8),
              _detailRow(checkoutState.paymentMethod.icon, checkoutState.paymentMethod.label),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _sectionCard(
          title: 'Items (${cartState.items.length})',
          child: Column(
            children: cartState.items
                .map((item) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 5),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              '${item.product.name} × ${item.quantity}',
                              style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text('₹${item.subtotal.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ))
                .toList(),
          ),
        ),
        const SizedBox(height: 16),
        CouponInputCard(appliedCoupon: cartState.appliedCoupon, isApplying: cartState.isApplyingCoupon),
        const SizedBox(height: 16),
        PriceSummaryCard(summary: summary),
        const SizedBox(height: 16),
        _sectionCard(
          title: 'Delivery Instructions (Optional)',
          child: TextField(
            maxLines: 2,
            maxLength: 150,
            onChanged: notifier.setDeliveryInstructions,
            style: GoogleFonts.outfit(fontSize: 13),
            decoration: InputDecoration(
              hintText: 'e.g. Leave at the door, call on arrival...',
              hintStyle: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textHint),
              filled: true,
              fillColor: AppColors.surfaceLight,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
        ),
        const SizedBox(height: 16),
        _sectionCard(
          title: 'Gift Note (Optional)',
          child: TextField(
            maxLines: 2,
            maxLength: 150,
            onChanged: notifier.setGiftNote,
            style: GoogleFonts.outfit(fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Add a note for the recipient...',
              hintStyle: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textHint),
              filled: true,
              fillColor: AppColors.surfaceLight,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
        ),
      ],
    );
  }

  Widget _sectionCard({required String title, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }

  Widget _detailRow(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: AppColors.primary),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary, height: 1.4))),
      ],
    );
  }
}
