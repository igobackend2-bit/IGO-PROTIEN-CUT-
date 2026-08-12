import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../services/cart_service.dart';
import '../../../../shared/widgets/product_grid_card.dart';
import '../../../../utils/app_colors.dart';
import '../providers/cart_providers.dart';

/// "You may also like" — lazily loaded (FutureProvider.autoDispose only
/// fetches once this section actually builds/scrolls into view) and
/// excludes anything already in the cart or saved for later.
class CartRecommendedSection extends ConsumerWidget {
  const CartRecommendedSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncRecommended = ref.watch(recommendedForCartProvider);

    return asyncRecommended.when(
      data: (items) {
        if (items.isEmpty) return const SizedBox.shrink();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('You May Also Like', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            const SizedBox(height: 12),
            SizedBox(
              height: 200,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: items.length,
                separatorBuilder: (context, index) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final product = items[index];
                  return ProductGridCard(
                    key: ValueKey(product.id),
                    product: product,
                    onTap: () => Navigator.pushNamed(context, '/product-detail', arguments: product),
                    onAddToCart: () async {
                      await CartService().addToCart(product.id);
                      ref.read(cartProvider.notifier).load();
                    },
                  );
                },
              ),
            ),
          ],
        );
      },
      loading: () => const SizedBox(
        height: 200,
        child: Center(child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2.5)),
      ),
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}
