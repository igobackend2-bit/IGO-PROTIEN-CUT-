import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../services/cart_service.dart';
import '../../../../utils/app_colors.dart';
import '../../../cart/presentation/providers/cart_providers.dart';
import '../../../../shared/widgets/product_grid_card.dart';
import '../providers/wishlist_providers.dart';

/// Horizontal preview of the latest 10 wishlisted products — reuses the
/// shared ProductGridCard (same one Home/Discovery use) rather than
/// building a second product-card widget.
class RecentlyWishlistedSection extends ConsumerWidget {
  const RecentlyWishlistedSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(recentlyWishlistedProvider);
    if (items.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text('Recently Wishlisted', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 190,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final product = items[index].product;
                return ProductGridCard(
                  product: product,
                  enableHero: false,
                  onTap: () => Navigator.pushNamed(context, '/product-detail', arguments: product),
                  onAddToCart: () async {
                    await CartService().addToCart(product.id);
                    ref.invalidate(cartProvider);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
