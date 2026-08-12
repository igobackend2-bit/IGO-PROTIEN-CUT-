class NotificationPreferences {
  final bool orderUpdates;
  final bool promotions;
  final bool offers;
  final bool stockAlerts;

  const NotificationPreferences({
    required this.orderUpdates,
    required this.promotions,
    required this.offers,
    required this.stockAlerts,
  });

  factory NotificationPreferences.fromMap(Map<String, dynamic> map) {
    return NotificationPreferences(
      orderUpdates: map['notify_order_updates'] as bool? ?? true,
      promotions: map['notify_promotions'] as bool? ?? true,
      offers: map['notify_offers'] as bool? ?? true,
      stockAlerts: map['notify_stock_alerts'] as bool? ?? true,
    );
  }

  NotificationPreferences copyWith({bool? orderUpdates, bool? promotions, bool? offers, bool? stockAlerts}) {
    return NotificationPreferences(
      orderUpdates: orderUpdates ?? this.orderUpdates,
      promotions: promotions ?? this.promotions,
      offers: offers ?? this.offers,
      stockAlerts: stockAlerts ?? this.stockAlerts,
    );
  }
}
