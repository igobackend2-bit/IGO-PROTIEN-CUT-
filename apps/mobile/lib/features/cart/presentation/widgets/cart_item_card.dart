import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../subscriptions/presentation/screens/create_subscription_screen.dart';
import '../../domain/entities/cart_line_item.dart';
import 'cart_item_thumbnail.dart';

class CartItemCard extends StatelessWidget {
  final CartLineItem item;
  final VoidCallback onIncrement;
  final VoidCallback onDecrement;
  final VoidCallback onRemove;
  final VoidCallback onSaveForLater;

  const CartItemCard({
    super.key,
    required this.item,
    required this.onIncrement,
    required this.onDecrement,
    required this.onRemove,
    required this.onSaveForLater,
  });

  @override
  Widget build(BuildContext context) {
    final product = item.product;
    final isOutOfStock = !product.isAvailable;

    return Dismissible(
      key: ValueKey('cart-item-${item.id}'),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onRemove(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(color: AppColors.error, borderRadius: BorderRadius.circular(16)),
        child: const Icon(Icons.delete_outline_rounded, color: Colors.white),
      ),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.divider),
        ),
        child: Opacity(
          opacity: isOutOfStock ? 0.55 : 1.0,
          child: Column(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: SizedBox(width: 68, height: 68, child: CartItemThumbnail(imageUrl: product.imageUrl)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.name,
                          style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 3),
                        Text(
                          product.weight,
                          style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textHint),
                        ),
                        const SizedBox(height: 6),
                        if (isOutOfStock)
                          Text('Out of stock', style: GoogleFonts.outfit(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.error))
                        else
                          Text(
                            '₹${product.price.toStringAsFixed(0)} × ${item.quantity}',
                            style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary),
                          ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '₹${item.subtotal.toStringAsFixed(0)}',
                        style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary),
                      ),
                      const SizedBox(height: 8),
                      _QuantityStepper(
                        quantity: item.quantity,
                        onIncrement: isOutOfStock ? null : onIncrement,
                        onDecrement: onDecrement,
                      ),
                    ],
                  ),
                ],
              ),
              const Divider(height: 20, color: AppColors.divider),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton.icon(
                    onPressed: onSaveForLater,
                    style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(0, 0), tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                    icon: const Icon(Icons.bookmark_border_rounded, size: 15, color: AppColors.textSecondary),
                    label: Text('Save for later', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                  ),
                  if (!isOutOfStock)
                    TextButton.icon(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => CreateSubscriptionScreen(product: product, initialQuantity: item.quantity)),
                      ),
                      style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(0, 0), tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                      icon: const Icon(Icons.autorenew_rounded, size: 15, color: AppColors.primary),
                      label: Text('Subscribe', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuantityStepper extends StatefulWidget {
  final int quantity;
  final VoidCallback? onIncrement;
  final VoidCallback onDecrement;
  const _QuantityStepper({required this.quantity, required this.onIncrement, required this.onDecrement});

  @override
  State<_QuantityStepper> createState() => _QuantityStepperState();
}

class _QuantityStepperState extends State<_QuantityStepper> with SingleTickerProviderStateMixin {
  late final AnimationController _bump = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 150),
    lowerBound: 0.9,
    upperBound: 1.0,
    value: 1.0,
  );

  @override
  void didUpdateWidget(covariant _QuantityStepper oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.quantity != widget.quantity) {
      _bump.forward(from: 0.9);
    }
  }

  @override
  void dispose() {
    _bump.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 30,
      padding: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        gradient: widget.onIncrement == null ? null : AppColors.primaryGradient,
        color: widget.onIncrement == null ? Colors.grey.shade300 : null,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: widget.onDecrement,
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 6),
              child: Icon(Icons.remove, color: Colors.white, size: 15),
            ),
          ),
          ScaleTransition(
            scale: _bump,
            child: SizedBox(
              width: 20,
              child: Text(
                '${widget.quantity}',
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white),
              ),
            ),
          ),
          GestureDetector(
            onTap: widget.onIncrement,
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 6),
              child: Icon(Icons.add, color: Colors.white, size: 15),
            ),
          ),
        ],
      ),
    );
  }
}
