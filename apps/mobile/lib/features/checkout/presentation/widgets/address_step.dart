import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/address_model.dart';
import '../../../../utils/app_colors.dart';
import '../../../address/presentation/providers/address_providers.dart';
import '../../../address/presentation/screens/address_form_screen.dart';
import '../../../address/presentation/widgets/address_empty_state.dart';
import '../../../address/presentation/widgets/address_error_state.dart';
import '../../../address/presentation/widgets/address_skeleton.dart';
import '../providers/checkout_providers.dart';
import '../providers/checkout_state.dart';

/// Reuses the Address module's own list/CRUD (addressListProvider,
/// AddressFormScreen) — this step is purely a selector on top of it, not a
/// second address list implementation.
class AddressStep extends ConsumerWidget {
  const AddressStep({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addressState = ref.watch(addressListProvider);
    final checkoutState = ref.watch(checkoutProvider);
    final notifier = ref.read(checkoutProvider.notifier);

    if (addressState.isLoadingFirst) return const AddressSkeleton();
    if (addressState.error != null) {
      return AddressErrorState(onRetry: ref.read(addressListProvider.notifier).retry);
    }
    if (addressState.isEmpty) {
      return AddressEmptyState(onAddAddress: () => _openAddAddress(context, ref));
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Deliver to', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        const SizedBox(height: 12),
        ...addressState.addresses.map((address) {
          final isSelected = checkoutState.selectedAddress?.id == address.id;
          return _SelectableAddressTile(
            address: address,
            isSelected: isSelected,
            onTap: () => notifier.selectAddress(address),
          );
        }),
        if (checkoutState.selectedAddress != null) _pincodeStatusBanner(checkoutState),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () => _openAddAddress(context, ref),
          icon: const Icon(Icons.add_location_alt_outlined, size: 18),
          label: Text('Add New Address', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            side: const BorderSide(color: AppColors.primary),
            minimumSize: const Size(double.infinity, 48),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ],
    );
  }

  Future<void> _openAddAddress(BuildContext context, WidgetRef ref) async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => const AddressFormScreen()));
    // A newly-added address may now be the default — reflect it as selected.
    final refreshed = ref.read(addressListProvider).defaultAddress;
    if (refreshed != null) {
      await ref.read(checkoutProvider.notifier).selectAddress(refreshed);
    }
  }

  Widget _pincodeStatusBanner(CheckoutState state) {
    switch (state.pincodeStatus) {
      case PincodeCheckStatus.checking:
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 8),
          child: Row(
            children: [
              SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
              SizedBox(width: 8),
              Text('Checking delivery availability...'),
            ],
          ),
        );
      case PincodeCheckStatus.serviceable:
      case PincodeCheckStatus.notServiceable:
        final isOk = state.pincodeStatus == PincodeCheckStatus.serviceable;
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            children: [
              Icon(isOk ? Icons.check_circle_rounded : Icons.cancel_rounded, size: 16, color: isOk ? AppColors.success : AppColors.error),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  state.pincodeMessage ?? '',
                  style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w600, color: isOk ? AppColors.success : AppColors.error),
                ),
              ),
            ],
          ),
        );
      case PincodeCheckStatus.unchecked:
        return const SizedBox.shrink();
    }
  }
}

class _SelectableAddressTile extends StatelessWidget {
  final Address address;
  final bool isSelected;
  final VoidCallback onTap;

  const _SelectableAddressTile({required this.address, required this.isSelected, required this.onTap});

  IconData get _typeIcon {
    switch (address.addressType) {
      case AddressType.home:
        return Icons.home_rounded;
      case AddressType.office:
        return Icons.business_rounded;
      case AddressType.other:
        return Icons.place_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.divider, width: isSelected ? 1.5 : 1),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(isSelected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded, color: AppColors.primary, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(_typeIcon, size: 14, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Text(address.addressType.label, style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w800)),
                      if (address.isDefault) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(5)),
                          child: Text('DEFAULT', style: GoogleFonts.outfit(fontSize: 8.5, fontWeight: FontWeight.w800, color: AppColors.primary)),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(address.fullName, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(address.formattedOneLine, style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary, height: 1.4)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
