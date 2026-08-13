import React, { useState, useEffect } from 'react';
import { ShoppingBag, Check, Heart, Bell, Minus, Plus } from 'lucide-react';
import { Product, ProductWeightOption } from '../types';
import { StoreService } from '../lib/storage';
import { FadeImage } from './FadeImage';
import { useLang } from '../lib/language';
import { translateProductName } from '../lib/productNames';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
  onNavigate?: (path: string) => void;
}

// Simplified to a minimal card — image, one status badge, category label,
// name, weight, price with savings, Add button — replacing the previous
// denser card (weight-tier selector grid, inline coupon call-out, nutrition
// bar, Buy Now button, spinning "360°" badge that never had a real 360 view
// behind it). Weight selection now happens on the product detail page after
// tapping through, matching how the reference layout works; the card itself
// always adds the product's default (first) weight tier.
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart
}) => {
  const { t, lang } = useLang();
  const [added, setAdded] = useState(false);
  const [notified, setNotified] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(() => StoreService.getWishlist().includes(product.id));

  // If this same product also renders elsewhere on the page (e.g. a "You
  // Might Also Like" rail on its own PDP, or repeated across homepage
  // rails), toggling the heart in one spot left every other card showing
  // the stale state until a remount — this keeps them all in sync, same
  // event Navbar.tsx and WishlistPage.tsx already listen for.
  useEffect(() => {
    const sync = () => setIsWishlisted(StoreService.getWishlist().includes(product.id));
    window.addEventListener('protein_cuts_wishlist_updated', sync);
    return () => window.removeEventListener('protein_cuts_wishlist_updated', sync);
  }, [product.id]);

  const currentWeight = product.weightOptions[0];
  const isOutOfStock = product.stockStatus === 'Out of Stock';
  const isLowStock = product.stockStatus === 'Limited Stock';
  const savings = currentWeight.originalPrice - currentWeight.price;

  // Previously Add just flashed to "Added!" for ~1.2s and reverted to a
  // plain Add button, with nothing on the card showing how many of the
  // selected weight were actually already in the cart.
  const [cartQty, setCartQty] = useState(() => StoreService.getCartQuantityForWeight(product.id, currentWeight.label));

  useEffect(() => {
    const sync = () => setCartQty(StoreService.getCartQuantityForWeight(product.id, currentWeight.label));
    sync();
    window.addEventListener('protein_cuts_cart_updated', sync);
    return () => window.removeEventListener('protein_cuts_cart_updated', sync);
  }, [product.id, currentWeight.label]);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, currentWeight, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleStepperChange = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    StoreService.adjustCartQuantity(product.id, currentWeight.label, delta);
  };

  const handleNotify = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotified(true);
    setTimeout(() => setNotified(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    StoreService.toggleWishlist(product.id);
    setIsWishlisted(!isWishlisted);
  };

  // Single top-left status pill, most urgent first — a card only ever shows
  // one, matching the minimal reference layout instead of stacking multiple
  // badges.
  const statusBadge = isOutOfStock
    ? { label: 'OUT OF STOCK', className: 'bg-[#0A1F12] text-white' }
    : isLowStock
    ? { label: 'LOW STOCK', className: 'bg-amber-500 text-white' }
    : product.isTodayFresh
    ? { label: 'FRESH TODAY', className: 'bg-emerald-600 text-white' }
    : product.isBestSeller
    ? { label: 'BEST SELLER', className: 'bg-white text-[#0A1F12]' }
    : null;

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
        {/* FadeImage rather than a bare <img>: a product whose photo hasn't
            been uploaded yet falls back to the brand mark instead of rendering
            a broken-image icon with the product name spilling across the card,
            which looked especially bad on mobile. */}
        <FadeImage
          src={product.image}
          alt={translateProductName(product.id, product.name, lang)}
          className={`w-full h-full object-cover group-hover:scale-105 transition duration-500 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
        />

        {statusBadge && (
          <span
            className={`absolute top-3 left-3 z-10 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-neutral-700 hover:text-emerald-600 transition z-10 shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-emerald-500 text-emerald-500' : ''}`} />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="uppercase tracking-wider text-[10px] font-bold text-emerald-600">
            {product.subcategory}
          </span>

          <h3 className="text-sm font-bold text-[#0A1F12] group-hover:text-emerald-600 transition line-clamp-1 mt-0.5">
            {translateProductName(product.id, product.name, lang)}
          </h3>

          <div className="text-xs text-neutral-500 mt-1">{currentWeight.label}</div>
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-[#0A1F12]">₹{currentWeight.price}</span>
              {currentWeight.originalPrice > currentWeight.price && (
                <span className="text-xs text-neutral-400 line-through">₹{currentWeight.originalPrice}</span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Save ₹{savings}</span>
            )}
          </div>

          {isOutOfStock ? (
            <button
              onClick={handleNotify}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md ${
                notified
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white border border-neutral-300 hover:border-emerald-400 text-[#0A1F12]'
              }`}
            >
              {notified ? (
                <>
                  <Check className="w-3.5 h-3.5" /> {t('notified')}
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" /> {t('notify')}
                </>
              )}
            </button>
          ) : cartQty > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-1 py-1"
            >
              <button
                onClick={(e) => handleStepperChange(e, -1)}
                aria-label="Decrease quantity"
                className="w-6 h-6 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 rounded-lg transition cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-black text-[#0A1F12] min-w-[1ch] text-center">{cartQty}</span>
              <button
                onClick={(e) => handleStepperChange(e, 1)}
                aria-label="Increase quantity"
                className="w-6 h-6 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md ${
                added ? 'bg-emerald-500 text-white' : 'bg-[#0F7B3A] hover:bg-emerald-500 text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" /> {t('added')}
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" /> {t('addToCart')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
