import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../screens/order_success_screen.dart';
import '../../../../utils/app_colors.dart';
import '../../../cart/presentation/providers/cart_providers.dart';
import '../providers/checkout_providers.dart';
import '../providers/checkout_state.dart';
import '../widgets/address_step.dart';
import '../widgets/checkout_bottom_bar.dart';
import '../widgets/checkout_step_indicator.dart';
import '../widgets/delivery_slot_step.dart';
import '../widgets/payment_step.dart';
import '../widgets/review_order_step.dart';

/// Single-screen, step-based checkout: Address → Delivery Slot → Payment →
/// Review. Reuses the Cart and Address modules end to end rather than
/// re-implementing any of their logic.
class CheckoutScreen extends ConsumerWidget {
  const CheckoutScreen({super.key});

  Future<void> _handleContinue(BuildContext context, WidgetRef ref) async {
    final notifier = ref.read(checkoutProvider.notifier);
    final state = ref.read(checkoutProvider);

    if (state.step != CheckoutStep.review) {
      notifier.nextStep();
      return;
    }

    final success = await notifier.placeOrder();
    if (!context.mounted) return;

    if (success) {
      final order = ref.read(checkoutProvider).placedOrder!;
      final checkoutState = ref.read(checkoutProvider);
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (_) => OrderSuccessScreen(
            orderId: order.id.toString(),
            paymentMethodLabel: checkoutState.paymentMethod.label,
            deliveryEtaLabel: checkoutState.selectedSlot == null
                ? null
                : '${checkoutState.selectedSlot!.dayLabel}, ${checkoutState.selectedSlot!.timeRangeLabel}',
          ),
        ),
        (route) => route.settings.name == '/home',
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartProvider);
    final hasPlacedOrder = ref.watch(checkoutProvider.select((s) => s.placedOrder != null));

    // Guard: nothing to check out if the cart is empty (e.g. deep link or
    // back-navigation after the order already went through). Excludes the
    // moment right after a successful placeOrder() — that call clears the
    // cart itself, which would otherwise race this guard against the
    // pushAndRemoveUntil navigating to OrderSuccessScreen and pop it back off.
    if (!cartState.isLoadingFirst && cartState.items.isEmpty && !hasPlacedOrder) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (Navigator.canPop(context)) Navigator.pop(context);
      });
      return const Scaffold(body: SizedBox.shrink());
    }

    ref.listen(checkoutProvider, (previous, next) {
      final message = next.errorMessage;
      if (message == null || message.isEmpty || message == previous?.errorMessage) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message, style: GoogleFonts.outfit()),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    });

    final checkoutState = ref.watch(checkoutProvider);
    final notifier = ref.read(checkoutProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Checkout', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: Column(
        children: [
          CheckoutStepIndicator(current: checkoutState.step, onTap: notifier.goToStep),
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 220),
              child: KeyedSubtree(
                key: ValueKey(checkoutState.step),
                child: switch (checkoutState.step) {
                  CheckoutStep.address => const AddressStep(),
                  CheckoutStep.deliverySlot => const DeliverySlotStep(),
                  CheckoutStep.payment => const PaymentStep(),
                  CheckoutStep.review => const ReviewOrderStep(),
                },
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: CheckoutBottomBar(
        step: checkoutState.step,
        isFirstStep: checkoutState.step == CheckoutStep.address,
        isPlacingOrder: checkoutState.isPlacingOrder,
        onBack: notifier.previousStep,
        onContinue: () => _handleContinue(context, ref),
      ),
    );
  }
}
