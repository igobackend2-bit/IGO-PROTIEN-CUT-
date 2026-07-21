import '../../../../models/product_model.dart';
import '../../data/models/home_banner_model.dart';
import '../../data/models/category_ui_model.dart';

/// Aggregate of everything the Home screen needs to render, assembled by
/// [HomeRepository]. Keeping this as one entity lets the presentation layer
/// depend on a single async value instead of juggling N separate futures.
class HomeData {
  final List<HomeBanner> banners;
  final List<OfferCard> offers;
  final List<CategoryUiModel> categories;
  final List<Product> featured;
  final List<Product> bestSellers;
  final List<Product> flashSale;
  final DateTime flashSaleEndsAt;
  final List<Product> todaysDeals;
  final List<Product> recommended;
  final List<Product> recentlyViewed;

  /// productId -> discount percent, used consistently by any section that
  /// renders a strikethrough "was" price for the same product.
  final Map<String, int> discountPercentByProductId;

  const HomeData({
    required this.banners,
    required this.offers,
    required this.categories,
    required this.featured,
    required this.bestSellers,
    required this.flashSale,
    required this.flashSaleEndsAt,
    required this.todaysDeals,
    required this.recommended,
    required this.recentlyViewed,
    required this.discountPercentByProductId,
  });

  bool get isEmpty =>
      featured.isEmpty &&
      bestSellers.isEmpty &&
      flashSale.isEmpty &&
      todaysDeals.isEmpty &&
      recommended.isEmpty;

  int discountFor(String productId) => discountPercentByProductId[productId] ?? 0;

  double strikeThroughPriceFor(Product product) {
    final discount = discountFor(product.id);
    if (discount <= 0) return product.price;
    return product.price / (1 - (discount / 100));
  }
}
