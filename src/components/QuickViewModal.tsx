import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ShoppingBag, Heart, Zap, Shield, Truck, Award, Plus, Minus, Dumbbell, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types/product';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [selectedWeight, setSelectedWeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Recipes' | 'Reviews'>('Overview');

  // Reset to first weight option when product changes
  useEffect(() => {
    if (product?.weightOptions?.[0]) {
      setSelectedWeight(product.weightOptions[0].label);
    } else {
      setSelectedWeight('500g');
    }
    setQuantity(1);
  }, [product]);

  if (!product) return null;

  const weightOptions = product.weightOptions || [
    { label: '250g', priceMultiplier: 0.25 },
    { label: '500g', priceMultiplier: 0.5 },
    { label: '1kg', priceMultiplier: 1 },
    { label: '2kg', priceMultiplier: 2 },
  ];

  const selectedOpt = weightOptions.find(w => w.label === selectedWeight) || weightOptions[1];
  const finalPrice = Math.round(product.price * selectedOpt.priceMultiplier);
  const originalFinalPrice = product.originalPrice ? Math.round(product.originalPrice * selectedOpt.priceMultiplier) : null;
  const discount = originalFinalPrice ? Math.round(((originalFinalPrice - finalPrice) / originalFinalPrice) * 100) : null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({ ...product, weightOptions }, selectedWeight);
    }
    onClose();
  };

  const isWishlisted = wishlist.includes(product.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white w-full sm:max-w-3xl rounded-t-[32px] sm:rounded-[32px] overflow-hidden max-h-[95vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="grid sm:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square sm:aspect-auto sm:h-full bg-neutral-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${product.isPremium ? 'bg-igo-gold' : 'bg-igo-green'}`}>
                    {product.badge}
                  </span>
                </div>
              )}
              {discount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{discount}%
                </div>
              )}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-neutral-400 hover:text-red-500'}`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Details */}
            <div className="p-6 sm:p-8 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-igo-green">{product.category}</span>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="font-display font-bold text-2xl text-neutral-dark mb-2">{product.name}</h2>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'fill-igo-gold text-igo-gold' : 'text-neutral-200'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-neutral-dark">{product.rating}</span>
                  {product.reviewCount && <span className="text-sm text-neutral-400">({product.reviewCount.toLocaleString()} reviews)</span>}
                </div>
              )}

              <p className="text-neutral-500 text-sm leading-relaxed mb-6">{product.description}</p>

              {/* Ideal For */}
              {product.idealFor && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.idealFor.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-igo-green/10 text-igo-green text-xs font-bold rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Weight Selector */}
              <div className="mb-4">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Select Weight</label>
                <div className="flex gap-2 flex-wrap">
                  {weightOptions.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedWeight(opt.label)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 ${
                        selectedWeight === opt.label
                          ? 'bg-igo-green text-white border-igo-green shadow-lg shadow-igo-green/20'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-igo-green/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-end gap-3 mb-6">
                <span className="text-3xl font-display font-bold text-igo-green">₹{finalPrice}</span>
                {originalFinalPrice && (
                  <span className="text-lg text-neutral-300 line-through">₹{originalFinalPrice}</span>
                )}
                {discount && <span className="text-sm font-bold text-red-500">{discount}% off</span>}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3 bg-neutral-100 rounded-xl p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-lg bg-white flex items-center justify-center hover:bg-igo-green hover:text-white transition-colors shadow-sm">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-lg bg-white flex items-center justify-center hover:bg-igo-green hover:text-white transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.stockLeft && product.stockLeft < 5 && (
                  <span className="text-xs font-bold text-orange-500">Only {product.stockLeft}kg left!</span>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-igo-green text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-igo-green/90 transition-all shadow-lg shadow-igo-green/20 active:scale-[0.98] mb-4"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart — ₹{finalPrice * quantity}
              </button>

              {/* Nutrition + Info strip */}
              {(product.protein || product.piecesPerKg) && (
                <div className="flex gap-3 mb-4">
                  {product.protein && (
                    <div className="flex-1 flex items-center gap-2 bg-igo-green/5 border border-igo-green/15 rounded-xl p-3">
                      <Dumbbell className="w-4 h-4 text-igo-green flex-shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-igo-green uppercase tracking-wider">Protein</div>
                        <div className="text-xs font-bold text-neutral-dark">{product.protein}</div>
                      </div>
                    </div>
                  )}
                  {product.piecesPerKg && (
                    <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-100 rounded-xl p-3">
                      <Award className="w-4 h-4 text-igo-gold flex-shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Pieces</div>
                        <div className="text-xs font-bold text-neutral-dark">{product.piecesPerKg}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Trust Strip */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-100">
                {[
                  { icon: Shield, text: 'Quality Certified' },
                  { icon: Truck, text: '60-90 Min Delivery' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-neutral-500">
                    <Icon className="w-3.5 h-3.5 text-igo-green" />
                    {text}
                  </div>
                ))}
              </div>

              {/* Tabs Section */}
              <div className="mt-8 border-t pt-6">
                <div className="flex gap-6 border-b border-neutral-100 mb-6">
                  {['Overview', 'Recipes', 'Reviews'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`pb-3 text-sm font-bold uppercase tracking-widest transition-all relative ${
                        activeTab === tab ? 'text-igo-green' : 'text-neutral-400 hover:text-neutral-600'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-igo-green" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="min-h-[120px]">
                  {activeTab === 'Overview' && (
                    <div className="space-y-4">
                      <p className="text-sm text-neutral-500 leading-relaxed">{product.description}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-50 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Protein Content</p>
                          <p className="text-sm font-bold text-neutral-700">{product.protein || '22g per 100g'}</p>
                        </div>
                        <div className="bg-neutral-50 p-3 rounded-xl">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Ideal For</p>
                          <p className="text-sm font-bold text-neutral-700">Curries, Grilling</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Recipes' && (
                    <div className="space-y-4">
                      <div className="relative aspect-video rounded-2xl bg-neutral-900 overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all cursor-pointer">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
                            <Plus className="w-6 h-6 text-igo-green rotate-45" />
                          </div>
                        </div>
                        <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" className="w-full h-full object-cover opacity-60" />
                      </div>
                      <p className="text-xs font-bold text-neutral-dark">How to cook {product.name} (Chef's Special)</p>
                    </div>
                  )}

                  {activeTab === 'Reviews' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex text-igo-gold">
                          {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                        </div>
                        <span className="text-sm font-bold">4.9 (42 Reviews)</span>
                      </div>
                      {[
                        { user: 'Senthil K.', rating: 5, comment: 'Extremely fresh and well cut. The packaging was top notch.' },
                        { user: 'Priya M.', rating: 5, comment: 'The best quality chicken I have ordered online in Coimbatore.' }
                      ].map((rev, i) => (
                        <div key={i} className="border-b border-neutral-100 pb-3 last:border-0">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-bold">{rev.user}</p>
                            <div className="flex text-igo-gold">
                              {[1,2,3,4,5].map(star => <Star key={star} className="w-2 h-2 fill-current" />)}
                            </div>
                          </div>
                          <p className="text-[11px] text-neutral-500">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Recommended Products in Quick View */}
          <div className="bg-neutral-light/50 border-t border-neutral-100 p-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-igo-gold" />
              <h4 className="font-bold text-xs uppercase tracking-widest text-neutral-400">Perfectly Paired with this Cut</h4>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {[
                { name: 'Tikka Marinade', price: 49, img: 'https://images.unsplash.com/photo-1589187151032-573a91d1707d?w=400' },
                { name: 'Farm Eggs (6pk)', price: 60, img: '/images/products/eggs.png' },
                { name: 'Curry Powder', price: 35, img: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400' }
              ].map((addon, i) => (
                <div key={i} className="min-w-[140px] bg-white rounded-2xl p-4 border border-neutral-100 flex flex-col items-center text-center group/addon hover:shadow-lg transition-all">
                  <img src={addon.img} alt={addon.name} className="w-16 h-16 rounded-xl object-cover mb-3" />
                  <h5 className="text-[10px] font-bold text-neutral-dark line-clamp-1">{addon.name}</h5>
                  <p className="text-[10px] text-igo-green font-bold mb-3">₹{addon.price}</p>
                  <button className="w-full py-1.5 bg-igo-green/5 border border-igo-green/20 text-igo-green text-[9px] font-bold rounded-lg hover:bg-igo-green hover:text-white transition-colors">
                    Quick Add +
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
