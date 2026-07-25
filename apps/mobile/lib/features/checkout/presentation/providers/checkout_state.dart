import 'package:flutter/foundation.dart';

import '../../../../models/address_model.dart';
import '../../../../services/order_service.dart';
import '../../domain/entities/delivery_slot.dart';
import '../../domain/entities/payment_method_option.dart';

enum CheckoutStep { address, deliverySlot, payment, review }

enum PincodeCheckStatus { unchecked, checking, serviceable, notServiceable }

@immutable
class CheckoutState {
  final CheckoutStep step;
  final List<DeliverySlot> slots;

  final Address? selectedAddress;
  final PincodeCheckStatus pincodeStatus;
  final String? pincodeMessage;

  final DeliverySlot? selectedSlot;
  final PaymentMethodOption paymentMethod;

  final String deliveryInstructions;
  final String giftNote;

  final bool isPlacingOrder;
  final String? errorMessage;
  final CreatedOrder? placedOrder;

  const CheckoutState({
    this.step = CheckoutStep.address,
    this.slots = const [],
    this.selectedAddress,
    this.pincodeStatus = PincodeCheckStatus.unchecked,
    this.pincodeMessage,
    this.selectedSlot,
    this.paymentMethod = PaymentMethodOption.cashOnDelivery,
    this.deliveryInstructions = '',
    this.giftNote = '',
    this.isPlacingOrder = false,
    this.errorMessage,
    this.placedOrder,
  });

  bool get canProceedFromAddress =>
      selectedAddress != null && pincodeStatus == PincodeCheckStatus.serviceable;

  bool get canProceedFromSlot => selectedSlot != null && selectedSlot!.isAvailable;

  bool get canProceedFromPayment => paymentMethod.isAvailable;

  bool get canPlaceOrder => canProceedFromAddress && canProceedFromSlot && canProceedFromPayment;

  CheckoutState copyWith({
    CheckoutStep? step,
    List<DeliverySlot>? slots,
    Address? selectedAddress,
    PincodeCheckStatus? pincodeStatus,
    String? pincodeMessage,
    DeliverySlot? selectedSlot,
    PaymentMethodOption? paymentMethod,
    String? deliveryInstructions,
    String? giftNote,
    bool? isPlacingOrder,
    String? errorMessage,
    bool clearError = false,
    CreatedOrder? placedOrder,
  }) {
    return CheckoutState(
      step: step ?? this.step,
      slots: slots ?? this.slots,
      selectedAddress: selectedAddress ?? this.selectedAddress,
      pincodeStatus: pincodeStatus ?? this.pincodeStatus,
      pincodeMessage: pincodeMessage ?? this.pincodeMessage,
      selectedSlot: selectedSlot ?? this.selectedSlot,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      deliveryInstructions: deliveryInstructions ?? this.deliveryInstructions,
      giftNote: giftNote ?? this.giftNote,
      isPlacingOrder: isPlacingOrder ?? this.isPlacingOrder,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      placedOrder: placedOrder ?? this.placedOrder,
    );
  }
}
