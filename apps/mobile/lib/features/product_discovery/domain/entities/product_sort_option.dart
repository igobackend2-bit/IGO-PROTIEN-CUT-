enum ProductSortOption {
  relevance('Relevance', 'name', true),
  priceLowToHigh('Price: Low to High', 'price', true),
  priceHighToLow('Price: High to Low', 'price', false),
  proteinHighToLow('Protein: High to Low', 'protein_per_100g', false),
  nameAZ('Name: A to Z', 'name', true);

  final String label;
  final String column;
  final bool ascending;

  const ProductSortOption(this.label, this.column, this.ascending);
}
