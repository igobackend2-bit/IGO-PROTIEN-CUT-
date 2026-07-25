import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/product_filter_state.dart';

/// Horizontal row of removable chips summarizing every active filter, so
/// the user never has to reopen the filter sheet just to see what's on.
class ActiveFilterChipsRow extends StatelessWidget {
  final ProductFilterState filters;
  final ValueChanged<ProductFilterState> onChanged;

  const ActiveFilterChipsRow({super.key, required this.filters, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    if (!filters.hasAnyFilter) return const SizedBox.shrink();

    final chips = <Widget>[];

    for (final type in filters.proteinTypes) {
      chips.add(_chip(type, () {
        onChanged(filters.copyWith(proteinTypes: {...filters.proteinTypes}..remove(type)));
      }));
    }
    for (final bucket in filters.weightBuckets) {
      chips.add(_chip(bucket.label, () {
        onChanged(filters.copyWith(weightBuckets: {...filters.weightBuckets}..remove(bucket)));
      }));
    }
    for (final brand in filters.brands) {
      chips.add(_chip(brand, () {
        onChanged(filters.copyWith(brands: {...filters.brands}..remove(brand)));
      }));
    }
    if (filters.priceRange != null) {
      final r = filters.priceRange!;
      chips.add(_chip('₹${r.start.toStringAsFixed(0)} - ₹${r.end.toStringAsFixed(0)}', () {
        onChanged(filters.copyWith(clearPriceRange: true));
      }));
    }
    if (filters.onlyAvailable) {
      chips.add(_chip('In Stock', () {
        onChanged(filters.copyWith(onlyAvailable: false));
      }));
    }
    if (filters.minRating != null) {
      chips.add(_chip('${filters.minRating!.toStringAsFixed(0)}★ & up', () {
        onChanged(filters.copyWith(clearMinRating: true));
      }));
    }

    return SizedBox(
      height: 40,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          ...chips,
          GestureDetector(
            onTap: () => onChanged(filters.clearAllFilters()),
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              child: Text(
                'Clear all',
                style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.error),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _chip(String label, VoidCallback onRemove) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Chip(
        label: Text(label, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
        backgroundColor: AppColors.surfaceLight,
        deleteIcon: const Icon(Icons.close_rounded, size: 15, color: AppColors.primary),
        onDeleted: onRemove,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.inputBorder),
        ),
        visualDensity: VisualDensity.compact,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }
}
