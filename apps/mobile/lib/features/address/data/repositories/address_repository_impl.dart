import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../../models/address_model.dart';
import '../../../../services/address_service.dart';
import '../../domain/entities/pincode_check_result.dart';
import '../../domain/repositories/address_repository.dart';

class AddressRepositoryImpl implements AddressRepository {
  final AddressService _addressService;
  final SupabaseClient _client;

  AddressRepositoryImpl({AddressService? addressService, SupabaseClient? client})
      : _addressService = addressService ?? AddressService(),
        _client = client ?? Supabase.instance.client;

  @override
  Future<List<Address>> fetchAddresses() => _addressService.fetchAddresses();

  @override
  Future<Address> addAddress(Address address) => _addressService.addAddress(address);

  @override
  Future<Address> updateAddress(Address address) => _addressService.updateAddress(address);

  @override
  Future<void> setDefault(String addressId) => _addressService.setDefault(addressId);

  @override
  Future<Address?> deleteAddress(String addressId) => _addressService.deleteAddress(addressId);

  /// Checks a `serviceable_pincodes` table if the backend has one
  /// (feature-detected, same pattern as Cart's coupons table). Without it,
  /// every correctly-formatted pincode is treated as serviceable rather
  /// than blocking checkout on data that doesn't exist yet.
  @override
  Future<PincodeCheckResult> checkServiceability(String pincode) async {
    try {
      final row = await _client
          .from('serviceable_pincodes')
          .select('pincode')
          .eq('pincode', pincode)
          .eq('is_active', true)
          .maybeSingle();

      return row != null
          ? const PincodeCheckResult(isServiceable: true, message: 'We deliver to this area!')
          : const PincodeCheckResult(isServiceable: false, message: "Sorry, we don't deliver here yet.");
    } catch (_) {
      return const PincodeCheckResult(isServiceable: true, message: 'We deliver to this area!');
    }
  }
}
