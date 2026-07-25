import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../checkout/domain/entities/payment_method_option.dart';

/// Lists the same [PaymentMethodOption]s Checkout already knows about —
/// Cash on Delivery is the only one wired to a real gateway; the rest are
/// modeled and ready, so Add/Edit/Delete here are honest placeholders
/// until a gateway is actually integrated (no new payment logic here).
class PaymentMethodsScreen extends StatelessWidget {
  const PaymentMethodsScreen({super.key});

  void _showComingSoon(BuildContext context, String action) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$action will be available once a payment gateway is connected.', style: GoogleFonts.outfit()), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Payment Methods', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.add_rounded, color: Colors.white), onPressed: () => _showComingSoon(context, 'Adding a payment method')),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: PaymentMethodOption.values.map((method) {
          final isDefault = method == PaymentMethodOption.cashOnDelivery;
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(12)),
                  child: Icon(method.icon, color: AppColors.primary),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(method.label, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 3),
                      Text(
                        method.isAvailable ? (isDefault ? 'Default • Active' : 'Active') : 'Coming soon',
                        style: GoogleFonts.outfit(fontSize: 11.5, color: method.isAvailable ? AppColors.success : AppColors.textHint, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert_rounded, color: AppColors.textHint),
                  onSelected: (value) => _showComingSoon(context, value),
                  itemBuilder: (context) => const [
                    PopupMenuItem(value: 'Edit', child: Text('Edit')),
                    PopupMenuItem(value: 'Remove', child: Text('Remove')),
                  ],
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}
