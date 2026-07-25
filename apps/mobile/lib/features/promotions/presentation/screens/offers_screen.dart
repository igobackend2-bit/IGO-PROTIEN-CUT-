import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../product_detail/presentation/screens/product_detail_screen.dart';
import '../../../product_discovery/presentation/screens/product_discovery_screen.dart';
import '../../domain/entities/offer.dart';
import '../providers/promotion_providers.dart';
import '../widgets/combo_pack_section.dart';
import '../widgets/offer_banner_card.dart';
import '../widgets/promotion_states.dart';

/// Full-page offer discovery: Featured Offers, Combo Deals, Flash Sale and
/// Festival Campaigns — all reading the same [promotionsProvider] shown on
/// Home, so nothing here can show a deal Home doesn't also honor.
class OffersScreen extends ConsumerWidget {
  const OffersScreen({super.key});

  void _openOffer(BuildContext context, Offer offer) {
    if (offer.product != null) {
      Navigator.push(context, MaterialPageRoute(builder: (_) => ProductDetailScreen(product: offer.product)));
    } else if (offer.category != null) {
      Navigator.push(context, MaterialPageRoute(builder: (_) => ProductDiscoveryScreen(initialArg: offer.category)));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(promotionsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Offers & Deals', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: Builder(
        builder: (context) {
          if (state.isLoading) return const PromotionSkeleton();
          if (state.error != null) return PromotionErrorState(onRetry: () => ref.read(promotionsProvider.notifier).retry());
          if (state.isEmpty) return const PromotionEmptyState();

          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () => ref.read(promotionsProvider.notifier).refresh(),
            child: ListView(
              padding: const EdgeInsets.only(bottom: 24),
              children: [
                if (state.flashSale.isNotEmpty) ..._section(context, '⚡ Flash Sale', 'Grab it before it\'s gone', state.flashSale, showCountdown: true, showStock: true),
                ComboPackSection(comboPacks: state.comboPacks),
                if (state.featured.isNotEmpty) ..._section(context, '🌟 Featured Offers', 'Hand-picked deals for you', state.featured),
                if (state.festival.isNotEmpty) ..._section(context, '🎉 Festival Campaigns', 'Limited-time seasonal savings', state.festival),
              ],
            ),
          );
        },
      ),
    );
  }

  List<Widget> _section(
    BuildContext context,
    String title,
    String subtitle,
    List<Offer> offers, {
    bool showCountdown = false,
    bool showStock = false,
  }) {
    return [
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
            const SizedBox(height: 2),
            Text(subtitle, style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textHint)),
          ],
        ),
      ),
      ...offers.map(
        (offer) => Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          child: OfferBannerCard(
            offer: offer,
            showCountdown: showCountdown,
            showStock: showStock,
            onTap: (offer.product != null || offer.category != null) ? () => _openOffer(context, offer) : null,
          ),
        ),
      ),
    ];
  }
}
