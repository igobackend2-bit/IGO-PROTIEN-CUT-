import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../services/cart_service.dart';
import '../../../../utils/app_colors.dart';
import '../../domain/entities/combo_pack.dart';

/// A fixed or mix-&-match bundle deal. "Add Combo to Cart" reuses
/// [CartService.addToCart] once per unit of every item in the pack — the
/// exact same call Product Detail's "Frequently bought together" already
/// uses for multi-item adds, so there's no second add-to-cart code path.
class ComboPackCard extends StatefulWidget {
  final ComboPack pack;
  const ComboPackCard({super.key, required this.pack});

  @override
  State<ComboPackCard> createState() => _ComboPackCardState();
}

class _ComboPackCardState extends State<ComboPackCard> {
  bool _isAdding = false;

  Future<void> _addComboToCart() async {
    if (_isAdding) return;
    setState(() => _isAdding = true);
    try {
      for (final item in widget.pack.items) {
        for (var i = 0; i < item.quantity; i++) {
          await CartService().addToCart(item.productId);
        }
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${widget.pack.title} added to cart', style: GoogleFonts.outfit()),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not add the combo. Please try again.', style: GoogleFonts.outfit()),
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
    final pack = widget.pack;
    final hasSavings = pack.discount > 0;

    return Container(
      width: 260,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.inputBorder),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 84, child: _ImageCollage(pack: pack)),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(pack.title, style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(
                  pack.bundleType == ComboBundleType.mixMatch && pack.pickCount != null
                      ? 'Pick any ${pack.pickCount} • ${pack.items.length} options'
                      : '${pack.items.length} items in this pack',
                  style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (hasSavings)
                            Text('₹${pack.fullPrice.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint, decoration: TextDecoration.lineThrough)),
                          Text('₹${pack.bundlePrice.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary)),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: _isAdding ? null : _addComboToCart,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        minimumSize: Size.zero,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: _isAdding
                          ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text('Add', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ImageCollage extends StatelessWidget {
  final ComboPack pack;
  const _ImageCollage({required this.pack});

  @override
  Widget build(BuildContext context) {
    final images = pack.items.map((i) => i.product?.imageUrl ?? '').where((u) => u.startsWith('http')).take(3).toList();

    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
      child: images.isEmpty
          ? Container(
              color: AppColors.surfaceLight,
              alignment: Alignment.center,
              child: const Icon(Icons.inventory_2_rounded, size: 32, color: AppColors.primary),
            )
          : Row(
              children: images
                  .map(
                    (url) => Expanded(
                      child: CachedNetworkImage(
                        imageUrl: url,
                        fit: BoxFit.cover,
                        height: 84,
                        placeholder: (context, url) => Shimmer.fromColors(
                          baseColor: AppColors.surfaceLight,
                          highlightColor: Colors.white,
                          child: Container(color: Colors.white),
                        ),
                        errorWidget: (context, url, error) => const ColoredBox(color: AppColors.surfaceLight),
                      ),
                    ),
                  )
                  .toList(),
            ),
    );
  }
}
