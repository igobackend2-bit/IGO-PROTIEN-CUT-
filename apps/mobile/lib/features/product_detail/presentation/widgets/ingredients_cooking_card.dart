import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/product_model.dart';
import '../../../../utils/app_colors.dart';
import '../../data/services/product_detail_content_service.dart';

/// Ingredients, Cooking Tips and Storage Instructions in one card — grouped
/// together since they're all "how to handle this product" information.
class IngredientsCookingCard extends StatelessWidget {
  final Product product;
  const IngredientsCookingCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final ingredients = ProductDetailContentService.ingredientsFor(product);
    final tips = ProductDetailContentService.cookingTipsFor(product);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionHeader(Icons.grass_rounded, 'Ingredients'),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ingredients
                .map((i) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(i, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                    ))
                .toList(),
          ),
          const SizedBox(height: 20),
          _sectionHeader(Icons.soup_kitchen_rounded, 'Cooking Tips'),
          const SizedBox(height: 10),
          ...tips.map((tip) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 5),
                      child: Container(width: 5, height: 5, decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(tip, style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary, height: 1.4)),
                    ),
                  ],
                ),
              )),
          const SizedBox(height: 12),
          _sectionHeader(Icons.ac_unit_rounded, 'Storage Instructions'),
          const SizedBox(height: 8),
          Text(
            product.storageInstruction,
            style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primary, size: 16),
        const SizedBox(width: 8),
        Text(title, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
      ],
    );
  }
}
