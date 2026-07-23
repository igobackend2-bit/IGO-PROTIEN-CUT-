import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';

class WishlistEmptyState extends StatelessWidget {
  final bool isSearchResult;
  const WishlistEmptyState({super.key, this.isSearchResult = false});

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
              decoration: const BoxDecoration(color: AppColors.surfaceLight, shape: BoxShape.circle),
              child: Icon(
                isSearchResult ? Icons.search_off_rounded : Icons.favorite_border_rounded,
                size: 64,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              isSearchResult ? 'No matches in your wishlist' : 'Your wishlist is empty',
              style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 8),
            Text(
              isSearchResult
                  ? 'Try a different search term.'
                  : 'Tap the heart on any product to save it here for later.',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
            ),
            if (!isSearchResult) ...[
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () => Navigator.pushNamed(context, '/products'),
                icon: const Icon(Icons.storefront_outlined, size: 18),
                label: Text('Browse Products', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
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
