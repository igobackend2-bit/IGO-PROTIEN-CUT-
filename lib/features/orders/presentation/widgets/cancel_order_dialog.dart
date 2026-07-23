import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';

/// Returns the cancellation reason if the user confirms, null otherwise.
Future<String?> showCancelOrderDialog(BuildContext context) async {
  const reasons = [
    'Ordered by mistake',
    'Found a better price elsewhere',
    'Delivery is taking too long',
    'Changed my mind',
    'Other',
  ];
  String selected = reasons.first;

  return showDialog<String>(
    context: context,
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, setState) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Cancel Order?', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Please tell us why:', style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary)),
            const SizedBox(height: 8),
            ...reasons.map((reason) => RadioListTile<String>(
                  value: reason,
                  groupValue: selected,
                  onChanged: (v) => setState(() => selected = v!),
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  title: Text(reason, style: GoogleFonts.outfit(fontSize: 13)),
                  activeColor: AppColors.primary,
                )),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text('Keep Order', style: GoogleFonts.outfit(color: AppColors.textSecondary))),
          TextButton(
            onPressed: () => Navigator.pop(ctx, selected),
            child: Text('Cancel Order', style: GoogleFonts.outfit(color: AppColors.error, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    ),
  );
}
