import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';

class DiscoveryEmptyState extends StatelessWidget {
  final bool hasActiveFilters;
  final VoidCallback? onClearFilters;

  const DiscoveryEmptyState({super.key, this.hasActiveFilters = false, this.onClearFilters});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 60),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(color: AppColors.surfaceLight, shape: BoxShape.circle),
              child: Icon(
                hasActiveFilters ? Icons.filter_alt_off_rounded : Icons.search_off_rounded,
                size: 56,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              hasActiveFilters ? 'No products match your filters' : 'No products found',
              style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              hasActiveFilters
                  ? 'Try widening your filters or clearing them to see more.'
                  : "We couldn't find anything for that search. Try a different term.",
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
            ),
            if (hasActiveFilters && onClearFilters != null) ...[
              const SizedBox(height: 20),
              OutlinedButton.icon(
                onPressed: onClearFilters,
                icon: const Icon(Icons.filter_alt_off_outlined, size: 18),
                label: Text('Clear Filters', style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.primary),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
