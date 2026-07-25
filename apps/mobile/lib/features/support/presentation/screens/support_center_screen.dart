import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/ticket_category.dart';
import '../providers/support_providers.dart';
import '../widgets/contact_options.dart';
import 'create_ticket_screen.dart';
import 'faq_screen.dart';
import 'refund_status_screen.dart';
import 'ticket_list_screen.dart';

/// The Support Center hub — FAQs, My Support Tickets, Order Help, Refund
/// Status and Contact Support, all in one place, matching the pattern
/// Amazon/Blinkit/Zepto use for their help centers.
class SupportCenterScreen extends ConsumerWidget {
  const SupportCenterScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ticketState = ref.watch(ticketListProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Support Center', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(20)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('How can we help?', style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.white)),
                const SizedBox(height: 4),
                Text('Browse FAQs, track a ticket, or reach us directly.', style: GoogleFonts.outfit(fontSize: 12, color: Colors.white.withOpacity(0.85))),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const ContactOptionsRow(),
          const SizedBox(height: 20),
          Text('Get Help', style: GoogleFonts.outfit(fontSize: 14.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
          const SizedBox(height: 10),
          _tile(
            context,
            icon: Icons.quiz_outlined,
            title: 'FAQs',
            subtitle: 'Answers to common questions',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const FaqScreen())),
          ),
          const SizedBox(height: 10),
          _tile(
            context,
            icon: Icons.confirmation_number_outlined,
            title: 'My Support Tickets',
            subtitle: ticketState.isLoading ? 'Loading…' : '${ticketState.openCount} open • ${ticketState.tickets.length} total',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TicketListScreen())),
            badge: ticketState.openCount > 0 ? ticketState.openCount : null,
          ),
          const SizedBox(height: 10),
          _tile(
            context,
            icon: Icons.receipt_long_rounded,
            title: 'Order Help',
            subtitle: 'Missing, wrong, damaged or delivery issues',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateTicketScreen())),
          ),
          const SizedBox(height: 10),
          _tile(
            context,
            icon: Icons.assignment_return_outlined,
            title: 'Start a Return',
            subtitle: 'Return an item from a delivered order',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateTicketScreen(initialCategory: TicketCategory.returnRequest))),
          ),
          const SizedBox(height: 10),
          _tile(
            context,
            icon: Icons.currency_exchange_rounded,
            title: 'Refund Status',
            subtitle: 'Track the status of your refunds',
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RefundStatusScreen())),
          ),
        ],
      ),
    );
  }

  Widget _tile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    int? badge,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: const BoxDecoration(color: AppColors.surfaceLight, shape: BoxShape.circle),
              child: Icon(icon, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: GoogleFonts.outfit(fontSize: 13.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: GoogleFonts.outfit(fontSize: 11.5, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            if (badge != null)
              Container(
                margin: const EdgeInsets.only(right: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: AppColors.error, borderRadius: BorderRadius.circular(10)),
                child: Text('$badge', style: GoogleFonts.outfit(fontSize: 10.5, fontWeight: FontWeight.w800, color: Colors.white)),
              ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textHint),
          ],
        ),
      ),
    );
  }
}
