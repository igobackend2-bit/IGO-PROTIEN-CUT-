import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../providers/support_providers.dart';
import '../widgets/support_states.dart';
import '../widgets/ticket_card.dart';
import 'create_ticket_screen.dart';
import 'ticket_detail_screen.dart';

class TicketListScreen extends ConsumerWidget {
  const TicketListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(ticketListProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('My Support Tickets', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateTicketScreen())),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded),
        label: Text('New Ticket', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
      ),
      body: Builder(
        builder: (context) {
          if (state.isLoading) return const SupportSkeleton();
          if (state.error != null) return SupportErrorState(onRetry: () => ref.read(ticketListProvider.notifier).retry());
          if (state.tickets.isEmpty) {
            return const SupportEmptyState(
              icon: Icons.confirmation_number_outlined,
              title: 'No support tickets yet',
              message: 'Tap "New Ticket" if you need help with an order, payment or anything else.',
            );
          }
          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () => ref.read(ticketListProvider.notifier).refresh(),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              physics: const AlwaysScrollableScrollPhysics(),
              itemCount: state.tickets.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final ticket = state.tickets[index];
                return TicketCard(
                  ticket: ticket,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => TicketDetailScreen(ticketId: ticket.id))),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
