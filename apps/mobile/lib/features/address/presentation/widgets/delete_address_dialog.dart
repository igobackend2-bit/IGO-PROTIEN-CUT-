import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/address_model.dart';
import '../../../../utils/app_colors.dart';

Future<bool> showDeleteAddressDialog(BuildContext context, Address address) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text('Delete Address?', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
      content: Text(
        address.isDefault
            ? 'This is your default address. Another saved address will automatically become the default.'
            : 'Are you sure you want to delete this address?',
        style: GoogleFonts.outfit(color: AppColors.textSecondary, fontSize: 13.5, height: 1.4),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: Text('Cancel', style: GoogleFonts.outfit(color: AppColors.textSecondary)),
        ),
        TextButton(
          onPressed: () => Navigator.pop(ctx, true),
          child: Text('Delete', style: GoogleFonts.outfit(color: AppColors.error, fontWeight: FontWeight.w700)),
        ),
      ],
    ),
  );
  return confirmed ?? false;
}
