import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../shared/providers/theme_providers.dart';
import '../../../../utils/app_colors.dart';

class ThemeScreen extends ConsumerWidget {
  const ThemeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selected = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Theme', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _tile(context, ref, ThemeMode.light, Icons.light_mode_rounded, 'Light', selected),
          _tile(context, ref, ThemeMode.dark, Icons.dark_mode_rounded, 'Dark', selected),
          _tile(context, ref, ThemeMode.system, Icons.brightness_auto_rounded, 'System Default', selected),
        ],
      ),
    );
  }

  Widget _tile(BuildContext context, WidgetRef ref, ThemeMode mode, IconData icon, String label, ThemeMode selected) {
    final isSelected = mode == selected;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: isSelected ? AppColors.primary : AppColors.divider, width: isSelected ? 1.5 : 1)),
      child: RadioListTile<ThemeMode>(
        value: mode,
        groupValue: selected,
        onChanged: (value) {
          if (value != null) ref.read(themeModeProvider.notifier).setThemeMode(value);
        },
        secondary: Icon(icon, color: AppColors.primary),
        title: Text(label, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700)),
        activeColor: AppColors.primary,
      ),
    );
  }
}
