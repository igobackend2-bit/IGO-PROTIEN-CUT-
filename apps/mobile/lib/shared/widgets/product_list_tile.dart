import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';

import '../../features/wishlist/presentation/providers/wishlist_providers.dart';
import '../../models/product_model.dart';
import '../../utils/app_colors.dart';

/// Row-style product card used by Product Discovery's List view mode.
class ProductListTile extends StatefulWidget {
  final Product product;
  final int discountPercent;
  final double? originalPrice;
  final VoidCallback onTap;
  final Future<void> Function() onAddToCart;

  const ProductListTile({
    super.key,
    required this.product,
    required this.onTap,
    required this.onAddToCart,
    this.discountPercent = 0,
    this.originalPrice,
  });

  @override
  State<ProductListTile> createState() => _ProductListTileState();
}

class _ProductListTileState extends State<ProductListTile> {
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

    return Opacity(
      opacity: isOutOfStock ? 0.55 : 1.0,
      child: GestureDetector(
        onTap: isOutOfStock ? null : widget.onTap,
        child: Stack(
          children: [
            Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.inputBorder, width: 1),
          ),
          child: Row(
            children: [
              Stack(
                children: [
                  Hero(
                    tag: 'product-image-${product.id}',
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: SizedBox(width: 76, height: 76, child: _ProductImage(product: product)),
                    ),
                  ),
                  if (hasDiscount)
                    Positioned(
                      top: 4,
                      left: 4,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(color: AppColors.error, borderRadius: BorderRadius.circular(5)),
                        child: Text(
                          '${widget.discountPercent}%',
                          style: GoogleFonts.outfit(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${product.proteinPer100g.toStringAsFixed(0)}g protein • ${product.weight} • ${product.category}',
                      style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (product.rating != null) ...[
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 13, color: Color(0xFFF39C12)),
                          const SizedBox(width: 2),
                          Text(
                            product.rating!.toStringAsFixed(1),
                            style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        if (hasDiscount) ...[
                          Text(
                            '₹${widget.originalPrice!.toStringAsFixed(0)}',
                            style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint, decoration: TextDecoration.lineThrough),
                          ),
                          const SizedBox(width: 6),
                        ],
                        Text(
                          '₹${product.price.toStringAsFixed(0)}',
                          style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              GestureDetector(
                onTap: isOutOfStock ? null : _handleAddToCart,
                child: Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    gradient: isOutOfStock ? null : AppColors.primaryGradient,
                    color: isOutOfStock ? Colors.grey.shade300 : null,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: _isAdding
                      ? const Padding(
                          padding: EdgeInsets.all(7),
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : Icon(Icons.add, color: isOutOfStock ? Colors.grey.shade600 : Colors.white, size: 20),
                ),
              ),
            ],
          ),
            ),
            Positioned(
              top: 4,
              right: 4,
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
        child: Icon(Icons.shopping_bag_outlined, size: 28, color: AppColors.primary),
      );
    }
    if (!product.imageUrl.startsWith('http')) {
      return ColoredBox(
        color: AppColors.surfaceLight,
        child: Center(child: Text(product.imageUrl, style: const TextStyle(fontSize: 30))),
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
        child: Icon(Icons.shopping_bag_outlined, size: 28, color: AppColors.primary),
      ),
    );
  }
}
