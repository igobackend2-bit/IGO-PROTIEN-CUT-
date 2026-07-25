import '../../../../models/address_model.dart';
import '../entities/pincode_check_result.dart';

abstract class AddressRepository {
  Future<List<Address>> fetchAddresses();

  Future<Address> addAddress(Address address);

  Future<Address> updateAddress(Address address);

  Future<void> setDefault(String addressId);

  /// Returns the newly-promoted default address, if deleting this one
  /// required promoting another (null otherwise).
  Future<Address?> deleteAddress(String addressId);

  Future<PincodeCheckResult> checkServiceability(String pincode);
}
