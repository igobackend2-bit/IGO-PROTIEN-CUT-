import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../utils/app_colors.dart';

/// Shared shimmer wrapper so every skeleton piece animates in sync.
class ShimmerBox extends StatelessWidget {
  final double width;
  final double height;
  final BorderRadius? borderRadius;

  const ShimmerBox({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: borderRadius ?? BorderRadius.circular(12),
      ),
    );
  }
}

/// Full-page skeleton shown while the Home screen loads for the first time.
class HomeSkeletonLoader extends StatelessWidget {
  const HomeSkeletonLoader({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.surfaceLight,
      highlightColor: Colors.white,
      period: const Duration(milliseconds: 1200),
      child: SingleChildScrollView(
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 60, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ShimmerBox(width: 160, height: 18, borderRadius: BorderRadius.circular(6)),
            const SizedBox(height: 10),
            ShimmerBox(width: 220, height: 12, borderRadius: BorderRadius.circular(6)),
            const SizedBox(height: 20),
            ShimmerBox(
              width: double.infinity,
              height: 50,
              borderRadius: BorderRadius.circular(14),
            ),
            const SizedBox(height: 20),
            ShimmerBox(
              width: double.infinity,
              height: 150,
              borderRadius: BorderRadius.circular(20),
            ),
            const SizedBox(height: 24),
            const _ShimmerCategoryRow(),
            const SizedBox(height: 24),
            const _ShimmerSection(cardWidth: 130, cardHeight: 190),
            const SizedBox(height: 24),
            const _ShimmerSection(cardWidth: 130, cardHeight: 190),
          ],
        ),
      ),
    );
  }
}

class _ShimmerCategoryRow extends StatelessWidget {
  const _ShimmerCategoryRow();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 76,
      child: Row(
        children: List.generate(
          5,
          (i) => Padding(
            padding: const EdgeInsets.only(right: 14),
            child: Column(
              children: [
                ShimmerBox(width: 56, height: 56, borderRadius: BorderRadius.circular(28)),
                const SizedBox(height: 8),
                ShimmerBox(width: 40, height: 8, borderRadius: BorderRadius.circular(4)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ShimmerSection extends StatelessWidget {
  final double cardWidth;
  final double cardHeight;

  const _ShimmerSection({required this.cardWidth, required this.cardHeight});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ShimmerBox(width: 140, height: 16, borderRadius: BorderRadius.circular(6)),
        const SizedBox(height: 12),
        SizedBox(
          height: cardHeight,
          child: Row(
            children: List.generate(
              4,
              (i) => Padding(
                padding: const EdgeInsets.only(right: 12),
                child: ShimmerBox(
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Lightweight shimmer placeholder for a single product image while it
/// loads over the network (used inside [CachedNetworkImage]'s placeholder).
class ProductImageShimmer extends StatelessWidget {
  const ProductImageShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.surfaceLight,
      highlightColor: Colors.white,
      child: Container(color: Colors.white),
    );
  }
}
