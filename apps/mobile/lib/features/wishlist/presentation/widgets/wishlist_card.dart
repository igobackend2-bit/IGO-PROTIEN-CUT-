import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../models/product_model.dart';
import '../../../../utils/app_colors.dart';
import '../../../product_detail/presentation/widgets/share_product_button.dart';
import '../../domain/entities/wishlist_item.dart';
import '../providers/wishlist_providers.dart';

class WishlistCard extends ConsumerStatefulWidget {
  final WishlistItem item;
  final VoidCallback onTap;
  final Future<void> Function() onMoveToCart;
  final Future<void> Function() onRemove;

  const WishlistCard({
    super.key,
    required this.item,
    required this.onTap,
    required this.onMoveToCart,
    required this.onRemove,
  });

  @override
  ConsumerState<WishlistCard> createState() => _WishlistCardState();
}

class _WishlistCardState extends ConsumerState<WishlistCard> {
  bool _isMoving = false;

  Future<void> _handleMoveToCart() async {
    if (_isMoving) return;
    setState(() => _isMoving = true);
    try {
      await widget.onMoveToCart();
    } finally {
      if (mounted) setState(() => _isMoving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.item.product;
    final isOutOfStock = !product.isAvailable;

    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppColors.inputBorder, width: 1),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                Opacity(
                  opacity: isOutOfStock ? 0.5 : 1.0,
                  child: Hero(
                    tag: 'wishlist-image-${product.id}',
                    child: ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                      child: SizedBox(width: double.infinity, height: 110, child: _ProductImage(product: product)),
                    ),
                  ),
                ),
                if (isOutOfStock)
                  const Positioned(
                    bottom: 8,
                    left: 8,
                    child: _Badge(text: 'OUT OF STOCK', color: Colors.grey),
                  ),
                Positioned(
                  top: 6,
                  right: 6,
                  child: GestureDetector(
                    onTap: widget.onRemove,
                    child: Container(
                      width: 30,
                      height: 30,
                      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                      child: const Icon(Icons.favorite_rounded, color: AppColors.error, size: 17),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          product.name,
                          style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      ShareProductButton(product: product),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${product.proteinPer100g.toStringAsFixed(0)}g protein • ${product.weight}',
                    style: GoogleFonts.outfit(fontSize: 10, color: AppColors.textHint),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '₹${product.price.toStringAsFixed(0)}',
                    style: GoogleFonts.outfit(fontSize: 14.5, fontWeight: FontWeight.w800, color: AppColors.primary),
                  ),
                  const SizedBox(height: 8),
                  if (isOutOfStock)
                    _NotifyMeButton(productId: product.id)
                  else
                    SizedBox(
                      width: double.infinity,
                      height: 34,
                      child: ElevatedButton.icon(
                        onPressed: _handleMoveToCart,
                        icon: _isMoving
                            ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Icon(Icons.shopping_bag_outlined, size: 15),
                        label: Text('Move to Cart', style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w700)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotifyMeButton extends ConsumerWidget {
  final String productId;
  const _NotifyMeButton({required this.productId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isSubscribed = ref.watch(stockAlertProvider(productId)).value ?? false;

    return SizedBox(
      width: double.infinity,
      height: 34,
      child: OutlinedButton.icon(
        onPressed: () async {
          try {
            await ref.read(stockAlertProvider(productId).notifier).toggle();
          } catch (_) {
            if (!context.mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Please log in to get notified.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
            );
          }
        },
        icon: Icon(isSubscribed ? Icons.notifications_active_rounded : Icons.notifications_none_rounded, size: 15),
        label: Text(isSubscribed ? "We'll notify you" : 'Notify Me', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700)),
        style: OutlinedButton.styleFrom(
          foregroundColor: isSubscribed ? AppColors.primary : AppColors.textSecondary,
          side: BorderSide(color: isSubscribed ? AppColors.primary : AppColors.inputBorder),
          padding: EdgeInsets.zero,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
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
      child: Text(text, style: GoogleFonts.outfit(color: Colors.white, fontSize: 8.5, fontWeight: FontWeight.w800)),
    );
  }
}

class _ProductImage extends StatelessWidget {
  final Product product;
  const _ProductImage({required this.product});

  @override
  Widget build(BuildContext context) {
    if (product.imageUrl.isEmpty) {
      return const ColoredBox(color: AppColors.surfaceLight, child: Icon(Icons.shopping_bag_outlined, size: 34, color: AppColors.primary));
    }
    if (!product.imageUrl.startsWith('http')) {
      return ColoredBox(color: AppColors.surfaceLight, child: Center(child: Text(product.imageUrl, style: const TextStyle(fontSize: 36))));
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
      errorWidget: (context, url, error) => const ColoredBox(color: AppColors.surfaceLight, child: Icon(Icons.shopping_bag_outlined, size: 34, color: AppColors.primary)),
    );
  }
}
