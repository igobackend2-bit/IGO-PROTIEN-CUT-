import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../../../shared/providers/language_providers.dart';
import '../../../../utils/app_colors.dart';

class LanguageScreen extends ConsumerWidget {
  const LanguageScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selected = ref.watch(languageProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Language', style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.white)),
        backgroundColor: AppColors.primary,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(color: AppColors.surfaceLight, borderRadius: BorderRadius.circular(14)),
            child: Text(
              'Only English content is available today — your choice is saved and ready for when other languages are added.',
              style: GoogleFonts.outfit(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
            ),
          ),
          ...AppLanguage.values.map((language) {
            final isSelected = language == selected;
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: isSelected ? AppColors.primary : AppColors.divider, width: isSelected ? 1.5 : 1)),
              child: RadioListTile<AppLanguage>(
                value: language,
                groupValue: selected,
                onChanged: (value) {
                  if (value != null) ref.read(languageProvider.notifier).setLanguage(value);
                },
                title: Text(language.label, style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700)),
                activeColor: AppColors.primary,
              ),
            );
          }),
        ],
      ),
    );
  }
}
