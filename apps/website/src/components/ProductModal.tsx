import React, { useState } from 'react';
import { X, Star, ShieldCheck, ShoppingBag, Heart, Check, Flame, RefreshCw, Box, Info, ChefHat } from 'lucide-react';
import { Product, ProductWeightOption } from '../types';
import { StoreService } from '../lib/storage';
import { Hero3DCanvas } from './Hero3DCanvas';
import { FadeImage } from './FadeImage';
import { getBulkLineTotal } from '../lib/pricing';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const [selectedWeight, setSelectedWeight] = useState<ProductWeightOption>(product.weightOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'360' | '3d' | 'nutrition'>('360');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(() => StoreService.getWishlist().includes(product.id));
  const [cutStyle, setCutStyle] = useState<string>('Curry Cut');

  const images = product.galleryImages.length > 0 ? product.galleryImages : [product.image];
  // Previously missing entirely — this modal let a Sold Out product be added
  // to the cart because it never checked stockStatus at all (ProductCard.tsx
  // and BrowseProductCard.tsx, which open this same modal via Quick View,
  // both already guard on this).
  const isOutOfStock = product.stockStatus === 'Out of Stock';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, selectedWeight, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = () => {
    StoreService.toggleWishlist(product.id);
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-4xl w-full text-[#0A1F12] overflow-hidden relative shadow-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-neutral-600 hover:text-[#0A1F12] transition cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Interactive Image Gallery & 3D / 360 View */}
          <div className="bg-neutral-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-200 relative">
            {/* View Mode Toggle Tabs */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveTab('360')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  activeTab === '360'
                    ? 'bg-[#0F7B3A] text-white'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:text-[#0A1F12]'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" /> 360° View
              </button>
              <button
                onClick={() => setActiveTab('3d')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  activeTab === '3d'
                    ? 'bg-[#0F7B3A] text-white'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:text-[#0A1F12]'
                }`}
              >
                <Box className="w-3.5 h-3.5" /> 3D Model
              </button>
              <button
                onClick={() => setActiveTab('nutrition')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  activeTab === 'nutrition'
                    ? 'bg-[#0F7B3A] text-white'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:text-[#0A1F12]'
                }`}
              >
                <Info className="w-3.5 h-3.5" /> Nutrition
              </button>
            </div>

            {/* Display Area based on Tab */}
            {activeTab === '360' && (
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100">
                <FadeImage
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition duration-300"
                />
                <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-neutral-200 flex items-center justify-between">
                  <span>Interactive 360° Inspection</span>
                  <div className="flex items-center gap-1">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition ${
                          currentImageIndex === idx ? 'bg-emerald-400 scale-125' : 'bg-neutral-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === '3d' && (
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 bg-black">
                <Hero3DCanvas />
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-200 bg-white p-6 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-[#0A1F12] text-sm mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-600" /> Nutritional Facts per 100g
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Protein Content</span>
                      <strong className="text-emerald-700 font-bold">{product.nutrition.protein}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Total Calories</span>
                      <strong className="text-[#0A1F12]">{product.nutrition.calories}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Fat Content</span>
                      <strong className="text-[#0A1F12]">{product.nutrition.fat}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Carbohydrates</span>
                      <strong className="text-[#0A1F12]">{product.nutrition.carbs}</strong>
                    </div>
                    {product.nutrition.iron && (
                      <div className="flex justify-between py-1.5">
                        <span className="text-neutral-500">Iron Density</span>
                        <strong className="text-[#0A1F12]">{product.nutrition.iron}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-[11px] text-neutral-600">
                  100% Antibiotic-Residue-Free certified by lab testing under IGO quality standards.
                </div>
              </div>
            )}

            {/* Thumbnail selector */}
            {images.length > 1 && activeTab === '360' && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                      currentImageIndex === idx ? 'border-emerald-500 scale-105' : 'border-neutral-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt="thumb" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Purchase Controls */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                {isOutOfStock ? (
                  <span className="bg-[#0A1F12] text-white border border-[#0A1F12] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Out of Stock
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {product.freshnessGrade}
                  </span>
                )}
                <button
                  onClick={handleToggleWishlist}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-emerald-600 transition"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                  <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>

              <h2 className="text-xl font-bold text-[#0A1F12] mb-1">{product.name}</h2>

              <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                <div className="flex items-center gap-1 text-[#0A1F12] font-bold">
                  <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" /> {product.rating}
                  <span className="text-neutral-400 font-normal">({product.reviewCount} reviews)</span>
                </div>
                <span>•</span>
                <span>Cut: <strong>{product.boneType}</strong></span>
                <span>•</span>
                <span>Prep: <strong>{product.prepTimeMinutes} mins</strong></span>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* TenderCuts Custom Cut Style Selector */}
              <div className="space-y-2 mb-4 bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ChefHat className="w-3.5 h-3.5" /> Select Butchery Cut Style
                  </label>
                  <span className="text-[10px] text-neutral-500">Fresh Cut on Order</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Curry Cut', 'Biryani Cut', 'Boneless', 'Mince / Keema', 'Lollipop', 'Whole Cleaned'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setCutStyle(style)}
                      className={`p-1.5 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                        cutStyle === style
                          ? 'bg-[#0F7B3A] border-emerald-400 text-white shadow'
                          : 'bg-white border-neutral-200 text-neutral-600 hover:border-emerald-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight Options */}
              <div className="space-y-2 mb-4">
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Choose Portion Pack
                </label>
                <div className="space-y-2">
                  {product.weightOptions.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedWeight(opt)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        selectedWeight.label === opt.label
                          ? 'bg-emerald-50 border-emerald-500 text-[#0A1F12] font-bold'
                          : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
                      }`}
                    >
                      <div>
                        <div className="text-xs">{opt.label}</div>
                        <div className="text-[10px] text-neutral-500">{opt.servings} {opt.pieces && `• ${opt.pieces}`}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-[#0A1F12]">₹{opt.price}</div>
                        {opt.originalPrice > opt.price && (
                          <div className="text-[10px] text-neutral-400 line-through">₹{opt.originalPrice}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage Instructions & Recipe Pairing */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0A1F12] block">Storage Instruction:</strong>
                    <span className="text-neutral-600 text-[11px]">{product.storageInstructions}</span>
                  </div>
                </div>
                {product.recipePairing && (
                  <div className="flex items-start gap-2 pt-2 border-t border-neutral-200">
                    <Flame className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0A1F12] block">Chef Recipe Pairing:</strong>
                      <span className="text-neutral-600 text-[11px]">{product.recipePairing}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart Button */}
            <div className="pt-4 border-t border-neutral-200 flex items-center gap-4">
              <div className={`flex items-center bg-white border border-neutral-200 rounded-xl overflow-hidden ${isOutOfStock ? 'opacity-40 pointer-events-none' : ''}`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                  className="px-3 py-2 text-neutral-500 hover:text-[#0A1F12] transition font-bold"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold text-[#0A1F12]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isOutOfStock}
                  className="px-3 py-2 text-neutral-500 hover:text-[#0A1F12] transition font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg ${
                  isOutOfStock
                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none'
                    : added
                      ? 'bg-emerald-500 text-white cursor-pointer'
                      : 'bg-[#0F7B3A] hover:bg-emerald-500 text-white shadow-emerald-900/20 cursor-pointer'
                }`}
              >
                {isOutOfStock ? (
                  'Sold Out'
                ) : added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart • ₹{getBulkLineTotal(selectedWeight.price, quantity)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
