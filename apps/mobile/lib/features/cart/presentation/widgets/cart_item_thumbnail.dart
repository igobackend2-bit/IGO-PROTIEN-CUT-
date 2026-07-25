import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../utils/app_colors.dart';

/// Small product thumbnail shared by [CartItemCard] and
/// [SavedForLaterSection] — one image-loading implementation, not two.
class CartItemThumbnail extends StatelessWidget {
  final String imageUrl;
  const CartItemThumbnail({super.key, required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    if (imageUrl.isEmpty) {
      return const ColoredBox(color: AppColors.surfaceLight, child: Icon(Icons.shopping_bag_outlined, color: AppColors.primary));
    }
    if (!imageUrl.startsWith('http')) {
      return ColoredBox(color: AppColors.surfaceLight, child: Center(child: Text(imageUrl, style: const TextStyle(fontSize: 26))));
    }
    return CachedNetworkImage(
      imageUrl: imageUrl,
      fit: BoxFit.cover,
      placeholder: (context, _) => Shimmer.fromColors(
        baseColor: AppColors.surfaceLight,
        highlightColor: Colors.white,
        child: Container(color: Colors.white),
      ),
      errorWidget: (context, _, __) => const ColoredBox(color: AppColors.surfaceLight, child: Icon(Icons.shopping_bag_outlined, color: AppColors.primary)),
    );
  }
}
