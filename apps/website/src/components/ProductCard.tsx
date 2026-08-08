import React, { useState, useEffect } from 'react';
import { ShoppingBag, Star, Flame, RefreshCw, Check, Heart, Zap, Bell, Tag, Minus, Plus } from 'lucide-react';
import { Product, ProductWeightOption } from '../types';
import { StoreService } from '../lib/storage';
import { FadeImage } from './FadeImage';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
  onNavigate?: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  onNavigate
}) => {
  const [selectedWeightIndex, setSelectedWeightIndex] = useState(0);
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

  const currentWeight = product.weightOptions[selectedWeightIndex] || product.weightOptions[0];
  const isOutOfStock = product.stockStatus === 'Out of Stock';

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

  // Inline coupon call-out (FreshToHome/ZappFresh pattern: "Use CODE" shown
  // directly on the product card, not just buried in the cart).
  const bestCoupon = StoreService.getCoupons()
    .filter((c) => currentWeight.price >= c.minOrderValue)
    .sort((a, b) => {
      const aOff = a.discountType === 'flat' ? a.value : Math.round((currentWeight.price * a.value) / 100);
      const bOff = b.discountType === 'flat' ? b.value : Math.round((currentWeight.price * b.value) / 100);
      return bOff - aOff;
    })[0];

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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, currentWeight, 1);
    if (onNavigate) onNavigate('/cart');
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
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition duration-500 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
        />

        {/* Overlay Gradient for badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center z-10">
          {isOutOfStock ? (
            <span className="bg-[#0A1F12] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
              Out of Stock
            </span>
          ) : (
            <>
              {product.discountPercentage > 0 && (
                <span className="bg-[#0F7B3A] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                  {product.discountPercentage}% OFF
                </span>
              )}
              {product.isBestSeller && (
                <span className="bg-white text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-black" /> BEST SELLER
                </span>
              )}
            </>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-md text-neutral-700 hover:text-emerald-600 transition z-10 shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-emerald-500 text-emerald-500' : ''}`} />
        </button>

        {/* Freshness Badge */}
        <div className="absolute bottom-2 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-medium border border-white/10 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {product.freshnessGrade}
        </div>

        {/* 360 / 3D Quick Indicator */}
        <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md">
          <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin-slow" /> 360°
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span className="uppercase tracking-wider text-[10px] font-bold text-emerald-600">
              {product.subcategory} • {product.boneType}
            </span>
            <div className="flex items-center gap-1 text-[#0A1F12] font-bold">
              <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>{product.rating}</span>
              <span className="text-neutral-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-[#0A1F12] group-hover:text-emerald-600 transition line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Nutrition High Bar */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px]">
          <span className="text-neutral-600">Protein: <strong className="text-emerald-700">{product.nutrition.protein}</strong></span>
          <span className="text-neutral-600">Prep: <strong className="text-[#0A1F12]">{product.prepTimeMinutes} mins</strong></span>
        </div>

        {/* Inline Coupon Call-out */}
        {!isOutOfStock && bestCoupon && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0F7B3A] bg-emerald-50/60 border border-dashed border-emerald-300 rounded-lg px-2 py-1">
            <Tag className="w-3 h-3 shrink-0" />
            Use <span className="font-mono">{bestCoupon.code}</span>: {bestCoupon.description}
          </div>
        )}

        {/* Weight Selector */}
        <div>
          <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Select Portion Cut
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {product.weightOptions.map((opt, idx) => (
              <button
                key={opt.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWeightIndex(idx);
                }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition ${
                  selectedWeightIndex === idx
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                    : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#0A1F12] hover:border-neutral-300'
                }`}
              >
                {opt.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Express Delivery Info */}
        {!isOutOfStock && (
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-semibold">
            <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
            Delivery in 30 mins
          </div>
        )}

        {/* Price & Add to Cart Footer */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-[#0A1F12]">₹{currentWeight.price}</span>
              {currentWeight.originalPrice > currentWeight.price && (
                <span className="text-xs text-neutral-400 line-through">₹{currentWeight.originalPrice}</span>
              )}
            </div>
            <div className="text-[10px] text-neutral-500 font-medium">{currentWeight.servings}</div>
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
                  <Check className="w-3.5 h-3.5" /> Notified!
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" /> Notify
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              {onNavigate && (
                <button
                  onClick={handleBuyNow}
                  className="px-3 py-2 rounded-xl text-xs font-bold border border-[#0F7B3A] text-[#0F7B3A] hover:bg-emerald-50 transition cursor-pointer"
                >
                  Buy Now
                </button>
              )}
              {cartQty > 0 ? (
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
                    added
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#0F7B3A] hover:bg-emerald-500 text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" /> Add
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
