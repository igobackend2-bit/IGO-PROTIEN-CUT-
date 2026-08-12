import 'package:flutter/material.dart';

enum NotificationType {
  orderUpdate,
  deliveryUpdate,
  wishlistStockAlert,
  offer,
  coupon,
  flashSale,
  referralReward,
  generalAnnouncement,
  subscription,
  support;

  static NotificationType fromString(String? value) {
    return switch (value) {
      'order_update' => NotificationType.orderUpdate,
      'delivery_update' => NotificationType.deliveryUpdate,
      'wishlist_stock_alert' => NotificationType.wishlistStockAlert,
      'offer' => NotificationType.offer,
      'coupon' => NotificationType.coupon,
      'flash_sale' => NotificationType.flashSale,
      'referral_reward' => NotificationType.referralReward,
      'subscription' => NotificationType.subscription,
      'support' => NotificationType.support,
      _ => NotificationType.generalAnnouncement,
    };
  }

  String get label => switch (this) {
        NotificationType.orderUpdate => 'Order Update',
        NotificationType.deliveryUpdate => 'Delivery Update',
        NotificationType.wishlistStockAlert => 'Stock Alert',
        NotificationType.offer => 'Offer',
        NotificationType.coupon => 'Coupon',
        NotificationType.flashSale => 'Flash Sale',
        NotificationType.referralReward => 'Referral Reward',
        NotificationType.generalAnnouncement => 'Announcement',
        NotificationType.subscription => 'Subscription',
        NotificationType.support => 'Support',
      };

  IconData get icon => switch (this) {
        NotificationType.orderUpdate => Icons.receipt_long_rounded,
        NotificationType.deliveryUpdate => Icons.delivery_dining_rounded,
        NotificationType.wishlistStockAlert => Icons.favorite_rounded,
        NotificationType.offer => Icons.local_offer_rounded,
        NotificationType.coupon => Icons.confirmation_number_rounded,
        NotificationType.flashSale => Icons.bolt_rounded,
        NotificationType.referralReward => Icons.card_giftcard_rounded,
        NotificationType.generalAnnouncement => Icons.campaign_rounded,
        NotificationType.subscription => Icons.autorenew_rounded,
        NotificationType.support => Icons.support_agent_rounded,
      };

  Color get color => switch (this) {
        NotificationType.orderUpdate => const Color(0xFF1D8348),
        NotificationType.deliveryUpdate => const Color(0xFF2471A3),
        NotificationType.wishlistStockAlert => const Color(0xFFE74C3C),
        NotificationType.offer => const Color(0xFFBA4A00),
        NotificationType.coupon => const Color(0xFF7D3C98),
        NotificationType.flashSale => const Color(0xFFF39C12),
        NotificationType.referralReward => const Color(0xFF117A65),
        NotificationType.generalAnnouncement => const Color(0xFF7F8C8D),
        NotificationType.subscription => const Color(0xFF1D8348),
        NotificationType.support => const Color(0xFF2471A3),
      };
}
