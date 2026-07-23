import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../utils/app_colors.dart';
import '../providers/order_providers.dart';
import '../widgets/order_card.dart';
import 'order_detail_screen.dart';

/// Replaces the old orders_tab.dart — same "Orders" bottom-nav destination,
/// now split into Current/Past with a richer OrderStatus model backing it.
class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController = TabController(length: 2, vsync: this);

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(ordersListProvider);
    final notifier = ref.read(ordersListProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('My Orders', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [Tab(text: 'Current'), Tab(text: 'Past')],
        ),
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : state.error != null
              ? _errorState(notifier.retry)
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _orderList(state.current, notifier.refresh, emptyText: 'No active orders right now.'),
                    _orderList(state.past, notifier.refresh, emptyText: 'No past orders yet.'),
                  ],
                ),
    );
  }

  Widget _orderList(List orders, Future<void> Function() onRefresh, {required String emptyText}) {
    if (orders.isEmpty) {
      return RefreshIndicator(
        color: AppColors.primary,
        onRefresh: onRefresh,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          children: [
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 32),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: const BoxDecoration(color: AppColors.surfaceLight, shape: BoxShape.circle),
                      child: const Icon(Icons.receipt_long_rounded, size: 56, color: AppColors.primary),
                    ),
                    const SizedBox(height: 16),
                    Text(emptyText, textAlign: TextAlign.center, style: GoogleFonts.outfit(fontSize: 14, color: AppColors.textSecondary)),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: onRefresh,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: orders.length,
        itemBuilder: (context, index) {
          final order = orders[index];
          return OrderCard(
            order: order,
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: order.id))),
          );
        },
      ),
    );
  }

  Widget _errorState(VoidCallback onRetry) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.wifi_off_rounded, size: 48, color: AppColors.error),
          const SizedBox(height: 12),
          Text("Couldn't load your orders.", style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 12),
          TextButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
