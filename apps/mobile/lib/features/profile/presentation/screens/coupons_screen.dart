import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../cart/domain/entities/coupon.dart';
import '../providers/coupon_listing_provider.dart';

class CouponsScreen extends ConsumerStatefulWidget {
  const CouponsScreen({super.key});

  @override
  ConsumerState<CouponsScreen> createState() => _CouponsScreenState();
}

class _CouponsScreenState extends ConsumerState<CouponsScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController = TabController(length: 2, vsync: this);

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _copyCode(String code) {
    Clipboard.setData(ClipboardData(text: code));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$code copied to clipboard', style: GoogleFonts.outfit()), backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final couponsAsync = ref.watch(couponListingProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('My Coupons', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [Tab(text: 'Active'), Tab(text: 'Expired')],
        ),
      ),
      body: couponsAsync.when(
        data: (coupons) {
          final active = coupons.where((c) => !c.isExpired).toList();
          final expired = coupons.where((c) => c.isExpired).toList();
          return TabBarView(
            controller: _tabController,
            children: [_couponList(active), _couponList(expired)],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (_, __) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off_rounded, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text("Couldn't load coupons.", style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary)),
              const SizedBox(height: 12),
              TextButton(onPressed: () => ref.invalidate(couponListingProvider), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }

  Widget _couponList(List<CouponListing> coupons) {
    if (coupons.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.local_offer_outlined, size: 56, color: AppColors.textHint),
              const SizedBox(height: 12),
              Text('No coupons here.', style: GoogleFonts.outfit(fontSize: 14, color: AppColors.textSecondary)),
            ],
          ),
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: coupons.length,
      itemBuilder: (context, index) {
        final coupon = coupons[index];
        return Opacity(
          opacity: coupon.isExpired ? 0.55 : 1.0,
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.divider),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.local_offer_rounded, color: AppColors.primary),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(coupon.code, style: GoogleFonts.outfit(fontSize: 14.5, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 3),
                      Text(coupon.description, style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
                      if (coupon.expiresAt != null) ...[
                        const SizedBox(height: 3),
                        Text(
                          coupon.isExpired ? 'Expired' : 'Valid until ${coupon.expiresAt!.day}/${coupon.expiresAt!.month}/${coupon.expiresAt!.year}',
                          style: GoogleFonts.outfit(fontSize: 10.5, color: coupon.isExpired ? AppColors.error : AppColors.textHint, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ],
                  ),
                ),
                if (!coupon.isExpired)
                  IconButton(
                    icon: const Icon(Icons.copy_rounded, size: 18, color: AppColors.primary),
                    onPressed: () => _copyCode(coupon.code),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
