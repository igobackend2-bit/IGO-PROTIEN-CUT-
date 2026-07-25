import '../../../../models/product_model.dart';

/// Generic, category-based editorial content used only when a product
/// doesn't have its own real `ingredients` / `cooking_tips` / `recipe_ideas`
/// columns populated. This is deliberately generic cooking advice — not a
/// claim about a specific product's actual preparation — so it never
/// misrepresents anything about the item itself.
class ProductDetailContentService {
  static List<String> ingredientsFor(Product product) {
    if (product.ingredients != null) return product.ingredients!;
    final category = product.category.toLowerCase();
    if (category.contains('egg')) return ['100% Farm Fresh Eggs'];
    if (category.contains('healthy')) return ['Fresh seasonal produce'];
    return ['100% Fresh ${product.category}', 'No added preservatives'];
  }

  static List<String> cookingTipsFor(Product product) {
    if (product.cookingTips != null) return product.cookingTips!;
    final category = product.category.toLowerCase();

    if (category.contains('chicken')) {
      return [
        'Marinate for at least 30 minutes for best flavor',
        'Cook to an internal temperature of 74°C (165°F)',
        'Let it rest for 5 minutes before slicing',
      ];
    }
    if (category.contains('beef')) {
      return [
        'Bring to room temperature before cooking for even searing',
        'Sear on high heat, then finish on low heat',
        'Rest for 5–10 minutes before cutting to retain juices',
      ];
    }
    if (category.contains('mutton') || category.contains('lamb')) {
      return [
        'Slow-cook for tender, fall-off-the-bone results',
        'Marinate with yogurt and spices for at least 2 hours',
        'Cook to an internal temperature of 63°C (145°F) for medium',
      ];
    }
    if (category.contains('fish')) {
      return [
        'Pat dry before cooking for a crisp exterior',
        'Cook skin-side down first for extra crispiness',
        'Fish is done when it flakes easily with a fork',
      ];
    }
    if (category.contains('egg')) {
      return [
        'Bring to room temperature before boiling to avoid cracks',
        'Store pointed-end down to keep yolks centered',
        'Use within 3–4 weeks of purchase for best freshness',
      ];
    }
    return [
      'Store as instructed and use within a few days of delivery',
      'Wash your hands and surfaces before and after handling',
    ];
  }

  static List<String> recipeIdeasFor(Product product) {
    if (product.recipeIdeas != null) return product.recipeIdeas!;
    final category = product.category.toLowerCase();

    if (category.contains('chicken')) return ['Butter Chicken', 'Grilled Chicken Salad', 'Chicken Stir Fry'];
    if (category.contains('beef')) return ['Classic Beef Steak', 'Beef Stir Fry', 'Beef Stew'];
    if (category.contains('mutton') || category.contains('lamb')) {
      return ['Mutton Curry', 'Lamb Chops', 'Mutton Biryani'];
    }
    if (category.contains('fish')) return ['Pan-Seared Fish', 'Fish Curry', 'Grilled Fish Tacos'];
    if (category.contains('egg')) return ['Classic Omelette', 'Egg Curry', 'Boiled Egg Salad'];
    return ['Fresh Garden Salad', 'Healthy Stir Fry'];
  }

  /// No live logistics backend — a standard quick-commerce style estimate,
  /// clearly presented as an estimate rather than tracked, real-time data.
  static String deliveryEtaLabel() => '30–45 mins';

  /// Picks up to [count] complementary products from *other* categories,
  /// deterministically (same product always pairs the same way across
  /// rebuilds) rather than randomly.
  static List<Product> frequentlyBoughtWith(Product product, List<Product> catalog, {int count = 2}) {
    final others = catalog.where((p) => p.id != product.id && p.category != product.category).toList()
      ..sort((a, b) => a.id.compareTo(b.id));
    if (others.isEmpty) return [];
    final seed = product.id.hashCode.abs();
    final start = seed % others.length;
    final picks = <Product>[];
    for (var i = 0; i < others.length && picks.length < count; i++) {
      picks.add(others[(start + i) % others.length]);
    }
    return picks;
  }
}
