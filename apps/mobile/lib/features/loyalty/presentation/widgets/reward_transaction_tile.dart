import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/reward_transaction.dart';

class RewardTransactionTile extends StatelessWidget {
  final RewardTransaction transaction;
  const RewardTransactionTile({super.key, required this.transaction});

  IconData get _icon => switch (transaction.type) {
        'order' => Icons.shopping_bag_outlined,
        'referral' => Icons.groups_outlined,
        'promotion' => Icons.campaign_outlined,
        _ => Icons.card_giftcard_outlined,
      };

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.divider)),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(12)),
            child: Icon(_icon, color: AppColors.primary, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(transaction.description ?? 'Reward points', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 3),
                Text(
                  DateFormat('dd MMM yyyy').format(transaction.createdAt) + (transaction.isExpired ? ' • Expired' : transaction.isExpiringSoon ? ' • Expiring soon' : ''),
                  style: GoogleFonts.outfit(fontSize: 10.5, color: transaction.isExpired ? AppColors.error : AppColors.textHint, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          Text('+${transaction.points}', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: transaction.isExpired ? AppColors.textHint : AppColors.success)),
        ],
      ),
    );
  }
}
