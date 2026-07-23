import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../../domain/entities/subscription.dart';
import '../providers/subscription_providers.dart';
import '../widgets/subscription_card.dart';
import '../widgets/subscription_states.dart';
import 'subscription_detail_screen.dart';

class SubscriptionDashboardScreen extends ConsumerStatefulWidget {
  const SubscriptionDashboardScreen({super.key});

  @override
  ConsumerState<SubscriptionDashboardScreen> createState() => _SubscriptionDashboardScreenState();
}

class _SubscriptionDashboardScreenState extends ConsumerState<SubscriptionDashboardScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController = TabController(length: 5, vsync: this);

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(subscriptionListProvider);
    final notifier = ref.read(subscriptionListProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('My Subscriptions', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 12.5),
          tabs: const [
            Tab(text: 'Active'),
            Tab(text: 'Upcoming'),
            Tab(text: 'Paused'),
            Tab(text: 'Completed'),
            Tab(text: 'Cancelled'),
          ],
        ),
      ),
      body: state.isLoading
          ? const SubscriptionSkeleton()
          : state.error != null
              ? SubscriptionErrorState(onRetry: notifier.retry)
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _list(state.active, notifier.refresh, 'No active deliveries due right now.'),
                    _list(state.upcoming, notifier.refresh, 'No upcoming subscriptions scheduled.'),
                    _list(state.paused, notifier.refresh, 'No paused subscriptions.'),
                    _list(state.completed, notifier.refresh, 'No completed subscriptions yet.'),
                    _list(state.cancelled, notifier.refresh, 'No cancelled subscriptions.'),
                  ],
                ),
    );
  }

  Widget _list(List<Subscription> subscriptions, Future<void> Function() onRefresh, String emptyMessage) {
    if (subscriptions.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: onRefresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [SubscriptionEmptyState(title: 'Nothing here', message: emptyMessage)],
        ),
      );
    }
    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: onRefresh,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: subscriptions.length,
        itemBuilder: (context, index) {
          final subscription = subscriptions[index];
          return SubscriptionCard(
            subscription: subscription,
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => SubscriptionDetailScreen(subscriptionId: subscription.id))),
          );
        },
      ),
    );
  }
}
