class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final String imageUrl;
  final String category;

  final String weight;
  final double proteinPer100g;
  final double fatPer100g;
  final String storageInstruction;

  // Optional catalog attributes used by advanced filtering (Product
  // Discovery). These columns don't exist in the `products` table yet, so
  // they stay null/default until the backend adds them — nothing fabricates
  // a value here, filters relying on them simply have no data to show.
  final String? brand;
  final bool isAvailable;
  final double? rating;
  final int? ratingCount;

  // Product Detail (Phase 3) content. Same rule as above: real column data
  // if the backend has it, otherwise null — Product Detail supplies its own
  // generic, category-based fallback copy rather than this model inventing
  // per-product claims it can't back up.
  final List<String>? imageUrls;
  final List<String>? ingredients;
  final List<String>? cookingTips;
  final List<String>? recipeIdeas;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrl,
    required this.category,
    required this.weight,
    required this.proteinPer100g,
    required this.fatPer100g,
    required this.storageInstruction,
    this.brand,
    this.isAvailable = true,
    this.rating,
    this.ratingCount,
    this.imageUrls,
    this.ingredients,
    this.cookingTips,
    this.recipeIdeas,
  });

  // 🧠 CATEGORY NORMALIZATION (IMPORTANT FOR FILTERS)
  static String _mapCategory(String dbCategory) {
    final lower = dbCategory.toLowerCase().trim();

    if (lower.contains('chicken')) return 'Chicken';
    if (lower.contains('beef') || lower.contains('steak')) return 'Beef';
    if (lower.contains('mutton') || lower.contains('lamb')) return 'Mutton';
    if (lower.contains('fish') ||
        lower.contains('seafood') ||
        lower.contains('salmon') ||
        lower.contains('prawn') ||
        lower.contains('crab')) return 'Fish';
    if (lower.contains('egg')) return 'Eggs';

    return 'Healthy Add-ons';
  }

  // 🧈 DEFAULT FAT VALUES (fallback if DB missing)
  static double _defaultFat(String category) {
    final lower = category.toLowerCase().trim();

    if (lower.contains('chicken')) return 3.6;
    if (lower.contains('beef') || lower.contains('steak')) return 12.0;
    if (lower.contains('mutton') || lower.contains('lamb')) return 14.0;
    if (lower.contains('fish') ||
        lower.contains('seafood') ||
        lower.contains('salmon') ||
        lower.contains('prawn') ||
        lower.contains('crab')) return 4.5;
    if (lower.contains('egg')) return 9.5;

    return 2.0;
  }

  // 🔥 SAFE SUPABASE MAPPING
  factory Product.fromMap(Map<String, dynamic> map) {
    final rawCategory = (map['category'] ?? '').toString();

    return Product(
      id: (map['id'] ?? '').toString(),
      name: (map['name'] ?? '').toString(),
      description: (map['description'] ?? '').toString(),
      price: (map['price'] as num?)?.toDouble() ?? 0.0,
      imageUrl: (map['image_url'] ?? '').toString(),

      category: _mapCategory(rawCategory),

      weight: (map['weight'] ?? '500g').toString(),

      proteinPer100g:
          (map['protein_per_100g'] as num?)?.toDouble() ?? 22.0,

      fatPer100g:
          (map['fat_per_100g'] as num?)?.toDouble() ??
              _defaultFat(rawCategory),

      storageInstruction:
          (map['storage_instruction'] ?? 'Keep refrigerated (0-4°C)')
              .toString(),

      brand: (map['brand'] as String?)?.trim().isEmpty == true
          ? null
          : map['brand'] as String?,
      isAvailable: (map['is_available'] as bool?) ?? true,
      rating: (map['rating'] as num?)?.toDouble(),
      ratingCount: (map['rating_count'] as num?)?.toInt(),

      imageUrls: _parseStringList(map['image_urls']),
      ingredients: _parseStringList(map['ingredients']),
      cookingTips: _parseStringList(map['cooking_tips']),
      recipeIdeas: _parseStringList(map['recipe_ideas']),
    );
  }

  static List<String>? _parseStringList(dynamic value) {
    if (value is! List) return null;
    final list = value.map((e) => e.toString()).where((s) => s.trim().isNotEmpty).toList();
    return list.isEmpty ? null : list;
  }
}