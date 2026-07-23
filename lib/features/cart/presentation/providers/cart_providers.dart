import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../models/product_model.dart';
import '../../../../services/cart_service.dart';
import '../../../../shared/providers/catalog_providers.dart';
import '../../data/repositories/coupon_repository_impl.dart';
import '../../domain/entities/cart_line_item.dart';
import '../../domain/entities/cart_summary.dart';
import '../../domain/entities/coupon.dart';
import '../../domain/repositories/coupon_repository.dart';
import 'cart_state.dart';

final cartServiceProvider = Provider<CartService>((ref) => CartService());
final couponRepositoryProvider = Provider<CouponRepository>((ref) => CouponRepositoryImpl());

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier(ref.read(cartServiceProvider), ref.read(couponRepositoryProvider));
});

/// Pure derived value — recomputed automatically whenever cart items or the
/// applied coupon change. Not stored in [CartState] to avoid two sources of
/// truth for the same numbers.
final cartSummaryProvider = Provider<CartSummary>((ref) {
  final state = ref.watch(cartProvider);
  final subtotal = state.items.fold<double>(0, (sum, item) => sum + item.subtotal);
  return CartSummary.compute(subtotal: subtotal, coupon: state.appliedCoupon);
});

/// "You may also like" — full catalog minus anything already in the cart
/// or saved for later, ranked by protein content (same heuristic used on
/// Home's Best Sellers row) rather than randomly.
final recommendedForCartProvider = FutureProvider.autoDispose<List<Product>>((ref) async {
  final catalog = await ref.watch(catalogSnapshotProvider.future);
  final cartState = ref.watch(cartProvider);
  final excludedIds = {
    ...cartState.items.map((i) => i.product.id),
    ...cartState.savedForLater.map((i) => i.product.id),
  };
  final filtered = catalog.where((p) => !excludedIds.contains(p.id)).toList()
    ..sort((a, b) => b.proteinPer100g.compareTo(a.proteinPer100g));
  return filtered.take(10).toList();
});

class CartNotifier extends StateNotifier<CartState> {
  final CartService _cartService;
  final CouponRepository _couponRepository;

  CartNotifier(this._cartService, this._couponRepository) : super(const CartState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoadingFirst: true, clearError: true);
    try {
      final results = await Future.wait([
        _cartService.getCartItems(),
        _cartService.getSavedForLaterItems(),
      ]);
      state = state.copyWith(
        items: results[0].map(CartLineItem.fromRow).toList(),
        savedForLater: results[1].map(CartLineItem.fromRow).toList(),
        isLoadingFirst: false,
      );
    } catch (e) {
      state = state.copyWith(isLoadingFirst: false, error: e);
    }
  }

  Future<void> refresh() => load();

  Future<void> retry() => load();

  Future<void> incrementQuantity(CartLineItem item) async {
    if (!item.product.isAvailable) {
      state = state.copyWith(
        feedbackMessage: '${item.product.name} is currently out of stock.',
        feedbackIsError: true,
      );
      return;
    }
    await _updateQuantity(item, item.quantity + 1);
  }

  Future<void> decrementQuantity(CartLineItem item) async {
    await _updateQuantity(item, item.quantity - 1);
  }

  Future<void> _updateQuantity(CartLineItem item, int newQuantity) async {
    final previousItems = state.items;
    final updated = newQuantity <= 0
        ? previousItems.where((i) => i.id != item.id).toList()
        : previousItems
            .map((i) => i.id == item.id
                ? CartLineItem(id: i.id, product: i.product, quantity: newQuantity, isSavedForLater: false)
                : i)
            .toList();

    state = state.copyWith(items: updated);
    try {
      await _cartService.updateQuantity(item.id, newQuantity);
    } catch (_) {
      state = state.copyWith(items: previousItems); // rollback
    }
  }

  Future<void> removeItem(CartLineItem item) async {
    final previousItems = state.items;
    state = state.copyWith(items: previousItems.where((i) => i.id != item.id).toList());
    try {
      await _cartService.removeItem(item.id);
    } catch (_) {
      state = state.copyWith(items: previousItems); // rollback
    }
  }

  Future<void> removeSavedForLaterItem(CartLineItem item) async {
    final previousSaved = state.savedForLater;
    state = state.copyWith(savedForLater: previousSaved.where((i) => i.id != item.id).toList());
    try {
      await _cartService.removeItem(item.id);
    } catch (_) {
      state = state.copyWith(savedForLater: previousSaved); // rollback
    }
  }

  Future<void> saveForLater(CartLineItem item) async {
    final previousItems = state.items;
    final previousSaved = state.savedForLater;
    state = state.copyWith(
      items: previousItems.where((i) => i.id != item.id).toList(),
      savedForLater: [
        ...previousSaved,
        CartLineItem(id: item.id, product: item.product, quantity: item.quantity, isSavedForLater: true),
      ],
    );
    try {
      await _cartService.saveForLater(item.id);
    } catch (_) {
      state = state.copyWith(items: previousItems, savedForLater: previousSaved); // rollback
    }
  }

  Future<void> moveToCart(CartLineItem item) async {
    if (!item.product.isAvailable) {
      state = state.copyWith(
        feedbackMessage: '${item.product.name} is currently out of stock.',
        feedbackIsError: true,
      );
      return;
    }
    final previousItems = state.items;
    final previousSaved = state.savedForLater;
    state = state.copyWith(
      savedForLater: previousSaved.where((i) => i.id != item.id).toList(),
      items: [
        ...previousItems,
        CartLineItem(id: item.id, product: item.product, quantity: item.quantity, isSavedForLater: false),
      ],
    );
    try {
      await _cartService.moveToCart(item.id);
    } catch (_) {
      state = state.copyWith(items: previousItems, savedForLater: previousSaved); // rollback
    }
  }

  CouponValidationInput _buildValidationInput() {
    final subtotal = state.items.fold<double>(0, (sum, item) => sum + item.subtotal);
    final totalQuantity = state.items.fold<int>(0, (sum, item) => sum + item.quantity);
    final minUnitPrice = state.items.isEmpty
        ? 0.0
        : state.items.map((i) => i.product.price).reduce((a, b) => a < b ? a : b);
    return CouponValidationInput(
      subtotal: subtotal,
      totalQuantity: totalQuantity,
      minUnitPrice: minUnitPrice,
      productIds: state.items.map((i) => i.product.id).toSet(),
      categories: state.items.map((i) => i.product.category).toSet(),
    );
  }

  Future<void> applyCoupon(String code) async {
    state = state.copyWith(isApplyingCoupon: true, clearFeedbackMessage: true);
    final result = await _couponRepository.validate(code, _buildValidationInput());

    state = state.copyWith(
      isApplyingCoupon: false,
      feedbackMessage: result.message,
      feedbackIsError: !result.isSuccess,
      appliedCoupon: result.isSuccess ? result.coupon : state.appliedCoupon,
    );
  }

  /// "Best offer suggestion" — tries every known code against the current
  /// cart and applies whichever is worth the most, reusing the same
  /// validate() path a manually-typed code goes through.
  Future<void> applyBestOffer() async {
    if (state.items.isEmpty) return;
    state = state.copyWith(isApplyingCoupon: true, clearFeedbackMessage: true);
    final best = await _couponRepository.findBestOffer(_buildValidationInput());
    state = state.copyWith(
      isApplyingCoupon: false,
      feedbackMessage: best != null ? '${best.code} applied — best offer for your cart!' : 'No applicable offers right now.',
      feedbackIsError: best == null,
      appliedCoupon: best ?? state.appliedCoupon,
    );
  }

  void removeCoupon() {
    state = state.copyWith(clearCoupon: true, clearFeedbackMessage: true);
  }

}
