import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../models/order_status.dart';
import '../../../../utils/app_colors.dart';
import '../../../../utils/id_format.dart';
import '../../domain/entities/order_summary.dart';
import 'order_status_badge.dart';

class OrderCard extends StatelessWidget {
  final OrderSummary order;
  final VoidCallback onTap;

  const OrderCard({super.key, required this.order, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.divider),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Order ID: #${shortId(order.id)}', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      const SizedBox(height: 2),
                      Text(
                        DateFormat('dd MMM yyyy, hh:mm a').format(order.createdAt),
                        style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  OrderStatusBadge(status: order.status),
                ],
              ),
            ),
            const Divider(color: AppColors.divider, height: 1),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(10)),
                    child: Icon(
                      order.status == OrderStatus.delivered ? Icons.local_mall_rounded : Icons.delivery_dining_rounded,
                      color: AppColors.primary,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          order.itemsSummary.isEmpty ? 'No item details' : order.itemsSummary,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500, height: 1.3),
                        ),
                        const SizedBox(height: 4),
                        Text('₹${order.totalPrice.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward_ios_rounded, color: AppColors.textHint, size: 14),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
