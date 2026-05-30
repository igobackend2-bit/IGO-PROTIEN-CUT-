import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Eye, TrendingUp, Star, Heart, Flame, ChevronRight, Search, PackageX } from 'lucide-react';
import { Product } from '../types/product';
import { useCart } from '../context/CartContext';
import SubscribeSave from '../components/SubscribeSave';
import QuickViewModal from '../components/QuickViewModal';
import { loadProducts, subscribeToProducts } from '../services/productStore';

const ProductSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse h-full">
    <div className="aspect-square bg-neutral-200" />
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <div className="h-5 w-1/2 bg-neutral-200 rounded" />
        <div className="h-5 w-1/4 bg-neutral-200 rounded" />
      </div>
      <div className="h-4 w-full bg-neutral-100 rounded" />
      <div className="h-4 w-3/4 bg-neutral-100 rounded" />
      <div className="h-10 w-full bg-neutral-200 rounded-xl" />
    </div>
  </div>
);

const ProductGrid = () => {
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedWeights, setSelectedWeights] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, wishlist, toggleWishlist } = useCart();

  const categories = ['All', 'Chicken', 'Mutton', 'Fish', 'Seafood', 'Eggs', 'Exotic'];

  useEffect(() => {
    // Load products from local store (reflects admin changes instantly)
    setLiveProducts(loadProducts());
    setIsLoading(false);
    // Subscribe to admin updates
    const unsubscribe = subscribeToProducts(updated => {
      setLiveProducts(updated);
    });
    return unsubscribe;
  }, []);

  // Listen to category filter from CategoryGrid
  useEffect(() => {
    const handler = (e: Event) => {
      const cat = (e as CustomEvent).detail;
      if (categories.includes(cat)) setSelectedCategory(cat);
    };
    window.addEventListener('categoryFilter', handler);
    return () => window.removeEventListener('categoryFilter', handler);
  }, []);

  // Listen to search queries from Navbar
  useEffect(() => {
    const handler = (e: Event) => {
      const query = (e as CustomEvent).detail;
      setSearchQuery(query.toLowerCase());
      
      // Auto-scroll to results if searching
      if (query.length > 0) {
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('searchQuery', handler);
    return () => window.removeEventListener('searchQuery', handler);
  }, []);

  const getWeight = (id: number, product: Product) =>
    selectedWeights[id] || product.weightOptions?.[0]?.label || '500g';

  const getPrice = (product: Product, weight: string) => {
    const opt = product.weightOptions?.find(w => w.label === weight);
    return Math.round(product.price * (opt?.priceMultiplier ?? 0.5));
  };

  // Search should be global (ignore category when searching)
  let filteredProducts = (searchQuery || selectedCategory === 'All')
    ? liveProducts
    : liveProducts.filter(p => p.category === selectedCategory);

  if (searchQuery) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery) || 
      p.description.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery)
    );
  }

  return (
    <section id="products" className="py-20 bg-neutral-light scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-igo-gold font-bold text-sm uppercase tracking-widest">Fresh Marketplace</span>
            <h2 className="text-4xl font-display font-bold mt-3 text-neutral-dark">Browse Our Fresh Cuts</h2>
            <p className="text-neutral-400 mt-2">Slaughtered fresh daily · Delivered within 90 mins</p>
          </div>

          <div className="flex overflow-x-auto pb-4 -mx-6 px-6 md:pb-0 md:mx-0 md:px-0 scrollbar-hide gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-igo-green text-white shadow-lg shadow-igo-green/25'
                    : 'bg-white text-neutral-500 hover:bg-white/80 shadow-sm border border-neutral-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <motion.div key={`sk-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ProductSkeleton />
                </motion.div>
              ))
            ) : filteredProducts.length > 0 ? (

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {filteredProducts.map((product) => {
                  const weight = getWeight(product.id, product);
                  const price = getPrice(product, weight);
                  const origPrice = product.originalPrice ? getPrice({ ...product, price: product.originalPrice }, weight) : null;
                  const discount = origPrice ? Math.round(((origPrice - price) / origPrice) * 100) : null;
                  const isWishlisted = wishlist.includes(product.id);

                  return (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: (liveProducts.indexOf(product) % 8) * 0.05,
                        ease: [0.215, 0.61, 0.355, 1] 
                      }}
                      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col border border-neutral-100"
                    >
                    {/* Image Area */}
                    <div 
                      className="relative aspect-square overflow-hidden bg-neutral-100 cursor-pointer group/img"
                      onClick={() => setQuickViewProduct(product)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607623814075-e512199b4472?auto=format&fit=crop&q=80&w=800';
                        }}
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${product.isPremium ? 'bg-igo-gold' : 'bg-igo-green'}`}>
                          {product.badge}
                        </span>
                        {discount && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500 text-white">
                            -{discount}%
                          </span>
                        )}
                      </div>

                      {/* Stock / Hot Badge */}
                      {product.stockLeft && product.stockLeft < 5 && (
                        <div className="absolute top-3 right-10 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                          <Flame className="w-3 h-3" />
                          {product.stockLeft}kg left
                        </div>
                      )}

                      {/* Wishlist */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all z-20 ${
                          isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-neutral-400 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                      </button>

                      {/* Overlay Indicator */}
                      <div className="absolute inset-0 bg-neutral-dark/10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm text-neutral-dark px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg">
                          <Eye className="w-3 h-3" />
                          View Details
                        </div>
                      </div>
                    </div>


                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Name + Price */}
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            product.category === 'Chicken' ? 'bg-orange-100 text-orange-600' :
                            product.category === 'Mutton' ? 'bg-red-100 text-red-600' :
                            product.category === 'Fish' ? 'bg-blue-100 text-blue-600' :
                            product.category === 'Seafood' ? 'bg-teal-100 text-teal-600' :
                            product.category === 'Eggs' ? 'bg-amber-100 text-amber-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {product.category}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-sm text-neutral-dark group-hover:text-igo-green transition-colors leading-tight line-clamp-2 flex-1">
                          {product.name}
                        </h3>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-igo-green text-base">₹{price}</span>
                          {origPrice && <span className="block text-[10px] text-neutral-300 line-through">₹{origPrice}</span>}
                        </div>
                      </div>

                      {/* Rating + Social Proof */}
                      {product.rating && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating!) ? 'fill-igo-gold text-igo-gold' : 'text-neutral-200'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-neutral-400">{product.rating} ({product.reviewCount?.toLocaleString()})</span>
                          {product.soldToday && (
                            <span className="text-[10px] font-bold text-igo-green ml-auto flex items-center gap-0.5">
                              <TrendingUp className="w-3 h-3" />{product.soldToday} today
                            </span>
                          )}
                        </div>
                      )}

                      {/* Ideal For Tags */}
                      {product.idealFor && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {product.idealFor.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-bold rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Weight Selector */}
                      {product.weightOptions && (
                        <div className="flex gap-1.5 mb-4 flex-wrap">
                          {product.weightOptions.map(opt => (
                            <button
                              key={opt.label}
                              onClick={() => setSelectedWeights(prev => ({ ...prev, [product.id]: opt.label }))}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                weight === opt.label
                                  ? 'bg-igo-green text-white shadow-md shadow-igo-green/20'
                                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Subscribe & Save */}
                      <SubscribeSave 
                        basePrice={price} 
                        onToggle={(active, freq) => console.log(`Subscribed: ${active}, Freq: ${freq}`)} 
                      />

                      {/* Add to Cart / Out of Stock */}
                      {product.stockLeft === 0 ? (
                        <div className="mt-auto w-full bg-neutral-100 text-neutral-400 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed border-2 border-dashed border-neutral-200">
                          <PackageX className="w-4 h-4" />
                          Out of Stock
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product, weight)}
                          className="mt-auto w-full bg-igo-green text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-igo-green/90 active:scale-[0.97] transition-all shadow-md shadow-igo-green/10"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6 text-neutral-300">
                  <Search className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-display font-bold text-neutral-dark mb-2">No matching cuts found</h3>
                <p className="text-neutral-400 max-w-xs mx-auto mb-8">We couldn't find anything matching "{searchQuery}". Try a different term or browse our categories.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    window.dispatchEvent(new CustomEvent('searchQuery', { detail: '' }));
                  }}
                  className="px-8 py-3 bg-igo-green text-white rounded-xl font-bold hover:bg-igo-green/90 transition-all shadow-lg shadow-igo-green/20"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View All */}
        <div className="mt-14 text-center">
          <button className="inline-flex items-center gap-3 text-neutral-dark font-bold hover:text-igo-green transition-colors group border border-neutral-200 hover:border-igo-green/30 px-8 py-4 rounded-2xl hover:shadow-lg">
            View All Products
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </section>
  );
};

export default ProductGrid;
