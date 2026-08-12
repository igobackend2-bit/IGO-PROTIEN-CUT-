import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/product_model.dart';
import '../../../../services/cart_service.dart';
import '../../../../utils/app_colors.dart';
import '../providers/product_detail_providers.dart';
import '../widgets/animated_add_to_cart_bar.dart';
import '../widgets/delivery_availability_card.dart';
import '../widgets/frequently_bought_together.dart';
import '../widgets/ingredients_cooking_card.dart';
import '../widgets/nutrition_facts_card.dart';
import '../widgets/product_image_gallery.dart';
import '../widgets/recipe_suggestions_section.dart';
import '../widgets/related_products_section.dart';
import '../widgets/reviews_ratings_section.dart';
import '../widgets/share_product_button.dart';
import '../widgets/wishlist_button.dart';
import '../../../subscriptions/presentation/widgets/subscribe_save_card.dart';

/// Premium Product Detail experience (Phase 3) — replaces the previous
/// features/products/product_detail_screen.dart.
class ProductDetailScreen extends ConsumerStatefulWidget {
  final Product? product;
  const ProductDetailScreen({super.key, this.product});

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  Product? _product;
  int _quantity = 0;
  int? _cartItemId;
  int _cartTotalQty = 0;
  bool _isLoading = false;

  final _cartService = CartService();

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_product != null) return; // resolve once

    if (widget.product != null) {
      _product = widget.product;
    } else {
      final args = ModalRoute.of(context)?.settings.arguments;
      _product = args is Product ? args : null;
    }
    if (_product != null) _loadCartStatus();
  }

  Future<void> _loadCartStatus() async {
    final product = _product;
    if (product == null) return;
    try {
      final items = await _cartService.getCartItems();
      if (!mounted) return;

      final existing = items.where((i) {
        final prodData = i['products'];
        return prodData is Map && prodData['id']?.toString() == product.id;
      }).toList();

      final total = items.fold<int>(0, (sum, item) => sum + ((item['quantity'] as int?) ?? 0));

      setState(() {
        if (existing.isNotEmpty) {
          _quantity = (existing.first['quantity'] as int?) ?? 0;
          _cartItemId = existing.first['id'] as int?;
        } else {
          _quantity = 0;
          _cartItemId = null;
        }
        _cartTotalQty = total;
      });
    } catch (_) {
      // Keep last-known cart state; the bottom bar still functions.
    }
  }

  Future<void> _addToCart() async {
    final product = _product;
    if (product == null) return;
    setState(() => _isLoading = true);
    try {
      await _cartService.addToCart(product.id);
      await _loadCartStatus();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${product.name} added to cart 🛒', style: GoogleFonts.outfit()),
          backgroundColor: AppColors.primary,
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to add to cart', style: GoogleFonts.outfit()), backgroundColor: AppColors.error),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _changeQuantity(int newQty) async {
    if (_cartItemId == null) return;
    setState(() => _isLoading = true);
    try {
      if (newQty <= 0) {
        await _cartService.removeItem(_cartItemId!);
      } else {
        await _cartService.updateQuantity(_cartItemId!, newQty);
      }
      await _loadCartStatus();
    } catch (_) {
      // Non-fatal — user can retry the tap.
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = _product;
    if (product == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: const Center(child: Text('Product details not found.')),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          CustomScrollView(
            physics: const BouncingScrollPhysics(),
            slivers: [
              SliverAppBar(
                expandedHeight: 330,
                elevation: 0,
                pinned: true,
                stretch: true,
                backgroundColor: AppColors.primary,
                leading: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: CircleAvatar(
                    backgroundColor: Colors.white,
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary, size: 18),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                ),
                actions: [
                  Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: WishlistButton(productId: product.id),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(right: 12.0),
                    child: ShareProductButton(product: product),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  stretchModes: const [StretchMode.zoomBackground, StretchMode.blurBackground],
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      ProductImageGallery(product: product),
                      const IgnorePointer(
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Colors.black26, Colors.transparent, Colors.black38],
                              stops: [0.0, 0.5, 1.0],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Container(
                  color: AppColors.background,
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 140),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.category.toUpperCase(),
                        style: GoogleFonts.outfit(color: AppColors.accent, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1.5),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        product.name,
                        style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.textPrimary, height: 1.2),
                      ),
                      const SizedBox(height: 8),
                      _RatingSummaryRow(productId: product.id),
                      const SizedBox(height: 8),
                      Text(
                        '₹${product.price.toStringAsFixed(0)}',
                        style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.primary),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        product.weight,
                        style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textHint, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 16),
                      Text('Description', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      const SizedBox(height: 8),
                      Text(
                        product.description.isEmpty
                            ? 'Savor our high-quality premium selected protein cuts, sourced ethically and delivered fresh daily.'
                            : product.description,
                        style: GoogleFonts.outfit(fontSize: 14, color: AppColors.textSecondary, height: 1.5),
                      ),
                      const SizedBox(height: 20),
                      NutritionFactsCard(product: product),
                      const SizedBox(height: 16),
                      DeliveryAvailabilityCard(product: product),
                      const SizedBox(height: 16),
                      SubscribeSaveCard(product: product, initialQuantity: _quantity == 0 ? 1 : _quantity),
                      const SizedBox(height: 20),
                      IngredientsCookingCard(product: product),
                      const SizedBox(height: 28),
                      RecipeSuggestionsSection(product: product),
                      const SizedBox(height: 28),
                      FrequentlyBoughtTogether(product: product),
                      const SizedBox(height: 28),
                      RelatedProductsSection(product: product),
                      const SizedBox(height: 28),
                      ReviewsRatingsSection(product: product),
                    ],
                  ),
                ),
              ),
            ],
          ),
          Positioned(left: 0, right: 0, bottom: 80, child: _stickyViewCartBanner(product)),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: AnimatedAddToCartBar(
              product: product,
              quantity: _quantity,
              isLoading: _isLoading,
              onAdd: _addToCart,
              onQuantityChange: _changeQuantity,
            ),
          ),
        ],
      ),
    );
  }

  Widget _stickyViewCartBanner(Product product) {
    return AnimatedSlide(
      duration: const Duration(milliseconds: 250),
      offset: _cartTotalQty > 0 ? Offset.zero : const Offset(0, 1),
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 250),
        opacity: _cartTotalQty > 0 ? 1 : 0,
        child: GestureDetector(
          onTap: () => Navigator.pushNamed(context, '/cart').then((_) => _loadCartStatus()),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.shopping_cart_outlined, color: Colors.white, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      '$_cartTotalQty ${_cartTotalQty == 1 ? 'item' : 'items'} in cart',
                      style: GoogleFonts.outfit(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Text('View Cart', style: GoogleFonts.outfit(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white, size: 11),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Small inline rating summary next to the product name — pulls the *real*
/// average from submitted reviews. Shows a "New" pill instead of a fake
/// number when there are no reviews yet.
class _RatingSummaryRow extends ConsumerWidget {
  final String productId;
  const _RatingSummaryRow({required this.productId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reviewsAsync = ref.watch(reviewsProvider(productId));

    return reviewsAsync.maybeWhen(
      data: (reviews) {
        if (reviews.isEmpty) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(8)),
            child: Text('New', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
          );
        }
        final avg = reviews.map((r) => r.rating).reduce((a, b) => a + b) / reviews.length;
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.star_rounded, color: AppColors.primary, size: 15),
                  const SizedBox(width: 2),
                  Text(avg.toStringAsFixed(1), style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary)),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text('${reviews.length} reviews', style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textHint, fontWeight: FontWeight.w500)),
          ],
        );
      },
      orElse: () => const SizedBox.shrink(),
    );
  }
}
