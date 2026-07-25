import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/product_filter_state.dart';

/// Full-grid/list shimmer skeleton shown while the first page loads.
class DiscoverySkeleton extends StatelessWidget {
  final ProductViewMode viewMode;
  const DiscoverySkeleton({super.key, required this.viewMode});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.surfaceLight,
      highlightColor: Colors.white,
      period: const Duration(milliseconds: 1200),
      child: viewMode == ProductViewMode.grid ? _gridSkeleton() : _listSkeleton(),
    );
  }

  Widget _gridSkeleton() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.68,
      ),
      itemCount: 8,
      itemBuilder: (context, index) => Container(
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
      ),
    );
  }

  Widget _listSkeleton() {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 6,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) => Container(
        height: 96,
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
      ),
    );
  }
}
