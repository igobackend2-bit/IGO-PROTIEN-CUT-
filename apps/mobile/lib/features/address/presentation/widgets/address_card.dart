import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/address_model.dart';
import '../../../../utils/app_colors.dart';
import 'delete_address_dialog.dart';

class AddressCard extends StatelessWidget {
  final Address address;
  final VoidCallback onTap;
  final VoidCallback onDelete;
  final VoidCallback onSetDefault;

  const AddressCard({
    super.key,
    required this.address,
    required this.onTap,
    required this.onDelete,
    required this.onSetDefault,
  });

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
    return Dismissible(
      key: ValueKey('address-${address.id}'),
      direction: DismissDirection.endToStart,
      confirmDismiss: (_) => showDeleteAddressDialog(context, address),
      onDismissed: (_) => onDelete(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(color: AppColors.error, borderRadius: BorderRadius.circular(16)),
        child: const Icon(Icons.delete_outline_rounded, color: Colors.white),
      ),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: address.isDefault ? AppColors.primary : AppColors.divider, width: address.isDefault ? 1.5 : 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppColors.surfaceLight, shape: BoxShape.circle),
                    child: Icon(_typeIcon, color: AppColors.primary, size: 18),
                  ),
                  const SizedBox(width: 10),
                  Text(address.addressType.label, style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  if (address.isDefault) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                      child: Text('DEFAULT', style: GoogleFonts.outfit(fontSize: 9.5, fontWeight: FontWeight.w800, color: AppColors.primary, letterSpacing: 0.5)),
                    ),
                  ],
                  const Spacer(),
                  Icon(Icons.edit_outlined, size: 16, color: AppColors.textHint),
                ],
              ),
              const SizedBox(height: 12),
              Text(address.fullName, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 3),
              Text(
                address.formattedOneLine,
                style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary, height: 1.4),
              ),
              const SizedBox(height: 4),
              Text(address.phone, style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textHint)),
              if (!address.isDefault) ...[
                const SizedBox(height: 10),
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton(
                    onPressed: onSetDefault,
                    style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(0, 0), tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                    child: Text('Set as Default', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
