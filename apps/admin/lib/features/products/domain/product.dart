/// Mirrors `PRODUCT_FIELDS` in supabase/functions/admin-products/index.ts —
/// every field the admin-products `create`/`update` actions accept.
class Product {
  final String id;
  final String name;
  final String? description;
  final num price;
  final String? imageUrl;
  final String? category;
  final String? weight;
  final num? proteinPer100g;
  final num? fatPer100g;
  final String? storageInstruction;
  final String? brand;
  final bool isAvailable;
  final List<String> imageUrls;
  final String? ingredients;
  final String? cookingTips;
  final String? recipeIdeas;
  final int stockQuantity;
  final int lowStockThreshold;

  const Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.imageUrl,
    this.category,
    this.weight,
    this.proteinPer100g,
    this.fatPer100g,
    this.storageInstruction,
    this.brand,
    required this.isAvailable,
    this.imageUrls = const [],
    this.ingredients,
    this.cookingTips,
    this.recipeIdeas,
    required this.stockQuantity,
    required this.lowStockThreshold,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'].toString(),
        name: json['name']?.toString() ?? '',
        description: json['description']?.toString(),
        price: json['price'] as num? ?? 0,
        imageUrl: json['image_url']?.toString(),
        category: json['category']?.toString(),
        weight: json['weight']?.toString(),
        proteinPer100g: json['protein_per_100g'] as num?,
        fatPer100g: json['fat_per_100g'] as num?,
        storageInstruction: json['storage_instruction']?.toString(),
        brand: json['brand']?.toString(),
        isAvailable: json['is_available'] as bool? ?? false,
        imageUrls: ((json['image_urls'] as List?) ?? const []).map((e) => e.toString()).toList(),
        ingredients: json['ingredients']?.toString(),
        cookingTips: json['cooking_tips']?.toString(),
        recipeIdeas: json['recipe_ideas']?.toString(),
        stockQuantity: (json['stock_quantity'] as num?)?.toInt() ?? 0,
        lowStockThreshold: (json['low_stock_threshold'] as num?)?.toInt() ?? 10,
      );

  Map<String, dynamic> toPayload() => {
        'name': name,
        'description': description,
        'price': price,
        'image_url': imageUrl,
        'category': category,
        'weight': weight,
        'protein_per_100g': proteinPer100g,
        'fat_per_100g': fatPer100g,
        'storage_instruction': storageInstruction,
        'brand': brand,
        'is_available': isAvailable,
        'image_urls': imageUrls,
        'ingredients': ingredients,
        'cooking_tips': cookingTips,
        'recipe_ideas': recipeIdeas,
        'stock_quantity': stockQuantity,
        'low_stock_threshold': lowStockThreshold,
      };
}
