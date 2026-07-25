import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:share_plus/share_plus.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/wishlist_item.dart';
import '../providers/wishlist_providers.dart';
import '../widgets/recently_wishlisted_section.dart';
import '../widgets/wishlist_card.dart';
import '../widgets/wishlist_empty_state.dart';
import '../widgets/wishlist_error_state.dart';
import '../widgets/wishlist_skeleton.dart';
import '../widgets/wishlist_toolbar.dart';

class WishlistScreen extends ConsumerStatefulWidget {
  const WishlistScreen({super.key});

  @override
  ConsumerState<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends ConsumerState<WishlistScreen> {
  @override
  void initState() {
    super.initState();
    // Same staleness guard as CartScreen: wishlistListProvider only updates
    // via its own notifier or the per-product toggle's invalidate, so
    // refresh explicitly on every visit to be safe.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) ref.read(wishlistListProvider.notifier).refresh();
    });
  }

  void _shareWishlist(List<WishlistItem> items) {
    if (items.isEmpty) return;
    final lines = items.take(20).map((i) => '• ${i.product.name} — ₹${i.product.price.toStringAsFixed(0)}');
    final text = 'My Protein Cuts wishlist 🛒\n\n${lines.join('\n')}';
    Share.share(text, subject: 'My Protein Cuts Wishlist');
  }

  Future<void> _handleMoveAll() async {
    final movedCount = await ref.read(wishlistListProvider.notifier).moveAllToCart();
    if (!mounted) return;
    if (movedCount == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No available items to move.', style: GoogleFonts.outfit()), behavior: SnackBarBehavior.floating),
      );
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$movedCount ${movedCount == 1 ? 'item' : 'items'} moved to cart', style: GoogleFonts.outfit()),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(label: 'View Cart', textColor: Colors.white, onPressed: () => Navigator.pushNamed(context, '/cart')),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final listState = ref.watch(wishlistListProvider);
    final filtered = ref.watch(filteredWishlistProvider);
    final searchQuery = ref.watch(wishlistSearchQueryProvider);
    final hasAnyItems = listState.items.isNotEmpty;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('My Wishlist', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          if (hasAnyItems) ...[
            IconButton(
              icon: const Icon(Icons.ios_share_rounded, color: Colors.white),
              tooltip: 'Share Wishlist',
              onPressed: () => _shareWishlist(listState.items),
            ),
            IconButton(
              icon: const Icon(Icons.shopping_cart_checkout_rounded, color: Colors.white),
              tooltip: 'Move All to Cart',
              onPressed: _handleMoveAll,
            ),
          ],
        ],
      ),
      body: _buildBody(listState, filtered, searchQuery),
    );
  }

  Widget _buildBody(WishlistListState listState, List<WishlistItem> filtered, String searchQuery) {
    if (listState.isLoading) return const WishlistSkeleton();
    if (listState.error != null) {
      return WishlistErrorState(onRetry: () => ref.read(wishlistListProvider.notifier).retry());
    }
    if (listState.items.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () => ref.read(wishlistListProvider.notifier).refresh(),
        child: ListView(physics: const AlwaysScrollableScrollPhysics(), children: const [WishlistEmptyState()]),
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () => ref.read(wishlistListProvider.notifier).refresh(),
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          if (searchQuery.trim().isEmpty)
            const SliverToBoxAdapter(child: RecentlyWishlistedSection()),
          SliverToBoxAdapter(child: WishlistToolbar(resultCount: filtered.length)),
          if (filtered.isEmpty)
            const SliverToBoxAdapter(child: WishlistEmptyState(isSearchResult: true))
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 14,
                  crossAxisSpacing: 14,
                  childAspectRatio: 0.6,
                ),
                delegate: SliverChildBuilderDelegate(
                  (_, index) {
                    final item = filtered[index];
                    return WishlistCard(
                      item: item,
                      onTap: () => Navigator.pushNamed(context, '/product-detail', arguments: item.product),
                      onMoveToCart: () async {
                        final moved = await ref.read(wishlistListProvider.notifier).moveToCart(item);
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              moved ? '${item.product.name} moved to cart' : 'Could not move this item. Please try again.',
                              style: GoogleFonts.outfit(),
                            ),
                            backgroundColor: moved ? AppColors.success : AppColors.error,
                            behavior: SnackBarBehavior.floating,
                            action: moved
                                ? SnackBarAction(label: 'View Cart', textColor: Colors.white, onPressed: () => Navigator.pushNamed(context, '/cart'))
                                : null,
                          ),
                        );
                      },
                      onRemove: () => ref.read(wishlistListProvider.notifier).removeItem(item),
                    );
                  },
                  childCount: filtered.length,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
