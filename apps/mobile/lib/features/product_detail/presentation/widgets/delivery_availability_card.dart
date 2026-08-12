import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../models/product_model.dart';
import '../../../../utils/app_colors.dart';
import '../../data/services/product_detail_content_service.dart';

class DeliveryAvailabilityCard extends StatelessWidget {
  final Product product;
  const DeliveryAvailabilityCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        children: [
          Expanded(
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.08), shape: BoxShape.circle),
                  child: const Icon(Icons.delivery_dining_rounded, color: AppColors.primary, size: 20),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Estimated Delivery', style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 2),
                      Text(
                        ProductDetailContentService.deliveryEtaLabel(),
                        style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(width: 1, height: 36, color: AppColors.divider),
          const SizedBox(width: 16),
          Row(
            children: [
              Icon(
                product.isAvailable ? Icons.check_circle_rounded : Icons.cancel_rounded,
                color: product.isAvailable ? AppColors.success : AppColors.error,
                size: 18,
              ),
              const SizedBox(width: 6),
              Text(
                product.isAvailable ? 'In Stock' : 'Out of Stock',
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: product.isAvailable ? AppColors.success : AppColors.error,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
