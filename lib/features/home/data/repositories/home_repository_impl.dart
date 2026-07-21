import 'package:flutter/material.dart';

import '../../../../models/product_model.dart';
import '../../../../services/product_service.dart';
import '../../../../utils/app_colors.dart';
import '../../domain/entities/home_data.dart';
import '../../domain/repositories/home_repository.dart';
import '../models/category_ui_model.dart';
import '../models/home_banner_model.dart';
import '../services/recently_viewed_service.dart';

/// Assembles [HomeData] from the existing [ProductService] (Supabase) plus
/// locally-derived sections and static marketing content.
///
/// The catalog currently has no `is_featured` / `is_bestseller` / discount
/// columns, so sections below are derived deterministically from the data
/// that does exist (category, protein, price, id) rather than randomly, so
/// the home screen stays stable across rebuilds. Swap these derivations for
/// real backend flags once the schema supports them — only this file would
/// need to change.
class HomeRepositoryImpl implements HomeRepository {
  final ProductService _productService;
  final RecentlyViewedService _recentlyViewedService;

  HomeRepositoryImpl({
    ProductService? productService,
    RecentlyViewedService? recentlyViewedService,
  })  : _productService = productService ?? ProductService(),
        _recentlyViewedService = recentlyViewedService ?? RecentlyViewedService();

  @override
  Future<HomeData> loadHomeData() async {
    final products = await _productService.fetchProducts();

    final categories = _buildCategories(products);
    final featured = _roundRobinByCategory(products, take: 10);
    final bestSellers = _sortedByProteinDesc(products, take: 10);
    final flashSale = _subset(products, remainder: 0);
    final todaysDeals = _subset(products, remainder: 1);
    final recentlyViewed = await _resolveRecentlyViewed(products);
    final recommended = _buildRecommended(products, recentlyViewed, take: 10);

    final discounts = <String, int>{};
    for (final p in flashSale) {
      discounts[p.id] = _deterministicDiscount(p.id, min: 20, max: 40);
    }
    for (final p in todaysDeals) {
      discounts.putIfAbsent(
        p.id,
        () => _deterministicDiscount(p.id, min: 8, max: 20),
      );
    }

    return HomeData(
      banners: _staticBanners(),
      offers: _staticOffers(),
      categories: categories,
      featured: featured,
      bestSellers: bestSellers,
      flashSale: flashSale,
      flashSaleEndsAt: _nextMidnight(),
      todaysDeals: todaysDeals,
      recommended: recommended,
      recentlyViewed: recentlyViewed,
      discountPercentByProductId: discounts,
    );
  }

  // ─── Section derivation ──────────────────────────────────────────────

  List<CategoryUiModel> _buildCategories(List<Product> products) {
    final counts = <String, int>{};
    for (final p in products) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    final names = counts.keys.toList()..sort();
    return names
        .map((name) => CategoryUiModel(
              name: name,
              emoji: CategoryUiModel.emojiFor(name),
              productCount: counts[name] ?? 0,
            ))
        .toList();
  }

  List<Product> _roundRobinByCategory(List<Product> products, {required int take}) {
    final byCategory = <String, List<Product>>{};
    for (final p in products) {
      byCategory.putIfAbsent(p.category, () => []).add(p);
    }
    final categoryNames = byCategory.keys.toList()..sort();
    final result = <Product>[];
    var index = 0;
    while (result.length < take && categoryNames.isNotEmpty) {
      var addedAny = false;
      for (final cat in categoryNames) {
        final list = byCategory[cat]!;
        if (index < list.length) {
          result.add(list[index]);
          addedAny = true;
          if (result.length == take) break;
        }
      }
      if (!addedAny) break;
      index++;
    }
    return result;
  }

  List<Product> _sortedByProteinDesc(List<Product> products, {required int take}) {
    final sorted = [...products]
      ..sort((a, b) => b.proteinPer100g.compareTo(a.proteinPer100g));
    return sorted.take(take).toList();
  }

  List<Product> _subset(List<Product> products, {required int remainder, int mod = 3}) {
    return products.where((p) => p.id.hashCode.abs() % mod == remainder).toList();
  }

  List<Product> _buildRecommended(
    List<Product> products,
    List<Product> recentlyViewed,
    {required int take}
  ) {
    if (recentlyViewed.isNotEmpty) {
      final likedCategories = recentlyViewed.map((p) => p.category).toSet();
      final viewedIds = recentlyViewed.map((p) => p.id).toSet();
      final matches = products
          .where((p) => likedCategories.contains(p.category) && !viewedIds.contains(p.id))
          .toList();
      if (matches.isNotEmpty) return matches.take(take).toList();
    }
    // Cold-start fallback: budget-friendly picks first.
    final sorted = [...products]..sort((a, b) => a.price.compareTo(b.price));
    return sorted.take(take).toList();
  }

  Future<List<Product>> _resolveRecentlyViewed(List<Product> products) async {
    final ids = await _recentlyViewedService.getViewedIds();
    if (ids.isEmpty) return [];
    final byId = {for (final p in products) p.id: p};
    return ids.map((id) => byId[id]).whereType<Product>().toList();
  }

  int _deterministicDiscount(String productId, {required int min, required int max}) {
    final span = max - min;
    final offset = productId.hashCode.abs() % (span <= 0 ? 1 : span);
    return min + offset;
  }

  DateTime _nextMidnight() {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day).add(const Duration(days: 1));
  }

  // ─── Static marketing content ───────────────────────────────────────
  // No `banners`/`offers` table exists yet — these are curated placeholders
  // wired through the repository so a future Supabase-backed source is a
  // one-line swap without touching the presentation layer.

  List<HomeBanner> _staticBanners() {
    return const [
      HomeBanner(
        id: 'banner_welcome',
        title: 'Farm Fresh, Delivered Daily',
        subtitle: 'Hand-cut, hygienically packed meat & seafood at your door',
        ctaLabel: 'Shop Now',
        gradientColors: [Color(0xFF0F5A31), Color(0xFF1D8348)],
      ),
      HomeBanner(
        id: 'banner_flash',
        title: 'Flash Sale is Live ⚡',
        subtitle: 'Up to 40% off on premium cuts — today only',
        ctaLabel: 'Grab Deals',
        gradientColors: [Color(0xFFBA4A00), Color(0xFFE67E22)],
      ),
      HomeBanner(
        id: 'banner_subscription',
        title: 'Never Run Out of Protein',
        subtitle: 'Subscribe weekly and save on every order',
        ctaLabel: 'Explore Plans',
        gradientColors: [Color(0xFF117A65), Color(0xFF16A085)],
      ),
      HomeBanner(
        id: 'banner_quality',
        title: '100% Antibiotic Free',
        subtitle: 'Sourced from trusted farms, quality checked twice',
        ctaLabel: 'Learn More',
        gradientColors: [Color(0xFF1F618D), Color(0xFF2E86C1)],
      ),
    ];
  }

  List<OfferCard> _staticOffers() {
    return const [
      OfferCard(
        id: 'offer_welcome20',
        title: 'Flat 20% Off',
        subtitle: 'On your first order',
        code: 'WELCOME20',
        gradientColors: [Color(0xFF1D8348), Color(0xFF27AE60)],
        icon: Icons.celebration_rounded,
      ),
      OfferCard(
        id: 'offer_bulk',
        title: 'Buy 6 Get 1 Free',
        subtitle: 'On fresh cuts & steaks',
        code: 'FITBULK',
        gradientColors: [Color(0xFF117A65), Color(0xFF16A085)],
        icon: Icons.card_giftcard_rounded,
      ),
      OfferCard(
        id: 'offer_freeship',
        title: 'Free Delivery',
        subtitle: 'On orders above ₹499',
        code: 'FREESHIP',
        gradientColors: [Color(0xFF1F618D), Color(0xFF2E86C1)],
        icon: Icons.local_shipping_rounded,
      ),
    ];
  }
}

/// Small helper kept here (not in AppColors) since it's Home-specific and
/// derived, not a brand constant.
class HomeGradients {
  static const flashSale = LinearGradient(
    colors: [Color(0xFFBA4A00), Color(0xFFE67E22)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  static const subscription = LinearGradient(
    colors: [AppColors.primaryDark, AppColors.primary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
