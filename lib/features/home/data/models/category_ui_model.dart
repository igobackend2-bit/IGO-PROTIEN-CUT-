/// UI-ready representation of a product category shown on the home screen.
class CategoryUiModel {
  final String name;
  final String emoji;
  final int productCount;

  const CategoryUiModel({
    required this.name,
    required this.emoji,
    required this.productCount,
  });

  static String emojiFor(String category) {
    final lower = category.toLowerCase().trim();
    if (lower.contains('chicken')) return '🍗';
    if (lower.contains('beef')) return '🥩';
    if (lower.contains('mutton') || lower.contains('lamb')) return '🍖';
    if (lower.contains('fish') ||
        lower.contains('seafood') ||
        lower.contains('salmon')) {
      return '🐟';
    }
    if (lower.contains('egg')) return '🥚';
    if (lower.contains('healthy') ||
        lower.contains('salad') ||
        lower.contains('add')) {
      return '🥗';
    }
    return '🍽️';
  }
}
