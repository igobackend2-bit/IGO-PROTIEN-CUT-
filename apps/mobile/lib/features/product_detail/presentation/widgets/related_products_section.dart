import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/product_model.dart';
import '../../../../services/cart_service.dart';
import '../../../../shared/widgets/product_grid_card.dart';
import '../../../../utils/app_colors.dart';
import '../providers/product_detail_providers.dart';

class RelatedProductsSection extends ConsumerWidget {
  final Product product;
  const RelatedProductsSection({super.key, required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncRelated = ref.watch(relatedProductsProvider(product));

    return asyncRelated.when(
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
                  final item = items[index];
                  return ProductGridCard(
                    key: ValueKey(item.id),
                    product: item,
                    onTap: () => Navigator.pushReplacementNamed(context, '/product-detail', arguments: item),
                    onAddToCart: () => CartService().addToCart(item.id),
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
