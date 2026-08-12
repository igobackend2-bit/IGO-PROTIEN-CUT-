import 'package:flutter/material.dart';

class Achievement {
  final String id;
  final String code;
  final String title;
  final String description;
  final String icon;
  final DateTime? unlockedAt;

  const Achievement({
    required this.id,
    required this.code,
    required this.title,
    required this.description,
    required this.icon,
    this.unlockedAt,
  });

  bool get isUnlocked => unlockedAt != null;

  IconData get iconData => switch (icon) {
        'shopping_bag' => Icons.shopping_bag_rounded,
        'local_shipping' => Icons.local_shipping_rounded,
        'military_tech' => Icons.military_tech_rounded,
        'rate_review' => Icons.rate_review_rounded,
        'star' => Icons.star_rounded,
        'groups' => Icons.groups_rounded,
        _ => Icons.emoji_events_rounded,
      };

  factory Achievement.fromMap(Map<String, dynamic> map) {
    return Achievement(
      id: (map['id'] ?? '').toString(),
      code: (map['code'] ?? '').toString(),
      title: (map['title'] ?? '').toString(),
      description: (map['description'] ?? '').toString(),
      icon: (map['icon'] ?? 'star').toString(),
      unlockedAt: DateTime.tryParse(map['unlocked_at']?.toString() ?? '')?.toLocal(),
    );
  }
}
