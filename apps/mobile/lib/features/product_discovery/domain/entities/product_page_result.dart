import '../../../../models/product_model.dart';

/// One page of results plus whether the server has more rows beyond it.
/// `serverHasMore` is based on the raw (pre client-side-facet-filter) page
/// size, so pagination keeps advancing correctly even when a page's items
/// get thinned out further by weight/brand/rating filters.
class ProductPageResult {
  final List<Product> items;
  final bool serverHasMore;

  const ProductPageResult({required this.items, required this.serverHasMore});
}
