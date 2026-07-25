import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../providers/cart_providers.dart';
import '../providers/cart_state.dart';
import '../widgets/cart_empty_state.dart';
import '../widgets/cart_error_state.dart';
import '../widgets/cart_item_card.dart';
import '../widgets/cart_recommended_section.dart';
import '../widgets/cart_skeleton.dart';
import '../widgets/coupon_input_card.dart';
import '../widgets/price_summary_card.dart';
import '../widgets/saved_for_later_section.dart';
import '../widgets/sticky_checkout_bar.dart';

/// Premium Shopping Cart (Phase 4). "Proceed to Checkout" now hands off to
/// the Phase 6 Checkout flow (address → slot → payment → review) instead of
/// placing the order directly — see features/checkout.
class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  @override
  void initState() {
    super.initState();
    // cartProvider is a long-lived singleton that only updates via its own
    // notifier methods; items added elsewhere (Product Detail, Home,
    // Product Discovery) write straight to CartService and never touch it.
    // Refresh on every visit so this screen never shows a stale cache.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) ref.read(cartProvider.notifier).refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    ref.listen(cartProvider, (previous, next) {
      final message = next.feedbackMessage;
      if (message == null || message == previous?.feedbackMessage) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message, style: GoogleFonts.outfit()),
          backgroundColor: next.feedbackIsError ? AppColors.error : AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    });

    final state = ref.watch(cartProvider);
    final notifier = ref.read(cartProvider.notifier);
    final summary = ref.watch(cartSummaryProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('My Cart', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: _buildBody(context, ref, state, notifier),
      bottomNavigationBar: state.items.isEmpty
          ? null
          : StickyCheckoutBar(
              summary: summary,
              isEmpty: state.items.isEmpty,
              isCheckingOut: state.isCheckingOut,
              onCheckout: () => Navigator.pushNamed(context, '/checkout'),
            ),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, CartState state, CartNotifier notifier) {
    if (state.isLoadingFirst) return const CartSkeleton();
    if (state.error != null) return CartErrorState(onRetry: notifier.retry);

    final fullyEmpty = state.items.isEmpty && state.savedForLater.isEmpty;
    if (fullyEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: notifier.refresh,
        child: ListView(physics: const AlwaysScrollableScrollPhysics(), children: const [CartEmptyState()]),
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: notifier.refresh,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        children: [
          if (state.items.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(
                'Your cart is empty — move something back from Saved for Later, or check out what you might like below.',
                style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary),
              ),
            )
          else ...[
            ...state.items.map((item) => CartItemCard(
                  item: item,
                  onIncrement: () => notifier.incrementQuantity(item),
                  onDecrement: () => notifier.decrementQuantity(item),
                  onRemove: () => notifier.removeItem(item),
                  onSaveForLater: () => notifier.saveForLater(item),
                )),
            const SizedBox(height: 8),
            CouponInputCard(appliedCoupon: state.appliedCoupon, isApplying: state.isApplyingCoupon),
            const SizedBox(height: 16),
            PriceSummaryCard(summary: ref.watch(cartSummaryProvider)),
            const SizedBox(height: 24),
          ],
          if (state.savedForLater.isNotEmpty) ...[
            SavedForLaterSection(
              items: state.savedForLater,
              onMoveToCart: notifier.moveToCart,
              onRemove: notifier.removeSavedForLaterItem,
            ),
            const SizedBox(height: 24),
          ],
          const CartRecommendedSection(),
        ],
      ),
    );
  }
}
