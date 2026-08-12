import 'package:flutter/material.dart';

class AppColors {
  // Primary Brand Colors — Vibrant Forest Green (like Swiggy)
  static const Color primary = Color(0xFF1D8348);       // Rich forest green
  static const Color primaryDark = Color(0xFF145A32);   // Deep green
  static const Color primaryLight = Color(0xFF27AE60);  // Bright green

  // Accent Colors
  static const Color accent = Color(0xFF2ECC71);        // Emerald green accent
  static const Color accentDark = Color(0xFF1ABC9C);

  // Light Theme Backgrounds
  static const Color background = Color(0xFFF7F9F6);    // Off-white with green tint
  static const Color surface = Color(0xFFFFFFFF);       // Pure white cards
  static const Color surfaceLight = Color(0xFFEDF7F0);  // Light green-tinted surface

  // Text Colors — Dark Brown / Black
  static const Color textPrimary = Color(0xFF1A120B);   // Very dark brown-black
  static const Color textSecondary = Color(0xFF4A3728); // Medium warm brown
  static const Color textHint = Color(0xFF9E8E82);      // Light brown hint

  // Status Colors
  static const Color success = Color(0xFF1D8348);
  static const Color error = Color(0xFFE74C3C);
  static const Color warning = Color(0xFFF39C12);

  // Input / Border
  static const Color inputBorder = Color(0xFFCDE8D8);   // Soft green border
  static const Color inputFill = Color(0xFFF0FAF4);     // Very light green fill
  static const Color divider = Color(0xFFDDEEE5);       // Subtle green divider

  // Gradient — Green shades
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF27AE60), Color(0xFF1D8348)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient backgroundGradient = LinearGradient(
    colors: [Color(0xFFFFFFFF), Color(0xFFF0FAF4)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient splashGradient = LinearGradient(
    colors: [Color(0xFF145A32), Color(0xFF1D8348)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const LinearGradient heroBannerGradient = LinearGradient(
    colors: [Color(0xFF1D8348), Color(0xFF27AE60)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
