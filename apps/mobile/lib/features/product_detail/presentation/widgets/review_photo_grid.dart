import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../utils/app_colors.dart';
import '../screens/review_photo_viewer_screen.dart';

class ReviewPhotoGrid extends StatelessWidget {
  final List<String> photos;
  const ReviewPhotoGrid({super.key, required this.photos});

  @override
  Widget build(BuildContext context) {
    if (photos.isEmpty) return const SizedBox.shrink();
    return SizedBox(
      height: 72,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: photos.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          return GestureDetector(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => ReviewPhotoViewerScreen(photos: photos, initialIndex: index)),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              // CachedNetworkImage only fetches/decodes once this tile is
              // actually built by the ListView, i.e. lazily as it scrolls
              // into view — no eager fetch of every photo up front.
              child: CachedNetworkImage(
                imageUrl: photos[index],
                width: 72,
                height: 72,
                fit: BoxFit.cover,
                placeholder: (context, url) => Shimmer.fromColors(
                  baseColor: AppColors.surfaceLight,
                  highlightColor: Colors.white,
                  child: Container(width: 72, height: 72, color: Colors.white),
                ),
                errorWidget: (context, url, error) => Container(
                  width: 72,
                  height: 72,
                  color: AppColors.surfaceLight,
                  child: const Icon(Icons.broken_image_outlined, color: AppColors.textHint, size: 20),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
