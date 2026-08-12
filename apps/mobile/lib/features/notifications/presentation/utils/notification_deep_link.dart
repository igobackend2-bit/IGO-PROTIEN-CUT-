import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/providers/catalog_providers.dart';
import '../../../../models/notification_type.dart';
import '../../../orders/presentation/screens/order_detail_screen.dart';
import '../../../profile/presentation/screens/coupons_screen.dart';
import '../../../profile/presentation/screens/referral_screen.dart';
import '../../../subscriptions/presentation/screens/subscription_detail_screen.dart';
import '../../../support/presentation/screens/ticket_detail_screen.dart';
import '../../domain/entities/app_notification.dart';

/// Routes a tapped notification to the right screen. Order/Delivery jump
/// straight to Order Detail with just the id already in `data`; Wishlist
/// Stock Alert needs the full Product object first (Product Detail's route
/// contract expects one), so it's looked up from the already-cached
/// catalog snapshot rather than adding a new product-by-id query.
Future<void> handleNotificationTap(BuildContext context, WidgetRef ref, AppNotification notification) async {
  switch (notification.type) {
    case NotificationType.orderUpdate:
    case NotificationType.deliveryUpdate:
      final orderId = notification.data['order_id']?.toString();
      if (orderId == null) return;
      Navigator.push(context, MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: orderId)));
      return;

    case NotificationType.wishlistStockAlert:
      final productId = notification.data['product_id']?.toString();
      if (productId == null) return;
      final catalog = await ref.read(catalogSnapshotProvider.future);
      final product = catalog.where((p) => p.id == productId).firstOrNull;
      if (product == null || !context.mounted) return;
      Navigator.pushNamed(context, '/product-detail', arguments: product);
      return;

    case NotificationType.coupon:
      Navigator.push(context, MaterialPageRoute(builder: (_) => const CouponsScreen()));
      return;

    case NotificationType.offer:
    case NotificationType.flashSale:
      Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false, arguments: 0);
      return;

    case NotificationType.referralReward:
      Navigator.push(context, MaterialPageRoute(builder: (_) => const ReferralScreen()));
      return;

    case NotificationType.generalAnnouncement:
      // No specific destination — the card itself already shows the full
      // message, so tapping just marks it read (handled by the caller).
      return;

    case NotificationType.subscription:
      final subscriptionId = notification.data['subscription_id']?.toString();
      if (subscriptionId == null) return;
      Navigator.push(context, MaterialPageRoute(builder: (_) => SubscriptionDetailScreen(subscriptionId: subscriptionId)));
      return;

    case NotificationType.support:
      final ticketId = notification.data['ticket_id']?.toString();
      if (ticketId == null) return;
      Navigator.push(context, MaterialPageRoute(builder: (_) => TicketDetailScreen(ticketId: ticketId)));
      return;
  }
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
