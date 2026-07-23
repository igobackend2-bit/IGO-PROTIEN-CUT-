import 'package:flutter/foundation.dart';

import '../../domain/entities/cart_line_item.dart';
import '../../domain/entities/coupon.dart';

@immutable
class CartState {
  final List<CartLineItem> items;
  final List<CartLineItem> savedForLater;
  final bool isLoadingFirst;
  final Object? error;

  final AppliedCoupon? appliedCoupon;
  final bool isApplyingCoupon;

  /// Generic one-shot feedback surfaced as a snackbar by the screen —
  /// coupon apply/remove results, stock-validation messages, etc. Not
  /// coupon-specific despite living next to coupon state.
  final String? feedbackMessage;
  final bool feedbackIsError;

  final bool isCheckingOut;

  const CartState({
    this.items = const [],
    this.savedForLater = const [],
    this.isLoadingFirst = true,
    this.error,
    this.appliedCoupon,
    this.isApplyingCoupon = false,
    this.feedbackMessage,
    this.feedbackIsError = false,
    this.isCheckingOut = false,
  });

  bool get isEmpty => !isLoadingFirst && error == null && items.isEmpty;

  CartState copyWith({
    List<CartLineItem>? items,
    List<CartLineItem>? savedForLater,
    bool? isLoadingFirst,
    Object? error,
    bool clearError = false,
    AppliedCoupon? appliedCoupon,
    bool clearCoupon = false,
    bool? isApplyingCoupon,
    String? feedbackMessage,
    bool clearFeedbackMessage = false,
    bool? feedbackIsError,
    bool? isCheckingOut,
  }) {
    return CartState(
      items: items ?? this.items,
      savedForLater: savedForLater ?? this.savedForLater,
      isLoadingFirst: isLoadingFirst ?? this.isLoadingFirst,
      error: clearError ? null : (error ?? this.error),
      appliedCoupon: clearCoupon ? null : (appliedCoupon ?? this.appliedCoupon),
      isApplyingCoupon: isApplyingCoupon ?? this.isApplyingCoupon,
      feedbackMessage: clearFeedbackMessage ? null : (feedbackMessage ?? this.feedbackMessage),
      feedbackIsError: feedbackIsError ?? this.feedbackIsError,
      isCheckingOut: isCheckingOut ?? this.isCheckingOut,
    );
  }
}
