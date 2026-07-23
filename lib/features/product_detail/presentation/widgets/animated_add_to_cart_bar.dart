import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/product_model.dart';
import '../../../../utils/app_colors.dart';

/// Sticky bottom bar: total price + Add-to-cart / quantity stepper, with a
/// small pop animation when an item is first added.
class AnimatedAddToCartBar extends StatefulWidget {
  final Product product;
  final int quantity;
  final bool isLoading;
  final VoidCallback onAdd;
  final ValueChanged<int> onQuantityChange;

  const AnimatedAddToCartBar({
    super.key,
    required this.product,
    required this.quantity,
    required this.isLoading,
    required this.onAdd,
    required this.onQuantityChange,
  });

  @override
  State<AnimatedAddToCartBar> createState() => _AnimatedAddToCartBarState();
}

class _AnimatedAddToCartBarState extends State<AnimatedAddToCartBar> with SingleTickerProviderStateMixin {
  late final AnimationController _popController = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 300),
    lowerBound: 0.9,
    upperBound: 1.08,
    value: 1.0,
  );

  void _handleAdd() {
    widget.onAdd();
    _popController.forward(from: 0.9).then((_) => _popController.animateTo(1.0, duration: const Duration(milliseconds: 100)));
  }

  @override
  void dispose() {
    _popController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isAvailable = widget.product.isAvailable;

    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 16,
        bottom: MediaQuery.of(context).padding.bottom + 16,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(top: BorderSide(color: AppColors.divider, width: 1)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -4)),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Total Price', style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textHint, fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              Text(
                '₹${((widget.quantity > 0 ? widget.quantity : 1) * widget.product.price).toStringAsFixed(0)}',
                style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
            ],
          ),
          if (!isAvailable)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(12)),
              child: Text('OUT OF STOCK', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.grey.shade600)),
            )
          else
            ScaleTransition(
              scale: _popController,
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: widget.isLoading
                    ? _loadingButton()
                    : widget.quantity == 0
                        ? _addButton()
                        : _stepperButton(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _loadingButton() {
    return Container(
      key: const ValueKey('loading'),
      width: 140,
      height: 48,
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary, width: 1.5),
      ),
      child: const Center(
        child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.primary)),
      ),
    );
  }

  Widget _addButton() {
    return GestureDetector(
      key: const ValueKey('add'),
      onTap: _handleAdd,
      child: Container(
        width: 140,
        height: 48,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.primary, width: 1.5),
          boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.1), blurRadius: 6, offset: const Offset(0, 3))],
        ),
        child: Center(
          child: Text(
            'ADD TO CART',
            style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primary, letterSpacing: 0.5),
          ),
        ),
      ),
    );
  }

  Widget _stepperButton() {
    return Container(
      key: const ValueKey('stepper'),
      width: 140,
      height: 48,
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 3))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          GestureDetector(
            onTap: () => widget.onQuantityChange(widget.quantity - 1),
            child: const Icon(Icons.remove, color: Colors.white, size: 20),
          ),
          Text('${widget.quantity}', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
          GestureDetector(
            onTap: () => widget.onQuantityChange(widget.quantity + 1),
            child: const Icon(Icons.add, color: Colors.white, size: 20),
          ),
        ],
      ),
    );
  }
}
