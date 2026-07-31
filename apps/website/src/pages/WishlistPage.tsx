import React, { useEffect, useState } from 'react';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { Product, ProductWeightOption } from '../types';
import { ProductCard } from '../components/ProductCard';
import { StoreService } from '../lib/storage';

interface WishlistPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
  onNavigate: (path: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onNavigate
}) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => StoreService.getWishlist());

  useEffect(() => {
    const sync = () => setWishlistIds(StoreService.getWishlist());
    window.addEventListener('protein_cuts_wishlist_updated', sync);
    // Also catch changes made from a different open tab (native `storage`
    // event) — same cross-tab desync fix as the header badge count.
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('protein_cuts_wishlist_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleAddAllToCart = () => {
    wishlistProducts.forEach((p) => {
      if (p.stockStatus !== 'Out of Stock') {
        onAddToCart(p, p.weightOptions[0], 1);
      }
    });
    onNavigate('/cart');
  };

  const handleClearAll = () => {
    wishlistIds.forEach((id) => StoreService.toggleWishlist(id));
    setWishlistIds([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
            <Heart className="w-4 h-4 fill-emerald-500 text-emerald-500" /> Your Saved Cuts
          </div>
          <h1 className="text-3xl font-black text-[#08120B] tracking-tight mt-1">My Wishlist</h1>
          <p className="text-xs text-neutral-500 mt-1">
            {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>

        {wishlistProducts.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-500 hover:text-[#08120B] hover:border-neutral-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
            <button
              onClick={handleAddAllToCart}
              className="px-4 py-2.5 rounded-xl bg-[#0F7B3A] hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Add All to Cart
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistProducts.map((p) => (
            <ProductCard key={p.id} product={p} onSelectProduct={onSelectProduct} onAddToCart={onAddToCart} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-500">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[#08120B]">Your wishlist is empty</h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Tap the heart icon on any product to save it here for later — perfect for planning next week's order.
          </p>
          <button
            onClick={() => onNavigate('/search')}
            className="inline-flex items-center gap-1.5 bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Browse Products <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
