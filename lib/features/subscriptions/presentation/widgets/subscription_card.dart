import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/subscription.dart';

class SubscriptionCard extends StatelessWidget {
  final Subscription subscription;
  final VoidCallback onTap;

  const SubscriptionCard({super.key, required this.subscription, required this.onTap});

  Color get _statusColor => switch (subscription.status) {
        SubscriptionStatus.active => AppColors.success,
        SubscriptionStatus.paused => AppColors.warning,
        SubscriptionStatus.completed => AppColors.textHint,
        SubscriptionStatus.cancelled => AppColors.error,
      };

  @override
  Widget build(BuildContext context) {
    final product = subscription.product;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: product.imageUrl.startsWith('http')
                  ? CachedNetworkImage(imageUrl: product.imageUrl, width: 60, height: 60, fit: BoxFit.cover)
                  : Container(width: 60, height: 60, color: AppColors.surfaceLight, child: const Icon(Icons.shopping_bag_outlined, color: AppColors.primary)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(child: Text(product.name, style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: _statusColor.withOpacity(0.12), borderRadius: BorderRadius.circular(20)),
                        child: Text(subscription.status.label, style: GoogleFonts.outfit(fontSize: 9.5, fontWeight: FontWeight.w700, color: _statusColor)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('Qty ${subscription.quantity} • ${subscription.scheduleDescription}', style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary)),
                  const SizedBox(height: 6),
                  if (subscription.status == SubscriptionStatus.active)
                    Row(
                      children: [
                        const Icon(Icons.event_rounded, size: 13, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text('Next: ${DateFormat('dd MMM yyyy').format(subscription.nextDelivery)}', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary)),
                      ],
                    ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textHint),
          ],
        ),
      ),
    );
  }
}
