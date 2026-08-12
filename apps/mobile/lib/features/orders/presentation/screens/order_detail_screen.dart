import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

import '../../../../models/order_status.dart';
import '../../../../services/cart_service.dart';
import '../../../../utils/app_colors.dart';
import '../../../../utils/id_format.dart';
import '../../domain/entities/order_summary.dart';
import '../providers/order_providers.dart';
import '../widgets/cancel_order_dialog.dart';
import '../widgets/delivery_otp_card.dart';
import '../widgets/delivery_partner_card.dart';
import '../widgets/order_status_badge.dart';
import '../widgets/order_timeline.dart';
import '../widgets/rating_dialog.dart';
import '../widgets/support_bottom_sheet.dart';
import 'invoice_screen.dart';
import 'order_tracking_screen.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  Future<void> _handleCancel(BuildContext context, WidgetRef ref) async {
    final reason = await showCancelOrderDialog(context);
    if (reason == null) return;
    final success = await ref.read(ordersListProvider.notifier).cancelOrder(orderId, reason: reason);
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success ? 'Order cancelled.' : 'Could not cancel this order.', style: GoogleFonts.outfit()),
        backgroundColor: success ? AppColors.success : AppColors.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _handleReorder(BuildContext context, OrderSummary order) async {
    try {
      for (final item in order.items) {
        for (var i = 0; i < item.quantity; i++) {
          await CartService().addToCart(item.productId);
        }
      }
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Items added to your cart.', style: GoogleFonts.outfit()),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          action: SnackBarAction(label: 'View Cart', onPressed: () => Navigator.pushNamed(context, '/cart')),
        ),
      );
    } catch (_) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not add items to cart.', style: GoogleFonts.outfit()), backgroundColor: AppColors.error, behavior: SnackBarBehavior.floating),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderAsync = ref.watch(orderStreamProvider(orderId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Order #${shortId(orderId)}', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.support_agent_rounded, color: Colors.white), onPressed: () => showSupportBottomSheet(context, orderId: orderId)),
        ],
      ),
      body: orderAsync.when(
        data: (order) {
          if (order == null) return Center(child: Text('Order not found.', style: GoogleFonts.outfit()));
          return _buildBody(context, ref, order);
        },
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (_, __) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off_rounded, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text("Couldn't load this order.", style: GoogleFonts.outfit(fontSize: 13, color: AppColors.textSecondary)),
              const SizedBox(height: 12),
              TextButton(onPressed: () => ref.invalidate(orderStreamProvider(orderId)), child: const Text('Retry')),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, OrderSummary order) {
    final ratingAsync = ref.watch(orderRatingProvider(orderId));

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Placed On', style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textHint, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(DateFormat('dd MMM yyyy, hh:mm a').format(order.createdAt), style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700)),
                ],
              ),
              OrderStatusBadge(status: order.status),
            ],
          ),
        ),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => OrderTrackingScreen(orderId: orderId))),
          child: OrderTimeline(status: order.status),
        ),
        if (order.status == OrderStatus.outForDelivery && order.deliveryOtp != null) ...[
          const SizedBox(height: 16),
          DeliveryOtpCard(otp: order.deliveryOtp!),
        ],
        if (order.deliveryPartner != null) ...[
          const SizedBox(height: 16),
          DeliveryPartnerCard(partner: order.deliveryPartner!),
        ],
        const SizedBox(height: 16),
        _sectionTitle('Items Ordered'),
        const SizedBox(height: 10),
        _itemsCard(order),
        if (order.address != null) ...[
          const SizedBox(height: 20),
          _sectionTitle('Delivery Information'),
          const SizedBox(height: 10),
          _deliveryInfoCard(order),
        ],
        const SizedBox(height: 20),
        _sectionTitle('Bill Summary'),
        const SizedBox(height: 10),
        _billCard(order),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => InvoiceScreen(order: order))),
                icon: const Icon(Icons.receipt_outlined, size: 18),
                label: Text('Invoice', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
                style: OutlinedButton.styleFrom(foregroundColor: AppColors.primary, side: const BorderSide(color: AppColors.primary), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => _handleReorder(context, order),
                icon: const Icon(Icons.replay_rounded, size: 18),
                label: Text('Reorder', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              ),
            ),
          ],
        ),
        if (order.status == OrderStatus.delivered) ...[
          const SizedBox(height: 12),
          ratingAsync.when(
            data: (rating) => SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                onPressed: rating != null ? null : () => showRatingDialog(context, ref, orderId),
                icon: Icon(rating != null ? Icons.check_circle_outline_rounded : Icons.star_outline_rounded, size: 18),
                label: Text(rating != null ? 'You rated this order ${rating['rating']}★' : 'Rate This Order', style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
                style: OutlinedButton.styleFrom(foregroundColor: AppColors.textSecondary, side: const BorderSide(color: AppColors.inputBorder), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              ),
            ),
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
        if (order.status.isCancellable) ...[
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: TextButton(
              onPressed: () => _handleCancel(context, ref),
              child: Text('Cancel Order', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: AppColors.error)),
            ),
          ),
        ],
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _sectionTitle(String text) => Text(text, style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary));

  Widget _itemsCard(OrderSummary order) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: order.items.length,
        separatorBuilder: (context, index) => const Divider(color: AppColors.divider, height: 1),
        itemBuilder: (context, index) {
          final item = order.items[index];
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.productName, style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text('Qty: ${item.quantity}', style: GoogleFonts.outfit(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                Text('₹${item.subtotal.toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _deliveryInfoCard(OrderSummary order) {
    final address = order.address!;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(address.fullName, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text(address.formattedAddress, style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textSecondary, height: 1.4)),
                  ],
                ),
              ),
            ],
          ),
          if (order.deliverySlot != null) ...[
            const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(color: AppColors.divider, height: 1)),
            Row(
              children: [
                const Icon(Icons.schedule_rounded, color: AppColors.primary, size: 20),
                const SizedBox(width: 12),
                Text(order.deliverySlot!, style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _billCard(OrderSummary order) {
    final deliveryFee = order.deliveryFee ?? 30.0;
    final tax = order.taxAmount ?? 15.0;
    final discount = order.discountAmount ?? 0.0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.divider)),
      child: Column(
        children: [
          _billRow('Item Subtotal', '₹${order.totalPrice.toStringAsFixed(0)}'),
          const SizedBox(height: 10),
          _billRow('Delivery Partner Fee', deliveryFee == 0 ? 'FREE' : '₹${deliveryFee.toStringAsFixed(0)}'),
          const SizedBox(height: 10),
          _billRow('GST & Packing Charges', '₹${tax.toStringAsFixed(0)}'),
          if (discount > 0) ...[
            const SizedBox(height: 10),
            _billRow('Discount${order.couponCode != null ? ' (${order.couponCode})' : ''}', '-₹${discount.toStringAsFixed(0)}'),
          ],
          const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(color: AppColors.divider, height: 1)),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Grand Total', style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w800)),
              Text('₹${(order.totalPrice + deliveryFee + tax - discount).toStringAsFixed(0)}', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primary)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _billRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textSecondary)),
        Text(value, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
