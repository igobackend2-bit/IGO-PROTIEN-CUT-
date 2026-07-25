import 'package:flutter/material.dart';

/// A single slide in the home hero banner carousel.
class HomeBanner {
  final String id;
  final String title;
  final String subtitle;
  final String ctaLabel;
  final String? imageUrl;
  final List<Color> gradientColors;
  final String? deepLinkCategory;

  const HomeBanner({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.ctaLabel,
    required this.gradientColors,
    this.imageUrl,
    this.deepLinkCategory,
  });
}

/// A small promotional/offer card shown in the horizontal offers row.
class OfferCard {
  final String id;
  final String title;
  final String subtitle;
  final String code;
  final List<Color> gradientColors;
  final IconData icon;

  const OfferCard({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.code,
    required this.gradientColors,
    required this.icon,
  });
}
