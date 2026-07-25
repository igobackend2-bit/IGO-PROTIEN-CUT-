import 'package:flutter/foundation.dart';

import '../../../../models/address_model.dart';

@immutable
class AddressListState {
  final List<Address> addresses;
  final bool isLoadingFirst;
  final Object? error;
  final String? feedbackMessage;
  final bool feedbackIsError;

  const AddressListState({
    this.addresses = const [],
    this.isLoadingFirst = true,
    this.error,
    this.feedbackMessage,
    this.feedbackIsError = false,
  });

  bool get isEmpty => !isLoadingFirst && error == null && addresses.isEmpty;

  Address? get defaultAddress {
    for (final a in addresses) {
      if (a.isDefault) return a;
    }
    return null;
  }

  AddressListState copyWith({
    List<Address>? addresses,
    bool? isLoadingFirst,
    Object? error,
    bool clearError = false,
    String? feedbackMessage,
    bool clearFeedbackMessage = false,
    bool? feedbackIsError,
  }) {
    return AddressListState(
      addresses: addresses ?? this.addresses,
      isLoadingFirst: isLoadingFirst ?? this.isLoadingFirst,
      error: clearError ? null : (error ?? this.error),
      feedbackMessage: clearFeedbackMessage ? null : (feedbackMessage ?? this.feedbackMessage),
      feedbackIsError: feedbackIsError ?? this.feedbackIsError,
    );
  }
}
