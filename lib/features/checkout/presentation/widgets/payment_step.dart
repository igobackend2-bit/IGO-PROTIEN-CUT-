import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/payment_method_option.dart';
import '../providers/checkout_providers.dart';

class PaymentStep extends ConsumerWidget {
  const PaymentStep({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selected = ref.watch(checkoutProvider).paymentMethod;
    final notifier = ref.read(checkoutProvider.notifier);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Payment Method', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        const SizedBox(height: 6),
        Text(
          'Choose how you\'d like to pay',
          style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 16),
        ...PaymentMethodOption.values.map((method) {
          final isSelected = method == selected;
          return GestureDetector(
            onTap: method.isAvailable ? () => notifier.selectPaymentMethod(method) : null,
            child: Opacity(
              opacity: method.isAvailable ? 1 : 0.5,
              child: Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: isSelected ? AppColors.primary : AppColors.divider, width: isSelected ? 1.5 : 1),
                ),
                child: Row(
                  children: [
                    Icon(method.icon, color: AppColors.primary, size: 22),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(method.label, style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w700)),
                    ),
                    if (!method.isAvailable)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(8)),
                        child: Text('COMING SOON', style: GoogleFonts.outfit(fontSize: 9, fontWeight: FontWeight.w800, color: AppColors.textHint)),
                      )
                    else
                      Icon(
                        isSelected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
                        color: AppColors.primary,
                        size: 20,
                      ),
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }
}
