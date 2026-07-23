import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../promotions/presentation/screens/offers_screen.dart';
import '../../../promotions/presentation/widgets/combo_pack_section.dart';
import '../../domain/entities/home_data.dart';
import '../providers/home_providers.dart';
import '../widgets/flash_sale_section.dart';
import '../widgets/hero_banner_carousel.dart';
import '../widgets/home_app_header.dart';
import '../widgets/home_category_selector.dart';
import '../widgets/home_empty_state.dart';
import '../widgets/home_error_state.dart';
import '../widgets/home_search_bar.dart';
import '../widgets/home_shimmer.dart';
import '../widgets/offer_cards_row.dart';
import '../widgets/product_section_slider.dart';
import '../widgets/staggered_entrance.dart';
import '../widgets/subscription_banner.dart';

/// The Home tab content — everything above the bottom navigation bar.
/// Mounted as tab index 0 inside the existing shell in
/// lib/screens/home_screen.dart; Search/Orders/Profile tabs are untouched.
class HomeTabScreen extends ConsumerWidget {
  const HomeTabScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeAsync = ref.watch(homeDataProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: AnnotatedRegion<SystemUiOverlayStyle>(
        value: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
          statusBarBrightness: Brightness.dark,
        ),
        child: Builder(
          builder: (context) {
            if (homeAsync.hasValue) {
              final data = homeAsync.value!;
              return RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () => ref.read(homeDataProvider.notifier).refresh(),
                child: data.isEmpty
                    ? ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        children: const [HomeEmptyState()],
                      )
                    : _HomeContent(data: data),
              );
            }

            if (homeAsync.hasError) {
              return ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  HomeErrorState(
                    error: homeAsync.error,
                    onRetry: () => ref.invalidate(homeDataProvider),
                  ),
                ],
              );
            }

            return const HomeSkeletonLoader();
          },
        ),
      ),
    );
  }
}

class _HomeContent extends StatelessWidget {
  final HomeData data;
  const _HomeContent({required this.data});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      slivers: [
        SliverToBoxAdapter(child: _buildHeader(context)),
        const SliverToBoxAdapter(child: SizedBox(height: 20)),
        if (data.categories.isNotEmpty) ...[
          SliverToBoxAdapter(
            child: StaggeredEntrance(
              delay: const Duration(milliseconds: 50),
              child: HomeCategorySelector(categories: data.categories),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 20)),
        ],
        if (data.offers.isNotEmpty) ...[
          SliverToBoxAdapter(
            child: StaggeredEntrance(
              delay: const Duration(milliseconds: 100),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Offers for You', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                    TextButton(
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const OffersScreen())),
                      child: Text('See all', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.primary)),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: StaggeredEntrance(
              delay: const Duration(milliseconds: 100),
              child: OfferCardsRow(offers: data.offers),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
        SliverToBoxAdapter(
          child: StaggeredEntrance(
            delay: const Duration(milliseconds: 150),
            child: FlashSaleSection(homeData: data),
          ),
        ),
        if (data.flashSale.isNotEmpty) const SliverToBoxAdapter(child: SizedBox(height: 28)),
        if (data.comboPacks.isNotEmpty) ...[
          SliverToBoxAdapter(
            child: StaggeredEntrance(
              delay: const Duration(milliseconds: 175),
              child: ComboPackSection(comboPacks: data.comboPacks),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 28)),
        ],
        SliverToBoxAdapter(
          child: StaggeredEntrance(
            delay: const Duration(milliseconds: 200),
            child: ProductSectionSlider(
              title: 'Featured Products',
              subtitle: 'Hand-picked for you across every category',
              products: data.featured,
              homeData: data,
            ),
          ),
        ),
        if (data.featured.isNotEmpty) const SliverToBoxAdapter(child: SizedBox(height: 28)),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          sliver: SliverToBoxAdapter(
            child: StaggeredEntrance(
              delay: const Duration(milliseconds: 250),
              child: const SubscriptionBanner(),
            ),
          ),
        ),
        const SliverToBoxAdapter(child: SizedBox(height: 28)),
        SliverToBoxAdapter(
          child: StaggeredEntrance(
            delay: const Duration(milliseconds: 300),
            child: ProductSectionSlider(
              title: 'Best Sellers',
              subtitle: 'Highest protein picks, loved by everyone',
              products: data.bestSellers,
              homeData: data,
            ),
          ),
        ),
        if (data.bestSellers.isNotEmpty) const SliverToBoxAdapter(child: SizedBox(height: 28)),
        SliverToBoxAdapter(
          child: StaggeredEntrance(
            delay: const Duration(milliseconds: 350),
            child: ProductSectionSlider(
              title: "Today's Deals",
              subtitle: 'Limited-time discounts, refreshed daily',
              products: data.todaysDeals,
              homeData: data,
            ),
          ),
        ),
        if (data.todaysDeals.isNotEmpty) const SliverToBoxAdapter(child: SizedBox(height: 28)),
        SliverToBoxAdapter(
          child: StaggeredEntrance(
            delay: const Duration(milliseconds: 400),
            child: ProductSectionSlider(
              title: 'Recommended for You',
              subtitle: 'Based on what you like',
              products: data.recommended,
              homeData: data,
            ),
          ),
        ),
        if (data.recommended.isNotEmpty) const SliverToBoxAdapter(child: SizedBox(height: 28)),
        if (data.recentlyViewed.isNotEmpty) ...[
          SliverToBoxAdapter(
            child: StaggeredEntrance(
              delay: const Duration(milliseconds: 450),
              child: ProductSectionSlider(
                title: 'Recently Viewed',
                products: data.recentlyViewed,
                homeData: data,
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 28)),
        ],
        const SliverToBoxAdapter(child: SizedBox(height: 12)),
      ],
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top + 8, bottom: 20),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF0F5A31), Color(0xFF1D8348)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(32),
          bottomRight: Radius.circular(32),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: HomeAppHeader(),
          ),
          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: HomeSearchBar(),
          ),
          const SizedBox(height: 16),
          HeroBannerCarousel(
            banners: data.banners,
            onTap: (banner) {
              if (banner.deepLinkCategory != null) {
                Navigator.pushNamed(context, '/products', arguments: banner.deepLinkCategory);
              } else {
                Navigator.pushNamed(context, '/products');
              }
            },
          ),
        ],
      ),
    );
  }
}
