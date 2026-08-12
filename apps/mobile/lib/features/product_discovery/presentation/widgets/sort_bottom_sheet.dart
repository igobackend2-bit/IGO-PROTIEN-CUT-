import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/product_sort_option.dart';

Future<ProductSortOption?> showSortBottomSheet(BuildContext context, ProductSortOption current) {
  return showModalBottomSheet<ProductSortOption>(
    context: context,
    backgroundColor: Colors.white,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
    builder: (context) {
      return SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text('Sort By', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800)),
              ),
              const SizedBox(height: 8),
              ...ProductSortOption.values.map((option) {
                final isSelected = option == current;
                return ListTile(
                  onTap: () => Navigator.pop(context, option),
                  title: Text(
                    option.label,
                    style: GoogleFonts.outfit(
                      fontSize: 14,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                      color: isSelected ? AppColors.primary : AppColors.textPrimary,
                    ),
                  ),
                  trailing: isSelected ? const Icon(Icons.check_rounded, color: AppColors.primary) : null,
                );
              }),
            ],
          ),
        ),
      );
    },
  );
}
