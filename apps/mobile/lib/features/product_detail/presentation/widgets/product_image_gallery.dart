import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../../../../models/product_model.dart';
import '../../../../utils/app_colors.dart';

/// Multi-image gallery with dot indicators and a pinch-to-zoom full-screen
/// viewer. Falls back to a single-image gallery when the product only has
/// one real image (no fake duplicate images are ever shown).
class ProductImageGallery extends StatefulWidget {
  final Product product;
  const ProductImageGallery({super.key, required this.product});

  @override
  State<ProductImageGallery> createState() => _ProductImageGalleryState();
}

class _ProductImageGalleryState extends State<ProductImageGallery> {
  final PageController _controller = PageController();
  int _currentIndex = 0;

  List<String> get _images {
    final urls = widget.product.imageUrls;
    if (urls != null && urls.isNotEmpty) return urls;
    if (widget.product.imageUrl.isNotEmpty) return [widget.product.imageUrl];
    return [];
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _openZoomViewer(int startIndex) {
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: false,
        barrierColor: Colors.black,
        transitionDuration: const Duration(milliseconds: 250),
        pageBuilder: (context, animation, __) => FadeTransition(
          opacity: animation,
          child: _ZoomGalleryViewer(images: _images, initialIndex: startIndex),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final images = _images;
    if (images.isEmpty) {
      return Container(
        color: AppColors.surfaceLight,
        child: const Center(
          child: Icon(Icons.shopping_bag_outlined, size: 100, color: AppColors.primary),
        ),
      );
    }

    return Stack(
      fit: StackFit.expand,
      children: [
        PageView.builder(
          controller: _controller,
          itemCount: images.length,
          onPageChanged: (i) => setState(() => _currentIndex = i),
          itemBuilder: (context, index) {
            final child = _GalleryImage(url: images[index]);
            return GestureDetector(
              onTap: () => _openZoomViewer(index),
              child: index == 0
                  ? Hero(tag: 'product-image-${widget.product.id}', child: child)
                  : child,
            );
          },
        ),
        if (images.length > 1)
          Positioned(
            bottom: 16,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(images.length, (i) {
                final isActive = i == _currentIndex;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: isActive ? 20 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(isActive ? 1 : 0.5),
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
          ),
        if (images.length > 1)
          Positioned(
            top: 100,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.45),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '${_currentIndex + 1}/${images.length}',
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
              ),
            ),
          ),
      ],
    );
  }
}

class _GalleryImage extends StatelessWidget {
  final String url;
  const _GalleryImage({required this.url});

  @override
  Widget build(BuildContext context) {
    if (!url.startsWith('http')) {
      return Container(
        color: AppColors.surfaceLight,
        child: Center(child: Text(url, style: const TextStyle(fontSize: 120))),
      );
    }
    return CachedNetworkImage(
      imageUrl: url,
      fit: BoxFit.cover,
      placeholder: (context, _) => Shimmer.fromColors(
        baseColor: AppColors.surfaceLight,
        highlightColor: Colors.white,
        child: Container(color: Colors.white),
      ),
      errorWidget: (context, _, __) => Container(
        color: AppColors.surfaceLight,
        child: const Center(child: Icon(Icons.shopping_bag_outlined, size: 100, color: AppColors.primary)),
      ),
    );
  }
}

class _ZoomGalleryViewer extends StatefulWidget {
  final List<String> images;
  final int initialIndex;
  const _ZoomGalleryViewer({required this.images, required this.initialIndex});

  @override
  State<_ZoomGalleryViewer> createState() => _ZoomGalleryViewerState();
}

class _ZoomGalleryViewerState extends State<_ZoomGalleryViewer> {
  late final PageController _controller = PageController(initialPage: widget.initialIndex);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          PageView.builder(
            controller: _controller,
            itemCount: widget.images.length,
            itemBuilder: (context, index) {
              return InteractiveViewer(
                minScale: 1,
                maxScale: 4,
                child: Center(child: _GalleryImage(url: widget.images[index])),
              );
            },
          ),
          Positioned(
            top: 16,
            right: 16,
            child: SafeArea(
              child: IconButton(
                icon: const Icon(Icons.close_rounded, color: Colors.white, size: 28),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
