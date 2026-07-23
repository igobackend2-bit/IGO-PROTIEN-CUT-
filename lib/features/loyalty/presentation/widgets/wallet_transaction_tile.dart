import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/wallet_transaction.dart';

class WalletTransactionTile extends StatelessWidget {
  final WalletTransaction transaction;
  const WalletTransactionTile({super.key, required this.transaction});

  IconData get _icon => switch (transaction.type) {
        'cashback' => Icons.savings_outlined,
        'referral_bonus' => Icons.groups_outlined,
        'reward_credit' => Icons.card_giftcard_outlined,
        'debit' => Icons.remove_circle_outline_rounded,
        _ => Icons.account_balance_wallet_outlined,
      };

  @override
  Widget build(BuildContext context) {
    final isCredit = transaction.isCredit;
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
                Text(transaction.description ?? 'Wallet transaction', style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary), maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Text(DateFormat('dd MMM yyyy').format(transaction.createdAt), style: GoogleFonts.outfit(fontSize: 10.5, color: AppColors.textHint, fontWeight: FontWeight.w600)),
                    if (transaction.isPending) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(color: AppColors.warning.withOpacity(0.12), borderRadius: BorderRadius.circular(6)),
                        child: Text('Pending', style: GoogleFonts.outfit(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.warning)),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          Text(
            '${isCredit ? '+' : '-'}₹${transaction.amount.abs().toStringAsFixed(0)}',
            style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: isCredit ? AppColors.success : AppColors.error),
          ),
        ],
      ),
    );
  }
}
