export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'protein_cuts_theme_mode';

export class ThemeService {
  static getTheme(): ThemeMode {
    try {
      const saved = localStorage.getItem(THEME_KEY) as ThemeMode;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'light'; // Default to warm off-white light theme
  }

  static setTheme(mode: ThemeMode): void {
    localStorage.setItem(THEME_KEY, mode);
    this.applyTheme(mode);
    window.dispatchEvent(new Event('protein_cuts_theme_changed'));
  }

  static applyTheme(mode: ThemeMode): void {
    const root = document.documentElement;
    let isDark = false;
    if (mode === 'dark') {
      isDark = true;
    } else if (mode === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = false;
    }

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
