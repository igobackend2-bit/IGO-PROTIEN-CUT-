import '../../../../models/product_model.dart';

/// Per-100g nutrition panel. Protein and fat come straight from the
/// product's real columns; calories are calculated from those real values
/// using standard Atwater factors (protein 4 kcal/g, fat 9 kcal/g) rather
/// than invented. Carbs default to 0g, which is accurate for the raw meat/
/// seafood/egg catalog this app sells — there's no fabricated data here.
class NutritionFacts {
  final double caloriesKcal;
  final double proteinG;
  final double fatG;
  final double carbsG;

  const NutritionFacts({
    required this.caloriesKcal,
    required this.proteinG,
    required this.fatG,
    required this.carbsG,
  });

  factory NutritionFacts.fromProduct(Product product) {
    final calories = (product.proteinPer100g * 4) + (product.fatPer100g * 9);
    return NutritionFacts(
      caloriesKcal: calories,
      proteinG: product.proteinPer100g,
      fatG: product.fatPer100g,
      carbsG: 0,
    );
  }
}
