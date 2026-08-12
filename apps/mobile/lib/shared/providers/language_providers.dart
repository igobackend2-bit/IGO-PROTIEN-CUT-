import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _languagePrefsKey = 'app_language';

/// The picker and persistence are real; the app's actual copy is English
/// only today (no .arb translation files exist), so this is deliberately
/// "architecture ready" rather than a false claim of full localization.
enum AppLanguage { english, hindi, tamil }

extension AppLanguageLabel on AppLanguage {
  String get label => switch (this) {
        AppLanguage.english => 'English',
        AppLanguage.hindi => 'हिन्दी (Hindi)',
        AppLanguage.tamil => 'தமிழ் (Tamil)',
      };

  String get code => switch (this) {
        AppLanguage.english => 'en',
        AppLanguage.hindi => 'hi',
        AppLanguage.tamil => 'ta',
      };
}

final languageProvider = StateNotifierProvider<LanguageNotifier, AppLanguage>((ref) => LanguageNotifier());

class LanguageNotifier extends StateNotifier<AppLanguage> {
  LanguageNotifier() : super(AppLanguage.english) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString(_languagePrefsKey);
    state = AppLanguage.values.firstWhere((l) => l.code == code, orElse: () => AppLanguage.english);
  }

  Future<void> setLanguage(AppLanguage language) async {
    state = language;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languagePrefsKey, language.code);
  }
}
