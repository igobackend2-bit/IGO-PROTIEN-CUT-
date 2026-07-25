import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/cart_line_item.dart';
import 'cart_item_thumbnail.dart';

class SavedForLaterSection extends StatelessWidget {
  final List<CartLineItem> items;
  final ValueChanged<CartLineItem> onMoveToCart;
  final ValueChanged<CartLineItem> onRemove;

  const SavedForLaterSection({
    super.key,
    required this.items,
    required this.onMoveToCart,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.bookmark_rounded, size: 16, color: AppColors.primary),
            const SizedBox(width: 6),
            Text('Saved for Later (${items.length})', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          ],
        ),
        const SizedBox(height: 10),
        ...items.map((item) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.divider)),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: SizedBox(width: 52, height: 52, child: CartItemThumbnail(imageUrl: item.product.imageUrl)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item.product.name, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 2),
                        Text('₹${item.product.price.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.primary)),
                      ],
                    ),
                  ),
                  TextButton(
                    onPressed: () => onMoveToCart(item),
                    child: Text('Move to Cart', style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.primary)),
                  ),
                  IconButton(
                    onPressed: () => onRemove(item),
                    icon: const Icon(Icons.close_rounded, size: 18, color: AppColors.textHint),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            )),
      ],
    );
  }
}
