import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/product_model.dart';
import '../../services/cart_service.dart';
import '../../utils/app_colors.dart';

/// Shows a Swiggy-style bottom sheet for the given [product].
Future<void> showProductDetail(BuildContext context, Product product) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    barrierColor: Colors.black54,
    builder: (_) => _ProductDetailSheet(product: product),
  );
}

class _ProductDetailSheet extends StatefulWidget {
  final Product product;
  const _ProductDetailSheet({required this.product});

  @override
  State<_ProductDetailSheet> createState() => _ProductDetailSheetState();
}

class _ProductDetailSheetState extends State<_ProductDetailSheet>
    with SingleTickerProviderStateMixin {
  int _quantity = 0;
  int? _cartItemId;          // Supabase cart row id (null = not yet in cart)
  bool _isLoading = false;
  final _cartService = CartService();
  late final AnimationController _animController;
  late final Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 380),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic));
    _animController.forward();
    _loadCartQuantity();
  }

  /// Checks if this product is already in the cart and pre-fills the quantity.
  Future<void> _loadCartQuantity() async {
    try {
      final items = await _cartService.getCartItems();
      final existing = items.where((i) {
        final prodData = i['products'];
        if (prodData is Map) {
          return prodData['id']?.toString() == widget.product.id;
        }
        return false;
      }).toList();
      if (existing.isNotEmpty && mounted) {
        setState(() {
          _quantity = (existing.first['quantity'] as int?) ?? 0;
          _cartItemId = existing.first['id'] as int?;
        });
      }
    } catch (_) {}
  }

  Future<void> _addToCart() async {
    setState(() => _isLoading = true);
    try {
      await _cartService.addToCart(widget.product.id);
      if (!mounted) return;
      // Refresh to get the new cart item id
      final items = await _cartService.getCartItems();
      final existing = items.where((i) {
        final prodData = i['products'];
        if (prodData is Map) {
          return prodData['id']?.toString() == widget.product.id;
        }
        return false;
      }).toList();
      if (existing.isNotEmpty && mounted) {
        setState(() {
          _quantity = (existing.first['quantity'] as int?) ?? 1;
          _cartItemId = existing.first['id'] as int?;
        });
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${widget.product.name} added to cart 🛒',
                style: GoogleFonts.outfit()),
            backgroundColor: AppColors.primary,
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to add to cart: $e',
                style: GoogleFonts.outfit()),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _changeQuantity(int newQty) async {
    if (_cartItemId == null) return;
    setState(() => _isLoading = true);
    try {
      await _cartService.updateQuantity(_cartItemId!, newQty);
      if (mounted) setState(() => _quantity = newQty < 0 ? 0 : newQty);
    } catch (_) {} finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Product get p => widget.product;

  bool get _isNetworkImage => p.imageUrl.startsWith('http');

  // Derive a mock rating & reviews from the product id hash for realism
  String get _rating => '4.${(p.id.hashCode.abs() % 5) + 1}';
  String get _reviews => '${(p.id.hashCode.abs() % 9 + 1)}.${(p.id.hashCode.abs() % 9)}K+';

  // Removed restaurant-style meal nutritional detail getters

  bool get _isBestseller => p.id.hashCode.abs() % 3 != 0;

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;

    return SlideTransition(
      position: _slideAnim,
      child: Container(
        height: screenHeight * 0.88,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            // ── Image section ────────────────────────────────────────────
            Expanded(
              flex: 5,
              child: Stack(
                children: [
                  // Food image
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    child: SizedBox(
                      width: double.infinity,
                      height: double.infinity,
                      child: _buildImage(),
                    ),
                  ),

                  // Gradient overlay at bottom of image
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                    child: Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [Colors.white, Colors.transparent],
                        ),
                      ),
                    ),
                  ),

                  // HIGH PROTEIN badge (top-left)
                  Positioned(
                    top: 16,
                    left: 16,
                    child: _HighProteinBadge(),
                  ),

                  // Close button (top-right)
                  Positioned(
                    top: 12,
                    right: 12,
                    child: GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        width: 36,
                        height: 36,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 6,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Icon(Icons.close, size: 18, color: Colors.black87),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ── Info section ─────────────────────────────────────────────
            Expanded(
              flex: 4,
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Bestseller badge
                      if (_isBestseller) ...[
                        Row(
                          children: [
                            const Icon(Icons.local_fire_department, color: Color(0xFFFF5733), size: 16),
                            const SizedBox(width: 4),
                            Text(
                              'Bestseller',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFFFF5733),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                      ],

                      // Name + ADD button row
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(
                            child: Text(
                              p.name,
                              style: GoogleFonts.outfit(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: Colors.black87,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          _AddButton(
                            quantity: _quantity,
                            isLoading: _isLoading,
                            onAdd: () {
                              if (_quantity == 0) {
                                _addToCart();
                              } else {
                                _changeQuantity(_quantity + 1);
                              }
                            },
                            onRemove: () {
                              if (_quantity > 0) _changeQuantity(_quantity - 1);
                            },
                          ),
                        ],
                      ),

                      const SizedBox(height: 6),

                      // Price
                      Text(
                        '₹${p.price.toStringAsFixed(0)}',
                        style: GoogleFonts.outfit(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: Colors.black87,
                        ),
                      ),

                      const SizedBox(height: 8),

                      // Rating
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, color: Color(0xFF4CAF50), size: 16),
                          const SizedBox(width: 4),
                          Text(
                            '$_rating ($_reviews)',
                            style: GoogleFonts.outfit(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF4CAF50),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 12),

                      // Description
                      if (p.description.isNotEmpty) ...[
                        Text(
                          p.description,
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            color: Colors.black54,
                            height: 1.4,
                          ),
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Product Information Card
                      _buildProductInfoCard(),
                      const SizedBox(height: 16),

                      // Category chip
                      if (p.category.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                          ),
                          child: Text(
                            p.category,
                            style: GoogleFonts.outfit(
                              fontSize: 11,
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductInfoCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoRow(Icons.scale_outlined, 'Weight', p.weight),
          const Divider(height: 16, color: AppColors.divider),
          _buildInfoRow(
            Icons.fitness_center_rounded,
            'Protein',
            '${p.proteinPer100g.toStringAsFixed(0)}g / 100g',
          ),
          const Divider(height: 16, color: AppColors.divider),
          _buildInfoRow(
            Icons.opacity_rounded,
            'Fat',
            '${p.fatPer100g.toStringAsFixed(1)}g / 100g',
          ),
          const Divider(height: 16, color: AppColors.divider),
          _buildInfoRow(
            Icons.ac_unit_rounded,
            'Storage',
            p.storageInstruction,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primary, size: 16),
        const SizedBox(width: 8),
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 12.5,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: 12.5,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildImage() {
    if (p.imageUrl.isEmpty) {
      return Container(
        color: AppColors.surfaceLight,
        child: const Center(
          child: Icon(Icons.shopping_bag_outlined, size: 80, color: AppColors.primary),
        ),
      );
    }
    if (_isNetworkImage) {
      return Image.network(
        p.imageUrl,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          color: AppColors.surfaceLight,
          child: const Center(
            child: Icon(Icons.shopping_bag_outlined, size: 80, color: AppColors.primary),
          ),
        ),
        loadingBuilder: (_, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Container(
            color: AppColors.surfaceLight,
            child: const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
          );
        },
      );
    }
    // Emoji fallback
    return Container(
      color: AppColors.surfaceLight,
      child: Center(
        child: Text(p.imageUrl, style: const TextStyle(fontSize: 100)),
      ),
    );
  }
}

// ── HIGH PROTEIN Badge ─────────────────────────────────────────────────────────
class _HighProteinBadge extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFFF8BBD9),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('💪', style: TextStyle(fontSize: 18)),
          const SizedBox(height: 2),
          Text(
            'HIGH',
            style: GoogleFonts.outfit(
              fontSize: 8,
              fontWeight: FontWeight.w900,
              color: Colors.black87,
              letterSpacing: 0.5,
            ),
          ),
          Text(
            'PROTEIN',
            style: GoogleFonts.outfit(
              fontSize: 8,
              fontWeight: FontWeight.w900,
              color: Colors.black87,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}

// ── ADD / Quantity stepper button ──────────────────────────────────────────────
class _AddButton extends StatelessWidget {
  final int quantity;
  final bool isLoading;
  final VoidCallback onAdd;
  final VoidCallback onRemove;

  const _AddButton({
    required this.quantity,
    required this.isLoading,
    required this.onAdd,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 200),
          child: isLoading
              ? _loadingBtn()
              : quantity == 0
                  ? _addBtn()
                  : _stepperBtn(),
        ),
        const SizedBox(height: 4),
        Text(
          'Customisable',
          style: GoogleFonts.outfit(
            fontSize: 10,
            color: Colors.black45,
          ),
        ),
      ],
    );
  }

  Widget _loadingBtn() {
    return Container(
      key: const ValueKey('loading'),
      width: 110,
      height: 44,
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.primary, width: 1.5),
      ),
      child: const Center(
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: AppColors.primary,
          ),
        ),
      ),
    );
  }

  Widget _addBtn() {
    return GestureDetector(
      key: const ValueKey('add'),
      onTap: onAdd,
      child: Container(
        width: 110,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.primary, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.15),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Center(
          child: Text(
            'ADD',
            style: GoogleFonts.outfit(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
              letterSpacing: 1,
            ),
          ),
        ),
      ),
    );
  }

  Widget _stepperBtn() {
    return Container(
      key: const ValueKey('stepper'),
      width: 110,
      height: 44,
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          GestureDetector(
            onTap: onRemove,
            child: const Icon(Icons.remove, color: Colors.white, size: 20),
          ),
          Text(
            '$quantity',
            style: GoogleFonts.outfit(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          GestureDetector(
            onTap: onAdd,
            child: const Icon(Icons.add, color: Colors.white, size: 20),
          ),
        ],
      ),
    );
  }
}
