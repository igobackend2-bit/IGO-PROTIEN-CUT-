import 'package:flutter/material.dart';

/// Wraps [child] in a [Hero] only when [enabled] — lets call sites that
/// might render the same product more than once at a time (Home's
/// overlapping sections) opt out and avoid Flutter's "multiple heroes
/// share the same tag" crash, while single-appearance contexts (Product
/// Discovery, Cart recommendations, Product Detail) keep the transition.
class MaybeHero extends StatelessWidget {
  final bool enabled;
  final String tag;
  final Widget child;

  const MaybeHero({super.key, required this.enabled, required this.tag, required this.child});

  @override
  Widget build(BuildContext context) {
    if (!enabled) return child;
    return Hero(tag: tag, child: child);
  }
}
