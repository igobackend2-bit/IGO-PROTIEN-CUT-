import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../../loyalty/presentation/providers/loyalty_providers.dart';
import '../../../loyalty/presentation/widgets/loyalty_states.dart';
import '../../../loyalty/presentation/widgets/wallet_transaction_tile.dart';

/// Extended in Phase 13 — balance, cashback and full transaction history
/// now come from the real wallet_transactions ledger via loyaltyProvider,
/// replacing the Phase 10 architecture-only placeholder in place.
class WalletScreen extends ConsumerWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(loyaltyProvider);
    final notifier = ref.read(loyaltyProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Wallet', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: state.isLoading
          ? const LoyaltySkeleton()
          : state.error != null
              ? LoyaltyErrorState(onRetry: notifier.retry)
              : RefreshIndicator(color: AppColors.primary, onRefresh: notifier.refresh, child: _buildBody(state)),
    );
  }

  Widget _buildBody(LoyaltyState state) {
    final summary = state.summary;
    final walletTxns = state.walletTransactions.where((w) => w.type != 'cashback').toList();
    final cashbackTxns = state.walletTransactions.where((w) => w.type == 'cashback').toList();

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(20)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Wallet Balance', style: GoogleFonts.outfit(fontSize: 12.5, color: Colors.white.withOpacity(0.85), fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Text('₹${summary.walletBalance.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.w800, color: Colors.white)),
              const SizedBox(height: 14),
              Row(
                children: [
                  _miniStat('Cashback Credited', '₹${summary.cashbackCredited.toStringAsFixed(0)}'),
                  const SizedBox(width: 20),
                  _miniStat('Cashback Pending', '₹${summary.cashbackPending.toStringAsFixed(0)}'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        _sectionTitle('Wallet Transactions'),
        const SizedBox(height: 10),
        if (walletTxns.isEmpty)
          _emptyCard(icon: Icons.receipt_long_outlined, text: 'No wallet transactions yet.')
        else
          ...walletTxns.map((t) => WalletTransactionTile(transaction: t)),
        const SizedBox(height: 24),
        _sectionTitle('Cashback History'),
        const SizedBox(height: 10),
        if (cashbackTxns.isEmpty)
          _emptyCard(icon: Icons.savings_outlined, text: 'No cashback earned yet.')
        else
          ...cashbackTxns.map((t) => WalletTransactionTile(transaction: t)),
      ],
    );
  }

  Widget _miniStat(String label, String value) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white)),
          Text(label, style: GoogleFonts.outfit(fontSize: 10, color: Colors.white.withOpacity(0.8))),
        ],
      ),
    );
  }

  Widget _sectionTitle(String text) => Text(text, style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary));

  Widget _emptyCard({required IconData icon, required String text}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 28),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Column(
        children: [
          Icon(icon, size: 36, color: AppColors.textHint),
          const SizedBox(height: 10),
          Text(text, style: GoogleFonts.outfit(fontSize: 12.5, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}
