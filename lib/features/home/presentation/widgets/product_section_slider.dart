import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/product_model.dart';
import '../../../../utils/app_colors.dart';
import '../../domain/entities/home_data.dart';
import 'home_product_card.dart';

/// Generic "title + See all + horizontal product list" section reused by
/// Featured, Best Sellers, Today's Deals, Recommended and Recently Viewed —
/// avoids re-implementing the same slider six times.
class ProductSectionSlider extends StatelessWidget {
  final String title;
  final String? subtitle;
  final List<Product> products;
  final HomeData homeData;
  final String? seeAllCategory;
  final Widget? trailing;

  const ProductSectionSlider({
    super.key,
    required this.title,
    required this.products,
    required this.homeData,
    this.subtitle,
    this.seeAllCategory,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    if (products.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                    ),
                    if (subtitle != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          subtitle!,
                          style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary),
                        ),
                      ),
                  ],
                ),
              ),
              trailing ??
                  GestureDetector(
                    onTap: () => Navigator.pushNamed(context, '/products', arguments: seeAllCategory),
                    child: Text(
                      'See all',
                      style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary),
                    ),
                  ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 200,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: products.length,
            itemBuilder: (context, index) {
              final product = products[index];
              final discount = homeData.discountFor(product.id);
              return Padding(
                padding: const EdgeInsets.only(right: 12),
                child: HomeProductCard(
                  product: product,
                  discountPercent: discount,
                  originalPrice: discount > 0 ? homeData.strikeThroughPriceFor(product) : null,
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
