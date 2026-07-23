import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/product_model.dart';
import '../../../../utils/app_colors.dart';
import '../../data/services/product_detail_content_service.dart';

class RecipeSuggestionsSection extends StatelessWidget {
  final Product product;
  const RecipeSuggestionsSection({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final ideas = ProductDetailContentService.recipeIdeasFor(product);
    if (ideas.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.menu_book_rounded, color: AppColors.primary, size: 18),
            const SizedBox(width: 8),
            Text('Recipe Ideas', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 76,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: ideas.length,
            itemBuilder: (context, index) {
              return Container(
                width: 160,
                margin: const EdgeInsets.only(right: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFFF3E0), Color(0xFFFFE8CC)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    const Text('🍽️', style: TextStyle(fontSize: 22)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        ideas[index],
                        style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: const Color(0xFF7A4A00)),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
