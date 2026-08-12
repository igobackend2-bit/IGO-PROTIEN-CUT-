import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';

import '../../features/wishlist/presentation/providers/wishlist_providers.dart';
import '../../models/product_model.dart';
import '../../utils/app_colors.dart';
import 'maybe_hero.dart';

/// The single, reusable product grid card for the whole app — used by the
/// Home sliders and the Product Discovery grid so card UI, image loading,
/// price/discount formatting and the add-to-cart flow only exist once.
class ProductGridCard extends StatefulWidget {
  final Product product;
  final int discountPercent;
  final double? originalPrice;
  final VoidCallback onTap;
  final Future<void> Function() onAddToCart;

  /// Disable when the same product can legitimately appear more than once
  /// in the widget tree at the same time (e.g. Home, where one product can
  /// show up in Featured, Best Sellers and Flash Sale simultaneously) —
  /// Hero requires tags to be unique among on-screen widgets, so a shared
  /// tag across duplicates throws "multiple heroes share the same tag".
  final bool enableHero;

  const ProductGridCard({
    super.key,
    required this.product,
    required this.onTap,
    required this.onAddToCart,
    this.discountPercent = 0,
    this.originalPrice,
    this.enableHero = true,
  });

  @override
  State<ProductGridCard> createState() => _ProductGridCardState();
}

class _ProductGridCardState extends State<ProductGridCard> {
  double _scale = 1.0;
  bool _isAdding = false;

  Future<void> _handleAddToCart() async {
    if (_isAdding) return;
    setState(() => _isAdding = true);
    try {
      await widget.onAddToCart();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${widget.product.name} added to cart', style: GoogleFonts.outfit()),
          duration: const Duration(seconds: 1),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } catch (_) {
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
    final isOutOfStock = !product.isAvailable;

    return GestureDetector(
      onTapDown: (_) => setState(() => _scale = 0.97),
      onTapUp: (_) => setState(() => _scale = 1.0),
      onTapCancel: () => setState(() => _scale = 1.0),
      onTap: isOutOfStock ? null : widget.onTap,
      child: AnimatedScale(
        scale: _scale,
        duration: const Duration(milliseconds: 100),
        child: Opacity(
          opacity: isOutOfStock ? 0.55 : 1.0,
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
                    MaybeHero(
                      enabled: widget.enableHero,
                      tag: 'product-image-${product.id}',
                      child: ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                        child: SizedBox(
                          width: double.infinity,
                          height: 96,
                          child: _ProductImage(product: product),
                        ),
                      ),
                    ),
                    if (hasDiscount)
                      Positioned(
                        top: 8,
                        left: 8,
                        child: _Badge(
                          text: '${widget.discountPercent}% OFF',
                          color: AppColors.error,
                        ),
                      ),
                    if (isOutOfStock)
                      Positioned(
                        bottom: 8,
                        left: 8,
                        child: _Badge(text: 'OUT OF STOCK', color: Colors.grey.shade700),
                      ),
                    Positioned(
                      top: 6,
                      right: 6,
                      child: Consumer(
                        builder: (context, ref, _) {
                          final isWishlisted = ref.watch(wishlistProvider(product.id)).value ?? false;
                          return GestureDetector(
                            onTap: () => ref.read(wishlistProvider(product.id).notifier).toggle(),
                            child: Container(
                              width: 26,
                              height: 26,
                              decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                              child: Icon(
                                isWishlisted ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                                color: isWishlisted ? AppColors.error : AppColors.textHint,
                                size: 14,
                              ),
                            ),
                          );
                        },
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
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    '${product.proteinPer100g.toStringAsFixed(0)}g protein • ${product.weight}',
                                    style: GoogleFonts.outfit(fontSize: 10, color: AppColors.textHint),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                            if (product.rating != null) ...[
                              const SizedBox(height: 2),
                              Row(
                                children: [
                                  const Icon(Icons.star_rounded, size: 12, color: Color(0xFFF39C12)),
                                  const SizedBox(width: 2),
                                  Text(
                                    product.rating!.toStringAsFixed(1),
                                    style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textSecondary),
                                  ),
                                  if (product.ratingCount != null)
                                    Text(
                                      ' (${product.ratingCount})',
                                      style: GoogleFonts.outfit(fontSize: 9, color: AppColors.textHint),
                                    ),
                                ],
                              ),
                            ],
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
                              onTap: isOutOfStock ? null : _handleAddToCart,
                              child: Container(
                                width: 26,
                                height: 26,
                                decoration: BoxDecoration(
                                  gradient: isOutOfStock ? null : AppColors.primaryGradient,
                                  color: isOutOfStock ? Colors.grey.shade300 : null,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: _isAdding
                                    ? const Padding(
                                        padding: EdgeInsets.all(5),
                                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                      )
                                    : Icon(Icons.add, color: isOutOfStock ? Colors.grey.shade600 : Colors.white, size: 16),
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
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String text;
  final Color color;
  const _Badge({required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(6)),
      child: Text(
        text,
        style: GoogleFonts.outfit(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800),
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
      placeholder: (context, url) => Shimmer.fromColors(
        baseColor: AppColors.surfaceLight,
        highlightColor: Colors.white,
        child: Container(color: Colors.white),
      ),
      errorWidget: (context, url, error) => const ColoredBox(
        color: AppColors.surfaceLight,
        child: Icon(Icons.shopping_bag_outlined, size: 34, color: AppColors.primary),
      ),
    );
  }
}
