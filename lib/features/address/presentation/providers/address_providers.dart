import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../models/address_model.dart';
import '../../data/repositories/address_repository_impl.dart';
import '../../data/repositories/location_repository_impl.dart';
import '../../domain/repositories/address_repository.dart';
import '../../domain/repositories/location_repository.dart';
import 'address_list_state.dart';

final addressRepositoryProvider = Provider<AddressRepository>((ref) => AddressRepositoryImpl());
final locationRepositoryProvider = Provider<LocationRepository>((ref) => LocationRepositoryImpl());

final addressListProvider = StateNotifierProvider<AddressListNotifier, AddressListState>((ref) {
  return AddressListNotifier(ref.read(addressRepositoryProvider));
});

/// Handy for the future Checkout integration this module is built to
/// support — one place to ask "what address should this order ship to".
final defaultAddressProvider = Provider<Address?>((ref) {
  return ref.watch(addressListProvider).defaultAddress;
});

class AddressListNotifier extends StateNotifier<AddressListState> {
  final AddressRepository _repository;

  AddressListNotifier(this._repository) : super(const AddressListState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoadingFirst: true, clearError: true);
    try {
      final addresses = await _repository.fetchAddresses();
      state = state.copyWith(addresses: addresses, isLoadingFirst: false);
    } catch (e) {
      state = state.copyWith(isLoadingFirst: false, error: e);
    }
  }

  Future<void> refresh() => load();
  Future<void> retry() => load();

  Future<bool> addAddress(Address draft) async {
    try {
      await _repository.addAddress(draft);
      await load(); // pick up server-assigned id + any default-swap it triggered
      state = state.copyWith(feedbackMessage: 'Address added.', feedbackIsError: false);
      return true;
    } catch (e) {
      state = state.copyWith(feedbackMessage: 'Could not add address. Please try again.', feedbackIsError: true);
      return false;
    }
  }

  Future<bool> updateAddress(Address address) async {
    final previous = state.addresses;
    final optimistic = address.isDefault
        ? previous.map((a) => a.id == address.id ? address : a.copyWith(isDefault: false)).toList()
        : previous.map((a) => a.id == address.id ? address : a).toList();
    state = state.copyWith(addresses: optimistic);

    try {
      await _repository.updateAddress(address);
      state = state.copyWith(feedbackMessage: 'Address updated.', feedbackIsError: false);
      return true;
    } catch (e) {
      state = state.copyWith(addresses: previous, feedbackMessage: 'Could not save changes. Please try again.', feedbackIsError: true);
      return false;
    }
  }

  Future<void> setDefault(Address address) async {
    if (address.isDefault) return;
    final previous = state.addresses;
    state = state.copyWith(
      addresses: previous.map((a) => a.copyWith(isDefault: a.id == address.id)).toList(),
    );
    try {
      await _repository.setDefault(address.id);
    } catch (e) {
      state = state.copyWith(addresses: previous, feedbackMessage: 'Could not set default address.', feedbackIsError: true);
    }
  }

  Future<void> deleteAddress(Address address) async {
    final previous = state.addresses;
    state = state.copyWith(addresses: previous.where((a) => a.id != address.id).toList());
    try {
      await _repository.deleteAddress(address.id);
      // If the deleted address was default, the repository auto-promotes
      // another one server-side — reconcile by refetching rather than
      // duplicating that promotion logic here.
      if (address.isDefault) await load();
    } catch (e) {
      state = state.copyWith(addresses: previous, feedbackMessage: 'Could not delete address. Please try again.', feedbackIsError: true);
    }
  }
}
