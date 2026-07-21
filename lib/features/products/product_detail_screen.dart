import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/product_model.dart';
import '../../services/cart_service.dart';
import '../../services/product_service.dart';
import '../../utils/app_colors.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product? product;

  const ProductDetailScreen({super.key, this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  late Product _product;
  int _quantity = 0;
  int? _cartItemId;
  bool _isLoading = false;
  bool _isRecommendationsLoading = true;
  List<Product> _recommendations = [];

  final _cartService = CartService();
  final _productService = ProductService();

  // Cart total qty across the entire cart (for the View Cart sticky banner)
  int _cartTotalQty = 0;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    
    // Resolve product either from constructor or route arguments
    if (widget.product != null) {
      _product = widget.product!;
    } else {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is Product) {
        _product = args;
      } else {
        // Fallback placeholder if no product found (should not happen)
        _product = Product(
          id: 'error',
          name: 'Unknown Product',
          description: '',
          price: 0.0,
          imageUrl: '',
          category: '',
          weight: '500g',
          proteinPer100g: 22.0,
          fatPer100g: 3.6,
          storageInstruction: 'Keep refrigerated (0-4°C)',
        );
      }
    }

    _loadData();
  }

  void _loadData() {
    _loadCartStatus();
    _loadRecommendations();
  }

  /// Checks this product's status and total cart quantity
  Future<void> _loadCartStatus() async {
    try {
      final items = await _cartService.getCartItems();
      debugPrint("DEBUG: ProductDetailScreen loaded ${items.length} items: $items");
      if (!mounted) return;

      // Find this product's quantity and ID in the cart
      final existing = items.where((i) {
        final prodData = i['products'];
        if (prodData is Map) {
          return prodData['id']?.toString() == _product.id;
        }
        return false;
      }).toList();

      // Calculate total quantity in the cart
      final total = items.fold<int>(
        0, (sum, item) => sum + ((item['quantity'] as int?) ?? 0));

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
    } catch (e) {
      debugPrint("DEBUG: ProductDetailScreen _loadCartStatus error: $e");
    }
  }

  /// Loads similar items in the same category
  Future<void> _loadRecommendations() async {
    try {
      final all = await _productService.fetchProducts();
      if (!mounted) return;

      final filtered = all
          .where((p) =>
              p.category.toLowerCase() == _product.category.toLowerCase() &&
              p.id != _product.id)
          .toList();

      setState(() {
        _recommendations = filtered;
        _isRecommendationsLoading = false;
      });
    } catch (_) {
      if (mounted) {
        setState(() => _isRecommendationsLoading = false);
      }
    }
  }

  Future<void> _addToCart() async {
    setState(() => _isLoading = true);
    try {
      await _cartService.addToCart(_product.id);
      await _loadCartStatus();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${_product.name} added to cart 🛒',
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
    if (newQty <= 0) {
      if (_cartItemId == null) return;
      setState(() => _isLoading = true);
      try {
        await _cartService.removeItem(_cartItemId!);
        await _loadCartStatus();
      } catch (_) {} finally {
        if (mounted) setState(() => _isLoading = false);
      }
    } else {
      if (_cartItemId == null) return;
      setState(() => _isLoading = true);
      try {
        await _cartService.updateQuantity(_cartItemId!, newQty);
        await _loadCartStatus();
      } catch (_) {} finally {
        if (mounted) setState(() => _isLoading = false);
      }
    }
  }

  bool get _isNetworkImage => _product.imageUrl.startsWith('http');

  // Derive mock ratings/reviews/macro details for realism
  String get _rating => '4.${(_product.id.hashCode.abs() % 5) + 1}';
  String get _reviews => '${(_product.id.hashCode.abs() % 9 + 1)}.${(_product.id.hashCode.abs() % 9)}K+';

  // Removed restaurant-style meal nutritional detail getters

  bool get _isBestseller => _product.id.hashCode.abs() % 3 != 0;

  @override
  Widget build(BuildContext context) {
    if (_product.id == 'error') {
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
              // ── Header Collage / Banner Image ─────────────────────────────
              SliverAppBar(
                expandedHeight: 330.0,
                elevation: 0,
                pinned: true,
                stretch: true,
                backgroundColor: AppColors.primary,
                leading: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: CircleAvatar(
                    backgroundColor: Colors.white,
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new_rounded,
                          color: AppColors.textPrimary, size: 18),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                ),
                actions: [
                  Padding(
                    padding: const EdgeInsets.only(right: 12.0),
                    child: CircleAvatar(
                      backgroundColor: Colors.white,
                      child: IconButton(
                        icon: const Icon(Icons.share_outlined,
                            color: AppColors.textPrimary, size: 20),
                        onPressed: () {},
                      ),
                    ),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  stretchModes: const [
                    StretchMode.zoomBackground,
                    StretchMode.blurBackground,
                  ],
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      _buildHeaderImage(),
                      // Dark gradient overlay on image for readability
                      const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.black38,
                              Colors.transparent,
                              Colors.black54,
                            ],
                            stops: [0.0, 0.4, 1.0],
                          ),
                        ),
                      ),
                      // Bestseller / Category tags floating at bottom left of image
                      Positioned(
                        left: 20,
                        bottom: 24,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (_isBestseller)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFF5733),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.local_fire_department_rounded,
                                        color: Colors.white, size: 12),
                                    const SizedBox(width: 4),
                                    Text(
                                      'BESTSELLER',
                                      style: GoogleFonts.outfit(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800,
                                        color: Colors.white,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            const SizedBox(height: 6),
                            Text(
                              _product.category.toUpperCase(),
                              style: GoogleFonts.outfit(
                                color: AppColors.accent,
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Main Content Body ──────────────────────────────────────────
              SliverToBoxAdapter(
                child: Container(
                  color: AppColors.background,
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 140), // extra padding for bottom bars
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Name & Rating Row
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              _product.name,
                              style: GoogleFonts.outfit(
                                fontSize: 26,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary,
                                height: 1.2,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.star_rounded,
                                        color: AppColors.primary, size: 16),
                                    const SizedBox(width: 2),
                                    Text(
                                      _rating,
                                      style: GoogleFonts.outfit(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '$_reviews reviews',
                                style: GoogleFonts.outfit(
                                  fontSize: 10,
                                  color: AppColors.textHint,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Price
                      Text(
                        '₹${_product.price.toStringAsFixed(0)}',
                        style: GoogleFonts.outfit(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ── Description ────────────────────────────────────────
                      Text(
                        'Description',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _product.description.isEmpty
                            ? 'Savor our high-quality premium selected protein cuts, sourced ethically and delivered fresh daily. Perfect to fuel your active lifestyle and support your nutritional goals.'
                            : _product.description,
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 20),

                      // ── Product Information Card ───────────────────────────
                      _buildProductInfoCard(),
                      const SizedBox(height: 24),

                      // ── Highlights wrap ────────────────────────────────────
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _buildHighlightChip(Icons.eco_outlined, '100% Fresh'),
                          _buildHighlightChip(Icons.fitness_center_rounded, 'High Protein'),
                          _buildHighlightChip(Icons.heart_broken_outlined, 'Zero Trans Fat'),
                        ],
                      ),
                      const SizedBox(height: 32),

                      // ── Recommended Section ────────────────────────────────
                      _buildRecommendationsSection(),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // ── Sticky Floating View Cart Banner ──────────────────────────────
          Positioned(
            left: 0,
            right: 0,
            bottom: 80, // floats just above the bottom action bar
            child: _buildStickyViewCartBanner(),
          ),

          // ── Sticky Bottom Action Bar ───────────────────────────────────────
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _buildBottomActionBar(),
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderImage() {
    if (_product.imageUrl.isEmpty) {
      return Container(
        color: AppColors.surfaceLight,
        child: const Center(
          child: Icon(Icons.shopping_bag_outlined, size: 100, color: AppColors.primary),
        ),
      );
    }
    if (_isNetworkImage) {
      return Image.network(
        _product.imageUrl,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          color: AppColors.surfaceLight,
          child: const Center(
            child: Icon(Icons.shopping_bag_outlined, size: 100, color: AppColors.primary),
          ),
        ),
      );
    }
    return Container(
      color: AppColors.surfaceLight,
      child: Center(
        child: Text(_product.imageUrl, style: const TextStyle(fontSize: 120)),
      ),
    );
  }

  Widget _buildProductInfoCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Product Information',
            style: GoogleFonts.outfit(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          _buildInfoRow(Icons.scale_outlined, 'Weight', _product.weight),
          const Divider(height: 20, color: AppColors.divider),
          _buildInfoRow(
            Icons.fitness_center_rounded,
            'Protein',
            '${_product.proteinPer100g.toStringAsFixed(0)}g / 100g',
          ),
          const Divider(height: 20, color: AppColors.divider),
          _buildInfoRow(
            Icons.opacity_rounded,
            'Fat',
            '${_product.fatPer100g.toStringAsFixed(1)}g / 100g',
          ),
          const Divider(height: 20, color: AppColors.divider),
          _buildInfoRow(
            Icons.ac_unit_rounded,
            'Storage',
            _product.storageInstruction,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.08),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: AppColors.primary, size: 18),
        ),
        const SizedBox(width: 12),
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: GoogleFonts.outfit(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildHighlightChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppColors.primary, size: 14),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendationsSection() {
    if (_isRecommendationsLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (_recommendations.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Similar Items You May Like',
          style: GoogleFonts.outfit(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 190,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: _recommendations.length,
            itemBuilder: (context, index) {
              final item = _recommendations[index];
              final bool isItemNetworkImage = item.imageUrl.startsWith('http');
              return GestureDetector(
                onTap: () {
                  // Replace current detail view with the new item detail view
                  Navigator.pushReplacementNamed(
                    context,
                    '/product-detail',
                    arguments: item,
                  );
                },
                child: Container(
                  width: 140,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          decoration: const BoxDecoration(
                            color: AppColors.surfaceLight,
                            borderRadius:
                                BorderRadius.vertical(top: Radius.circular(11)),
                          ),
                          child: ClipRRect(
                            borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(11)),
                            child: item.imageUrl.isEmpty
                                ? const Icon(Icons.shopping_bag_outlined,
                                    color: AppColors.primary, size: 30)
                                : isItemNetworkImage
                                    ? Image.network(item.imageUrl,
                                        fit: BoxFit.cover)
                                    : Center(
                                        child: Text(item.imageUrl,
                                            style: const TextStyle(
                                                fontSize: 30))),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.name,
                              style: GoogleFonts.outfit(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '₹${item.price.toStringAsFixed(0)}',
                              style: GoogleFonts.outfit(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildStickyViewCartBanner() {
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
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.shopping_cart_outlined,
                        color: Colors.white, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      '$_cartTotalQty ${_cartTotalQty == 1 ? 'item' : 'items'} in cart',
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Text(
                      'View Cart',
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_forward_ios_rounded,
                        color: Colors.white, size: 11),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBottomActionBar() {
    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 16,
        bottom: MediaQuery.of(context).padding.bottom + 16,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(top: BorderSide(color: AppColors.divider, width: 1)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Total Price column
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Total Price',
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  color: AppColors.textHint,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                '₹${((_quantity > 0 ? _quantity : 1) * _product.price).toStringAsFixed(0)}',
                style: GoogleFonts.outfit(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),

          // Add / Stepper Button
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            child: _isLoading
                ? _buildLoadingBtn()
                : _quantity == 0
                    ? _buildAddBtn()
                    : _buildStepperBtn(),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingBtn() {
    return Container(
      key: const ValueKey('loading'),
      width: 140,
      height: 48,
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary, width: 1.5),
      ),
      child: const Center(
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            strokeWidth: 2.5,
            color: AppColors.primary,
          ),
        ),
      ),
    );
  }

  Widget _buildAddBtn() {
    return GestureDetector(
      key: const ValueKey('add'),
      onTap: _addToCart,
      child: Container(
        width: 140,
        height: 48,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.primary, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.1),
              blurRadius: 6,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Center(
          child: Text(
            'ADD TO CART',
            style: GoogleFonts.outfit(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
              letterSpacing: 0.5,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStepperBtn() {
    return Container(
      key: const ValueKey('stepper'),
      width: 140,
      height: 48,
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(12),
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
            onTap: () => _changeQuantity(_quantity - 1),
            child: const Icon(Icons.remove, color: Colors.white, size: 20),
          ),
          Text(
            '$_quantity',
            style: GoogleFonts.outfit(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: Colors.white,
            ),
          ),
          GestureDetector(
            onTap: () => _changeQuantity(_quantity + 1),
            child: const Icon(Icons.add, color: Colors.white, size: 20),
          ),
        ],
      ),
    );
  }
}
