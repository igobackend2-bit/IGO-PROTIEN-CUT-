import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../models/address_model.dart';
import '../../../../services/cart_service.dart';
import '../../../../services/order_service.dart';
import '../../../../services/payment_service.dart';
import '../../../address/presentation/providers/address_providers.dart';
import '../../../cart/presentation/providers/cart_providers.dart';
import '../../../orders/presentation/providers/order_providers.dart';
import '../../data/repositories/delivery_slot_repository_impl.dart';
import '../../domain/entities/delivery_slot.dart';
import '../../domain/entities/payment_method_option.dart';
import '../../domain/repositories/delivery_slot_repository.dart';
import 'checkout_state.dart';

final deliverySlotRepositoryProvider =
    Provider<DeliverySlotRepository>((ref) => DeliverySlotRepositoryImpl());

final checkoutProvider = StateNotifierProvider.autoDispose<CheckoutNotifier, CheckoutState>((ref) {
  return CheckoutNotifier(ref);
});

class CheckoutNotifier extends StateNotifier<CheckoutState> {
  final Ref _ref;

  CheckoutNotifier(this._ref) : super(const CheckoutState()) {
    _initialize();
  }

  void _initialize() {
    final slots = _ref.read(deliverySlotRepositoryProvider).generateSlots();
    final defaultAddress = _ref.read(defaultAddressProvider);
    state = state.copyWith(slots: slots, selectedAddress: defaultAddress);
    if (defaultAddress != null) _checkPincode(defaultAddress);
  }

  // ─── Address step ────────────────────────────────────────────────────

  Future<void> selectAddress(Address address) async {
    state = state.copyWith(
      selectedAddress: address,
      pincodeStatus: PincodeCheckStatus.checking,
      clearError: true,
    );
    await _checkPincode(address);
  }

  Future<void> _checkPincode(Address address) async {
    state = state.copyWith(pincodeStatus: PincodeCheckStatus.checking);
    try {
      final result = await _ref.read(addressRepositoryProvider).checkServiceability(address.pincode);
      state = state.copyWith(
        pincodeStatus: result.isServiceable ? PincodeCheckStatus.serviceable : PincodeCheckStatus.notServiceable,
        pincodeMessage: result.message,
      );
    } catch (_) {
      state = state.copyWith(
        pincodeStatus: PincodeCheckStatus.notServiceable,
        pincodeMessage: "Couldn't verify delivery for this address. Please try again.",
      );
    }
  }

  // ─── Delivery slot step ──────────────────────────────────────────────

  void selectSlot(DeliverySlot slot) {
    if (!slot.isAvailable) return;
    state = state.copyWith(selectedSlot: slot, clearError: true);
  }

  // ─── Payment step ────────────────────────────────────────────────────

  void selectPaymentMethod(PaymentMethodOption method) {
    if (!method.isAvailable) return;
    state = state.copyWith(paymentMethod: method, clearError: true);
  }

  // ─── Review step ─────────────────────────────────────────────────────

  void setDeliveryInstructions(String value) {
    state = state.copyWith(deliveryInstructions: value);
  }

  void setGiftNote(String value) {
    state = state.copyWith(giftNote: value);
  }

  // ─── Step navigation ─────────────────────────────────────────────────

  bool get _canLeaveCurrentStep {
    switch (state.step) {
      case CheckoutStep.address:
        return state.canProceedFromAddress;
      case CheckoutStep.deliverySlot:
        return state.canProceedFromSlot;
      case CheckoutStep.payment:
        return state.canProceedFromPayment;
      case CheckoutStep.review:
        return true;
    }
  }

  void nextStep() {
    if (!_canLeaveCurrentStep) {
      state = state.copyWith(errorMessage: _validationMessageForCurrentStep());
      return;
    }
    final steps = CheckoutStep.values;
    final currentIndex = steps.indexOf(state.step);
    if (currentIndex < steps.length - 1) {
      state = state.copyWith(step: steps[currentIndex + 1], clearError: true);
    }
  }

  void previousStep() {
    final steps = CheckoutStep.values;
    final currentIndex = steps.indexOf(state.step);
    if (currentIndex > 0) {
      state = state.copyWith(step: steps[currentIndex - 1], clearError: true);
    }
  }

  /// Lets the step indicator jump directly backward to any already-visited
  /// step; forward jumps still have to go through nextStep()'s validation.
  void goToStep(CheckoutStep target) {
    final steps = CheckoutStep.values;
    if (steps.indexOf(target) <= steps.indexOf(state.step)) {
      state = state.copyWith(step: target, clearError: true);
    }
  }

  String _validationMessageForCurrentStep() {
    switch (state.step) {
      case CheckoutStep.address:
        if (state.selectedAddress == null) return 'Please select a delivery address.';
        if (state.pincodeStatus == PincodeCheckStatus.notServiceable) {
          return state.pincodeMessage ?? 'This address is not serviceable yet.';
        }
        return 'Please wait while we check this address.';
      case CheckoutStep.deliverySlot:
        return 'Please choose a delivery slot.';
      case CheckoutStep.payment:
        return 'Please choose a payment method.';
      case CheckoutStep.review:
        return '';
    }
  }

  // ─── Order placement ─────────────────────────────────────────────────

  Future<bool> placeOrder() async {
    if (!state.canPlaceOrder || state.isPlacingOrder) return false;

    final cartState = _ref.read(cartProvider);
    if (cartState.items.isEmpty) {
      state = state.copyWith(errorMessage: 'Your cart is empty.');
      return false;
    }

    final summary = _ref.read(cartSummaryProvider);
    state = state.copyWith(isPlacingOrder: true, clearError: true);

    try {
      final order = await OrderService().createOrder(
        items: cartState.items
            .map((i) => OrderLineInput(productId: i.product.id, quantity: i.quantity, price: i.product.price))
            .toList(),
        totalPrice: summary.grandTotal,
        addressId: state.selectedAddress?.id,
        deliverySlotLabel: state.selectedSlot == null
            ? null
            : '${state.selectedSlot!.dayLabel} ${state.selectedSlot!.timeRangeLabel}',
        paymentMethod: state.paymentMethod.label,
        deliveryInstructions: state.deliveryInstructions,
        giftNote: state.giftNote,
        couponCode: summary.appliedCoupon?.code,
        discountAmount: summary.discount,
        deliveryFee: summary.deliveryFee,
        taxAmount: summary.tax,
      );

      try {
        await PaymentService().createPayment(
          orderId: order.id,
          amount: order.totalPrice,
          paymentMethod: state.paymentMethod.label,
        );
      } catch (_) {
        // Payment History simply won't show this order if the payments
        // table isn't migrated yet — never block order placement on it.
      }

      await CartService().clearCart();
      _ref.invalidate(cartProvider);
      _ref.invalidate(ordersListProvider);

      state = state.copyWith(isPlacingOrder: false, placedOrder: order);
      return true;
    } catch (e) {
      state = state.copyWith(isPlacingOrder: false, errorMessage: 'Could not place your order. Please try again.');
      return false;
    }
  }
}
