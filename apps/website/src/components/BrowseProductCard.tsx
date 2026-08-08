import React, { useState, useEffect } from 'react';
import { Heart, Check, Minus, Plus } from 'lucide-react';
import { Product, ProductWeightOption } from '../types';
import { StoreService } from '../lib/storage';
import { FadeImage } from './FadeImage';

interface BrowseProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
}

/**
 * A simpler, catalog-style card used only on the category/search browse
 * grid — image, wishlist heart, sold-out badge, category tag + rating,
 * name, weight, price and a single "Add to Basket" action. The richer
 * ProductCard (weight picker, coupon call-out, nutrition strip, Buy Now)
 * stays exactly as-is everywhere else on the site; this is a separate
 * component so nothing outside this one page changes.
 */
export const BrowseProductCard: React.FC<BrowseProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart
}) => {
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(() => StoreService.getWishlist().includes(product.id));
  // Previously Add just flashed to "Added" for ~1.2s and reverted to a plain
  // Add button, with nothing on the card ever showing how many of this item
  // were actually sitting in the cart. Now the card reads the real cart
  // quantity and swaps to a +/- stepper once it's above zero.
  const [cartQty, setCartQty] = useState(() => StoreService.getCartQuantity(product.id));

  // Keeps this card's heart icon in sync if the same product's wishlist
  // state is toggled from a different card/page showing it at the same time.
  useEffect(() => {
    const sync = () => setIsWishlisted(StoreService.getWishlist().includes(product.id));
    window.addEventListener('protein_cuts_wishlist_updated', sync);
    return () => window.removeEventListener('protein_cuts_wishlist_updated', sync);
  }, [product.id]);

  useEffect(() => {
    const sync = () => setCartQty(StoreService.getCartQuantity(product.id));
    sync();
    window.addEventListener('protein_cuts_cart_updated', sync);
    return () => window.removeEventListener('protein_cuts_cart_updated', sync);
  }, [product.id]);

  const defaultWeight = product.weightOptions[0];
  const isOutOfStock = product.stockStatus === 'Out of Stock';

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    StoreService.toggleWishlist(product.id);
    setIsWishlisted(!isWishlisted);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product, defaultWeight, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleStepperChange = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    StoreService.adjustCartQuantity(product.id, defaultWeight.label, delta);
  };

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square bg-neutral-100 overflow-hidden">
        <FadeImage
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition duration-500 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
        />

        <button
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-md text-neutral-500 hover:text-emerald-600 transition z-10 shadow-sm"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-emerald-500 text-emerald-500' : ''}`} />
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white text-[#0A1F12] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow -rotate-6 border border-neutral-200">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{product.subcategory}</span>
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#0A1F12]">
            ★ {product.rating}
          </span>
        </div>

        <h3 className="text-sm font-bold text-[#0A1F12] line-clamp-1">{product.name}</h3>
        <p className="text-xs text-neutral-500">{defaultWeight?.label}</p>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-emerald-700">₹{defaultWeight?.price}</span>
              {defaultWeight && defaultWeight.originalPrice > defaultWeight.price && (
                <span className="text-[11px] text-neutral-400 line-through">₹{defaultWeight.originalPrice}</span>
              )}
            </div>
          </div>
        </div>

        {!isOutOfStock && cartQty > 0 ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full mt-1 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={(e) => handleStepperChange(e, -1)}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-black text-[#0A1F12]">{cartQty} in cart</span>
            <button
              onClick={(e) => handleStepperChange(e, 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full mt-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : added
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#0F7B3A] hover:bg-emerald-500 text-white'
            }`}
          >
            {isOutOfStock ? 'Sold Out' : added ? (<><Check className="w-3.5 h-3.5" /> Added</>) : 'Add to Basket'}
          </button>
        )}
      </div>
    </div>
  );
};
