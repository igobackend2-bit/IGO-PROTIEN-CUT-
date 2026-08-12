import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/product_model.dart';
import '../../../../utils/app_colors.dart';
import '../../domain/entities/nutrition_facts.dart';

class NutritionFactsCard extends StatelessWidget {
  final Product product;
  const NutritionFactsCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final facts = NutritionFacts.fromProduct(product);

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
          Row(
            children: [
              const Icon(Icons.local_fire_department_rounded, color: AppColors.primary, size: 18),
              const SizedBox(width: 8),
              Text(
                'Nutrition Facts',
                style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),
              const Spacer(),
              Text(
                'per 100g',
                style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _stat('Calories', facts.caloriesKcal.toStringAsFixed(0), 'kcal'),
              _divider(),
              _stat('Protein', facts.proteinG.toStringAsFixed(1), 'g'),
              _divider(),
              _stat('Fat', facts.fatG.toStringAsFixed(1), 'g'),
              _divider(),
              _stat('Carbs', facts.carbsG.toStringAsFixed(0), 'g'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _divider() => Container(width: 1, height: 40, color: AppColors.divider);

  Widget _stat(String label, String value, String unit) {
    return Expanded(
      child: Column(
        children: [
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: value,
                  style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                TextSpan(
                  text: unit,
                  style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textHint),
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
