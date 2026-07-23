import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/address_model.dart';

/// Shared address service, following the same plain-Supabase-wrapper
/// pattern as CartService/OrderService/ProductService. Owns the "only one
/// default address" invariant so every caller (list screen, form screen,
/// future Checkout) gets it for free instead of re-implementing it.
class AddressService {
  final SupabaseClient _client = Supabase.instance.client;

  /// Current user's addresses, default first, then most-recently-updated.
  Future<List<Address>> fetchAddresses() async {
    final user = _client.auth.currentUser;
    if (user == null) return [];

    final response = await _client
        .from('addresses')
        .select()
        .eq('user_id', user.id)
        .order('is_default', ascending: false)
        .order('updated_at', ascending: false);

    return (response as List).map((e) => Address.fromMap(e as Map<String, dynamic>)).toList();
  }

  Future<Address> addAddress(Address address) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to add an address.');

    final existing = await fetchAddresses();
    // First address is always the default, regardless of the toggle —
    // there must be a default whenever at least one address exists so
    // Checkout always has something to use.
    final isDefault = existing.isEmpty || address.isDefault;

    if (isDefault && existing.isNotEmpty) {
      await _clearDefaultFlag(user.id);
    }

    final inserted = await _client
        .from('addresses')
        .insert({...address.toInsertMap(userId: user.id), 'is_default': isDefault})
        .select()
        .single();

    return Address.fromMap(inserted);
  }

  Future<Address> updateAddress(Address address) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in to update this address.');

    if (address.isDefault) {
      await _clearDefaultFlag(user.id, exceptId: address.id);
    }

    final updated = await _client
        .from('addresses')
        .update({...address.toInsertMap(userId: user.id), 'updated_at': DateTime.now().toIso8601String()})
        .eq('id', address.id)
        .select()
        .single();

    return Address.fromMap(updated);
  }

  Future<void> setDefault(String addressId) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in.');

    await _clearDefaultFlag(user.id, exceptId: addressId);
    await _client.from('addresses').update({'is_default': true}).eq('id', addressId);
  }

  /// Deletes the address. If it was the default and other addresses
  /// remain, the most-recently-updated remaining one is promoted to
  /// default automatically — Checkout should never be left without a
  /// default while addresses still exist.
  Future<Address?> deleteAddress(String addressId) async {
    final user = _client.auth.currentUser;
    if (user == null) throw Exception('Please log in.');

    final target = await _client.from('addresses').select().eq('id', addressId).maybeSingle();
    final wasDefault = target?['is_default'] == true;

    await _client.from('addresses').delete().eq('id', addressId);

    if (!wasDefault) return null;

    final remaining = await fetchAddresses();
    if (remaining.isEmpty) return null;

    final promoted = remaining.first;
    await setDefault(promoted.id);
    return promoted.copyWith(isDefault: true);
  }

  Future<void> _clearDefaultFlag(String userId, {String? exceptId}) async {
    var query = _client.from('addresses').update({'is_default': false}).eq('user_id', userId);
    if (exceptId != null) query = query.neq('id', exceptId);
    await query;
  }
}
