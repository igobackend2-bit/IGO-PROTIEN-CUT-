import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../wishlist/presentation/providers/wishlist_providers.dart';

class WishlistButton extends ConsumerStatefulWidget {
  final String productId;
  const WishlistButton({super.key, required this.productId});

  @override
  ConsumerState<WishlistButton> createState() => _WishlistButtonState();
}

class _WishlistButtonState extends ConsumerState<WishlistButton> with SingleTickerProviderStateMixin {
  late final AnimationController _bounceController = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 250),
    lowerBound: 0.85,
    upperBound: 1.0,
    value: 1.0,
  );

  @override
  void dispose() {
    _bounceController.dispose();
    super.dispose();
  }

  Future<void> _handleTap() async {
    _bounceController.forward(from: 0.85);
    try {
      await ref.read(wishlistProvider(widget.productId).notifier).toggle();
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please log in to use your wishlist.', style: GoogleFonts.outfit()),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isWishlisted = ref.watch(wishlistProvider(widget.productId)).value ?? false;

    return GestureDetector(
      onTap: _handleTap,
      child: CircleAvatar(
        backgroundColor: Colors.white,
        child: AnimatedBuilder(
          animation: _bounceController,
          builder: (context, child) => Transform.scale(scale: _bounceController.value, child: child),
          child: Icon(
            isWishlisted ? Icons.favorite_rounded : Icons.favorite_border_rounded,
            color: isWishlisted ? AppColors.error : AppColors.textPrimary,
            size: 20,
          ),
        ),
      ),
    );
  }
}
