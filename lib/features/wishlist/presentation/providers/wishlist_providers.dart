import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../services/cart_service.dart';
import '../../../cart/presentation/providers/cart_providers.dart';
import '../../data/repositories/wishlist_repository_impl.dart';
import '../../domain/entities/wishlist_item.dart';
import '../../domain/repositories/wishlist_repository.dart';

final wishlistRepositoryProvider = Provider<WishlistRepository>((ref) => WishlistRepositoryImpl());

/// Per-product wishlist toggle — the single source of truth for every heart
/// icon in the app (Product Card, Product Detail, Wishlist screen itself),
/// so they all stay in sync automatically since they share this one family
/// provider keyed by productId.
final wishlistProvider =
    StateNotifierProvider.autoDispose.family<WishlistController, AsyncValue<bool>, String>(
  (ref, productId) => WishlistController(ref, ref.read(wishlistRepositoryProvider), productId),
);

class WishlistController extends StateNotifier<AsyncValue<bool>> {
  final Ref _ref;
  final WishlistRepository _repository;
  final String _productId;

  WishlistController(this._ref, this._repository, this._productId) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    state = await AsyncValue.guard(() => _repository.isWishlisted(_productId));
  }

  Future<void> toggle() async {
    final current = state.value ?? false;
    state = AsyncValue.data(!current); // optimistic
    try {
      await _repository.toggle(_productId);
      _ref.invalidate(wishlistListProvider);
    } catch (e) {
      state = AsyncValue.data(current); // rollback
      rethrow;
    }
  }
}

// ─── Full wishlist list ───────────────────────────────────────────────────

class WishlistListState {
  final List<WishlistItem> items;
  final bool isLoading;
  final Object? error;

  const WishlistListState({this.items = const [], this.isLoading = true, this.error});

  WishlistListState copyWith({List<WishlistItem>? items, bool? isLoading, Object? error, bool clearError = false}) {
    return WishlistListState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

final wishlistListProvider = StateNotifierProvider.autoDispose<WishlistListNotifier, WishlistListState>((ref) {
  return WishlistListNotifier(ref.read(wishlistRepositoryProvider), ref);
});

class WishlistListNotifier extends StateNotifier<WishlistListState> {
  final WishlistRepository _repository;
  final Ref _ref;

  WishlistListNotifier(this._repository, this._ref) : super(const WishlistListState()) {
    load();
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final items = await _repository.fetchWishlistItems();
      state = state.copyWith(items: items, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e);
    }
  }

  Future<void> refresh() => load();
  Future<void> retry() => load();

  Future<bool> removeItem(WishlistItem item) async {
    final previous = state.items;
    state = state.copyWith(items: previous.where((i) => i.id != item.id).toList());
    try {
      await _repository.removeItem(item.id);
      _ref.invalidate(wishlistProvider(item.product.id));
      return true;
    } catch (_) {
      state = state.copyWith(items: previous); // rollback
      return false;
    }
  }

  /// Moves one item to Cart and drops it from the wishlist. Returns false
  /// (no-op) for out-of-stock items — callers should already be disabling
  /// the action in that case.
  Future<bool> moveToCart(WishlistItem item) async {
    if (!item.product.isAvailable) return false;
    final previous = state.items;
    state = state.copyWith(items: previous.where((i) => i.id != item.id).toList());
    try {
      await CartService().addToCart(item.product.id);
      await _repository.removeItem(item.id);
      _ref.invalidate(wishlistProvider(item.product.id));
      _ref.invalidate(cartProvider);
      return true;
    } catch (_) {
      state = state.copyWith(items: previous); // rollback
      return false;
    }
  }

  /// Moves every currently-available item to Cart, leaving out-of-stock
  /// items behind in the wishlist. Returns how many items were moved.
  Future<int> moveAllToCart() async {
    final available = state.items.where((i) => i.product.isAvailable).toList();
    if (available.isEmpty) return 0;

    final previous = state.items;
    state = state.copyWith(items: previous.where((i) => !i.product.isAvailable).toList());
    try {
      for (final item in available) {
        await CartService().addToCart(item.product.id);
      }
      await _repository.removeItems(available.map((i) => i.id).toList());
      for (final item in available) {
        _ref.invalidate(wishlistProvider(item.product.id));
      }
      _ref.invalidate(cartProvider);
      return available.length;
    } catch (_) {
      state = state.copyWith(items: previous); // rollback
      return 0;
    }
  }
}

// ─── Search / sort ──────────────────────────────────────────────────────

enum WishlistSortOption { newest, priceLowToHigh, name }

extension WishlistSortOptionLabel on WishlistSortOption {
  String get label => switch (this) {
        WishlistSortOption.newest => 'Newest',
        WishlistSortOption.priceLowToHigh => 'Price',
        WishlistSortOption.name => 'Name',
      };
}

final wishlistSearchQueryProvider = StateProvider.autoDispose<String>((ref) => '');
final wishlistSortProvider = StateProvider.autoDispose<WishlistSortOption>((ref) => WishlistSortOption.newest);

/// Search + sort applied on top of the raw list — kept as a derived
/// provider so the screen stays a thin view over already-computed state.
final filteredWishlistProvider = Provider.autoDispose<List<WishlistItem>>((ref) {
  final items = ref.watch(wishlistListProvider).items;
  final query = ref.watch(wishlistSearchQueryProvider).trim().toLowerCase();
  final sort = ref.watch(wishlistSortProvider);

  final filtered = query.isEmpty
      ? List<WishlistItem>.from(items)
      : items.where((i) => i.product.name.toLowerCase().contains(query)).toList();

  switch (sort) {
    case WishlistSortOption.newest:
      filtered.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      break;
    case WishlistSortOption.priceLowToHigh:
      filtered.sort((a, b) => a.product.price.compareTo(b.product.price));
      break;
    case WishlistSortOption.name:
      filtered.sort((a, b) => a.product.name.toLowerCase().compareTo(b.product.name.toLowerCase()));
      break;
  }
  return filtered;
});

/// Latest 10 wishlisted items — the underlying list is already fetched
/// newest-first, so this is just a cheap slice, not a second query.
final recentlyWishlistedProvider = Provider.autoDispose<List<WishlistItem>>((ref) {
  return ref.watch(wishlistListProvider).items.take(10).toList();
});

// ─── Stock alerts ("Notify Me") ────────────────────────────────────────

final stockAlertProvider =
    StateNotifierProvider.autoDispose.family<StockAlertController, AsyncValue<bool>, String>(
  (ref, productId) => StockAlertController(ref.read(wishlistRepositoryProvider), productId),
);

class StockAlertController extends StateNotifier<AsyncValue<bool>> {
  final WishlistRepository _repository;
  final String _productId;

  StockAlertController(this._repository, this._productId) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    state = await AsyncValue.guard(() => _repository.hasStockAlert(_productId));
  }

  Future<void> toggle() async {
    final current = state.value ?? false;
    state = AsyncValue.data(!current); // optimistic
    try {
      if (current) {
        await _repository.removeStockAlert(_productId);
      } else {
        await _repository.requestStockAlert(_productId);
      }
    } catch (e) {
      state = AsyncValue.data(current); // rollback
      rethrow;
    }
  }
}
