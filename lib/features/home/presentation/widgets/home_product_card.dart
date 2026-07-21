import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/product_model.dart';
import '../../../../services/cart_service.dart';
import '../../../../utils/app_colors.dart';
import '../providers/home_providers.dart';
import 'home_shimmer.dart';

/// Reusable product card used by every horizontal slider on the Home
/// screen (Featured, Best Sellers, Flash Sale, Today's Deals, Recommended,
/// Recently Viewed). Keeping one implementation avoids the "duplicate
/// widget" cards littered through the old screens.
class HomeProductCard extends ConsumerStatefulWidget {
  final Product product;
  final int discountPercent;
  final double? originalPrice;

  const HomeProductCard({
    super.key,
    required this.product,
    this.discountPercent = 0,
    this.originalPrice,
  });

  @override
  ConsumerState<HomeProductCard> createState() => _HomeProductCardState();
}

class _HomeProductCardState extends ConsumerState<HomeProductCard> {
  double _scale = 1.0;
  bool _isAdding = false;

  Future<void> _handleTap() async {
    await ref.read(homeDataProvider.notifier).recordProductView(widget.product);
    if (!mounted) return;
    Navigator.pushNamed(context, '/product-detail', arguments: widget.product);
  }

  Future<void> _handleAddToCart() async {
    if (_isAdding) return;
    setState(() => _isAdding = true);
    try {
      await CartService().addToCart(widget.product.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${widget.product.name} added to cart', style: GoogleFonts.outfit()),
          duration: const Duration(seconds: 1),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not add to cart. Please try again.', style: GoogleFonts.outfit()),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } finally {
      if (mounted) setState(() => _isAdding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final hasDiscount = widget.discountPercent > 0 && widget.originalPrice != null;

    return GestureDetector(
      onTapDown: (_) => setState(() => _scale = 0.97),
      onTapUp: (_) => setState(() => _scale = 1.0),
      onTapCancel: () => setState(() => _scale = 1.0),
      onTap: _handleTap,
      child: AnimatedScale(
        scale: _scale,
        duration: const Duration(milliseconds: 100),
        child: Container(
          width: 148,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.inputBorder, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                    child: SizedBox(
                      width: double.infinity,
                      height: 96,
                      child: _ProductImage(product: product),
                    ),
                  ),
                  if (hasDiscount)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.error,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${widget.discountPercent}% OFF',
                          style: GoogleFonts.outfit(color: Colors.white, fontSize: 9.5, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ),
                ],
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            product.name,
                            style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 3),
                          Text(
                            '${product.proteinPer100g.toStringAsFixed(0)}g protein • ${product.weight}',
                            style: GoogleFonts.outfit(fontSize: 10, color: AppColors.textHint),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (hasDiscount)
                                  Text(
                                    '₹${widget.originalPrice!.toStringAsFixed(0)}',
                                    style: GoogleFonts.outfit(
                                      fontSize: 10,
                                      color: AppColors.textHint,
                                      decoration: TextDecoration.lineThrough,
                                    ),
                                  ),
                                Text(
                                  '₹${product.price.toStringAsFixed(0)}',
                                  style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800, color: AppColors.primary),
                                ),
                              ],
                            ),
                          ),
                          GestureDetector(
                            onTap: _handleAddToCart,
                            child: Container(
                              width: 26,
                              height: 26,
                              decoration: BoxDecoration(
                                gradient: AppColors.primaryGradient,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: _isAdding
                                  ? const Padding(
                                      padding: EdgeInsets.all(5),
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                    )
                                  : const Icon(Icons.add, color: Colors.white, size: 16),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProductImage extends StatelessWidget {
  final Product product;
  const _ProductImage({required this.product});

  @override
  Widget build(BuildContext context) {
    if (product.imageUrl.isEmpty) {
      return const ColoredBox(
        color: AppColors.surfaceLight,
        child: Icon(Icons.shopping_bag_outlined, size: 34, color: AppColors.primary),
      );
    }
    if (!product.imageUrl.startsWith('http')) {
      return ColoredBox(
        color: AppColors.surfaceLight,
        child: Center(child: Text(product.imageUrl, style: const TextStyle(fontSize: 36))),
      );
    }
    return CachedNetworkImage(
      imageUrl: product.imageUrl,
      fit: BoxFit.cover,
      fadeInDuration: const Duration(milliseconds: 250),
      placeholder: (context, url) => const ProductImageShimmer(),
      errorWidget: (context, url, error) => const ColoredBox(
        color: AppColors.surfaceLight,
        child: Icon(Icons.shopping_bag_outlined, size: 34, color: AppColors.primary),
      ),
    );
  }
}
