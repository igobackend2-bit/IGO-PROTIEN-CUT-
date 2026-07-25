import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/product_model.dart';
import '../../../../services/cart_service.dart';
import '../../../../shared/widgets/product_grid_card.dart';
import '../../../../shared/widgets/product_list_tile.dart';
import '../../../../utils/app_colors.dart';
import '../../domain/entities/product_filter_state.dart';
import '../providers/product_discovery_providers.dart';
import '../providers/product_discovery_state.dart';
import '../widgets/active_filter_chips_row.dart';
import '../widgets/discovery_empty_state.dart';
import '../widgets/discovery_error_state.dart';
import '../widgets/discovery_search_field.dart';
import '../widgets/discovery_skeleton.dart';
import '../widgets/filter_bottom_sheet.dart';
import '../widgets/sort_bottom_sheet.dart';

/// Product Discovery — category browsing, search, advanced filtering,
/// sorting and infinite scroll. Backs the app's `/products` route,
/// replacing the previous barebones product listing.
class ProductDiscoveryScreen extends ConsumerStatefulWidget {
  final String? initialArg;
  const ProductDiscoveryScreen({super.key, this.initialArg});

  @override
  ConsumerState<ProductDiscoveryScreen> createState() => _ProductDiscoveryScreenState();
}

class _ProductDiscoveryScreenState extends ConsumerState<ProductDiscoveryScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(productDiscoveryProvider.notifier).initialize(widget.initialArg);
    });
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position;
    if (position.pixels >= position.maxScrollExtent - 400) {
      ref.read(productDiscoveryProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productDiscoveryProvider);
    final notifier = ref.read(productDiscoveryProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: Text(_titleFor(state.filters), style: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 16, color: Colors.white)),
        actions: [
          IconButton(
            tooltip: state.filters.viewMode == ProductViewMode.grid ? 'List view' : 'Grid view',
            icon: Icon(
              state.filters.viewMode == ProductViewMode.grid ? Icons.view_list_rounded : Icons.grid_view_rounded,
              color: Colors.white,
            ),
            onPressed: notifier.toggleViewMode,
          ),
          IconButton(
            tooltip: 'Sort',
            icon: const Icon(Icons.sort_rounded, color: Colors.white),
            onPressed: () async {
              final sort = await showSortBottomSheet(context, state.filters.sort);
              if (sort != null) notifier.setSort(sort);
            },
          ),
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                tooltip: 'Filters',
                icon: const Icon(Icons.tune_rounded, color: Colors.white),
                onPressed: () async {
                  final result = await showFilterBottomSheet(
                    context,
                    current: state.filters,
                    options: state.filterOptions,
                  );
                  if (result != null) notifier.applyFilters(result);
                },
              ),
              if (state.filters.activeFilterCount > 0)
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: const BoxDecoration(color: Color(0xFFE67E22), shape: BoxShape.circle),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '${state.filters.activeFilterCount}',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 4),
        ],
      ),
      // LayoutBuilder here sees the Scaffold body's TRUE available height —
      // already reduced for the on-screen keyboard by resizeToAvoidBottomInset
      // — which is what DiscoverySearchField's suggestions panel needs to cap
      // itself against without overflowing. Everything subtracted below has
      // a known, fixed size (no guessing): the padding above the search box,
      // the search box itself, the spacing/filter-chips row below it, and
      // the panel's own top margin.
      body: LayoutBuilder(
        builder: (context, constraints) {
          const paddingAboveSearchBox = 12.0;
          const searchBoxHeight = 48.0;
          const spacingAfterSearchField = 10.0;
          const panelTopMargin = 10.0;
          final filterChipsRowHeight = state.filters.hasAnyFilter ? 40.0 + 8.0 : 0.0;
          final reserved = paddingAboveSearchBox + searchBoxHeight + spacingAfterSearchField + filterChipsRowHeight + panelTopMargin;
          final maxSuggestionsHeight = (constraints.maxHeight - reserved).clamp(120.0, constraints.maxHeight);

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, paddingAboveSearchBox, 16, 0),
                child: DiscoverySearchField(
                  initialQuery: state.filters.searchQuery,
                  onSubmit: notifier.submitSearch,
                  maxSuggestionsHeight: maxSuggestionsHeight,
                ),
              ),
              const SizedBox(height: spacingAfterSearchField),
              ActiveFilterChipsRow(
                filters: state.filters,
                onChanged: notifier.applyFilters,
              ),
              if (state.filters.hasAnyFilter) const SizedBox(height: 8),
              Expanded(child: _buildBody(context, state, notifier)),
            ],
          );
        },
      ),
    );
  }

  String _titleFor(ProductFilterState filters) {
    if (filters.searchQuery.isNotEmpty) return 'Search: "${filters.searchQuery}"';
    if (filters.proteinTypes.length == 1) return '${filters.proteinTypes.first} Cuts';
    return 'All Products';
  }

  Widget _buildBody(BuildContext context, ProductDiscoveryState state, ProductDiscoveryNotifier notifier) {
    if (state.isLoadingFirstPage) {
      return DiscoverySkeleton(viewMode: state.filters.viewMode);
    }

    if (state.error != null) {
      return DiscoveryErrorState(onRetry: notifier.retry);
    }

    if (state.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: notifier.refresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            DiscoveryEmptyState(
              hasActiveFilters: state.filters.hasAnyFilter,
              onClearFilters: state.filters.hasAnyFilter ? notifier.clearFilters : null,
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: notifier.refresh,
      child: state.filters.viewMode == ProductViewMode.grid
          ? _buildGrid(state)
          : _buildList(state),
    );
  }

  Widget _buildGrid(ProductDiscoveryState state) {
    return CustomScrollView(
      controller: _scrollController,
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.68,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, index) => _cardFor(state.items[index]),
              childCount: state.items.length,
            ),
          ),
        ),
        SliverToBoxAdapter(child: _buildFooter(state)),
      ],
    );
  }

  Widget _buildList(ProductDiscoveryState state) {
    return CustomScrollView(
      controller: _scrollController,
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) => _tileFor(state.items[index]),
              childCount: state.items.length,
            ),
          ),
        ),
        SliverToBoxAdapter(child: _buildFooter(state)),
      ],
    );
  }

  Widget _buildFooter(ProductDiscoveryState state) {
    if (state.isLoadingMore) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2.5)),
      );
    }
    if (!state.hasMore && state.items.isNotEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 24),
        child: Center(
          child: Text("You've reached the end 🥩", style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textHint)),
        ),
      );
    }
    return const SizedBox(height: 16);
  }

  Widget _cardFor(Product product) {
    return ProductGridCard(
      key: ValueKey(product.id),
      product: product,
      onTap: () => Navigator.pushNamed(context, '/product-detail', arguments: product),
      onAddToCart: () => CartService().addToCart(product.id),
    );
  }

  Widget _tileFor(Product product) {
    return ProductListTile(
      key: ValueKey(product.id),
      product: product,
      onTap: () => Navigator.pushNamed(context, '/product-detail', arguments: product),
      onAddToCart: () => CartService().addToCart(product.id),
    );
  }
}
