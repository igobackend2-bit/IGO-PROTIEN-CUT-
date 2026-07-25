class ProductCategory {
  final String id;
  final String name;
  final String? emoji;
  final int displayOrder;
  final bool isActive;

  const ProductCategory({
    required this.id,
    required this.name,
    this.emoji,
    required this.displayOrder,
    required this.isActive,
  });

  factory ProductCategory.fromJson(Map<String, dynamic> json) => ProductCategory(
        id: json['id'].toString(),
        name: json['name']?.toString() ?? '',
        emoji: json['emoji']?.toString(),
        displayOrder: (json['display_order'] as num?)?.toInt() ?? 0,
        isActive: json['is_active'] as bool? ?? true,
      );
}
