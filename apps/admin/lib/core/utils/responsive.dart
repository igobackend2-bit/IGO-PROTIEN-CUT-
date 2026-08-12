import 'package:flutter/material.dart';

enum ScreenSize { compact, tablet, desktop }

/// Breakpoints for the admin shell: <700 collapses the sidebar into a
/// drawer (small tablets/mobile fallback), 700–1100 shows an icon-only
/// NavigationRail (tablet), >1100 shows the full labeled sidebar (desktop).
/// Primary targets per spec are desktop + tablet; compact is a graceful
/// fallback, not a primary design target.
class Responsive {
  Responsive._();

  static const compactMax = 700.0;
  static const tabletMax = 1100.0;

  static ScreenSize sizeOf(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    if (width < compactMax) return ScreenSize.compact;
    if (width < tabletMax) return ScreenSize.tablet;
    return ScreenSize.desktop;
  }

  static bool isCompact(BuildContext context) => sizeOf(context) == ScreenSize.compact;

  static bool isDesktop(BuildContext context) => sizeOf(context) == ScreenSize.desktop;

  /// Number of stat-card columns in a responsive grid.
  static int statColumns(BuildContext context) {
    switch (sizeOf(context)) {
      case ScreenSize.compact:
        return 1;
      case ScreenSize.tablet:
        return 2;
      case ScreenSize.desktop:
        return 4;
    }
  }
}
