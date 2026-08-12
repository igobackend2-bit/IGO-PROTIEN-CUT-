import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/product_model.dart';
import '../../../../services/cart_service.dart';
import '../../../../shared/widgets/product_grid_card.dart';
import '../../../../utils/app_colors.dart';
import '../providers/product_detail_providers.dart';

class FrequentlyBoughtTogether extends ConsumerStatefulWidget {
  final Product product;
  const FrequentlyBoughtTogether({super.key, required this.product});

  @override
  ConsumerState<FrequentlyBoughtTogether> createState() => _FrequentlyBoughtTogetherState();
}

class _FrequentlyBoughtTogetherState extends ConsumerState<FrequentlyBoughtTogether> {
  final Set<String> _deselected = {};
  bool _isAdding = false;

  Future<void> _addAllToCart(List<Product> combo) async {
    setState(() => _isAdding = true);
    try {
      for (final p in combo) {
        if (!_deselected.contains(p.id)) {
          await CartService().addToCart(p.id);
        }
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Added to cart', style: GoogleFonts.outfit()),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not add all items. Please try again.', style: GoogleFonts.outfit()),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      if (mounted) setState(() => _isAdding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final asyncPairs = ref.watch(frequentlyBoughtTogetherProvider(widget.product));

    return asyncPairs.when(
      data: (others) {
        if (others.isEmpty) return const SizedBox.shrink();
        final combo = [widget.product, ...others];
        final selectedTotal = combo
            .where((p) => !_deselected.contains(p.id))
            .fold<double>(0, (sum, p) => sum + p.price);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Frequently Bought Together', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            const SizedBox(height: 12),
            SizedBox(
              height: 200,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: combo.length,
                separatorBuilder: (context, index) => Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Center(child: Icon(Icons.add_rounded, size: 18, color: AppColors.textHint)),
                ),
                itemBuilder: (context, index) {
                  final p = combo[index];
                  final isSelected = !_deselected.contains(p.id);
                  return Stack(
                    children: [
                      ProductGridCard(
                        key: ValueKey(p.id),
                        product: p,
                        onTap: () => Navigator.pushNamed(context, '/product-detail', arguments: p),
                        onAddToCart: () => CartService().addToCart(p.id),
                      ),
                      Positioned(
                        top: 6,
                        right: 6,
                        child: GestureDetector(
                          onTap: () => setState(() {
                            if (isSelected) {
                              _deselected.add(p.id);
                            } else {
                              _deselected.remove(p.id);
                            }
                          }),
                          child: Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.primary : Colors.white,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.primary, width: 1.5),
                            ),
                            child: isSelected ? const Icon(Icons.check, color: Colors.white, size: 14) : null,
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton(
                onPressed: _isAdding || selectedTotal == 0 ? null : () => _addAllToCart(combo),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isAdding
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(
                        'Add Selected (₹${selectedTotal.toStringAsFixed(0)})',
                        style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 13.5),
                      ),
              ),
            ),
          ],
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}
