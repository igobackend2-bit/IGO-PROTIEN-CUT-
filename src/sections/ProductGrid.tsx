import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Eye, TrendingUp, Star, Heart, Flame, ChevronRight, Search } from 'lucide-react';
import { useCart, Product } from '../context/CartContext';
import QuickViewModal from '../components/QuickViewModal';
import SubscribeSave from '../components/SubscribeSave';

export const products: Product[] = [
  // CHICKEN
  {
    id: 1,
    name: 'Fresh Farm Chicken (Whole)',
    description: 'Hormone-free poultry from verified Tamil Nadu farms, iced and delivered at peak freshness.',
    price: 320.00,
    originalPrice: 380.00,
    unit: 'kg',
    image: '/images/products/chicken-whole.png',
    category: 'Chicken',
    badge: 'Fresh Today',
    rating: 4.8,
    reviewCount: 3241,
    soldToday: 142,
    idealFor: ['Curry', 'Roast', 'Biryani'],
    chefTip: 'Marinate overnight with yogurt and spices for the juiciest roast chicken.',
    protein: '27g per 100g',
    piecesPerKg: '8-10 pieces',
    weightOptions: [
      { label: '500g', priceMultiplier: 0.5 },
      { label: '1kg', priceMultiplier: 1 },
      { label: '2kg', priceMultiplier: 1.9 },
    ],
  },
  {
    id: 2,
    name: 'Chicken Breast (Boneless)',
    description: 'Lean, protein-dense, 26g protein per 100g. Ideal for grills, stir-fry, and meal preps.',
    price: 420.00,
    originalPrice: 480.00,
    unit: 'kg',
    image: '/images/products/chicken-breast.png',
    category: 'Chicken',
    badge: 'Fitness Fav',
    rating: 4.9,
    reviewCount: 5102,
    soldToday: 89,
    idealFor: ['Grill', 'Salad', 'Meal Prep'],
    chefTip: 'Pound to even thickness before grilling for perfectly cooked, juicy breasts.',
    protein: '26g per 100g',
    weightOptions: [
      { label: '250g', priceMultiplier: 0.25 },
      { label: '500g', priceMultiplier: 0.5 },
      { label: '1kg', priceMultiplier: 1 },
    ],
  },
  {
    id: 3,
    name: 'Naattu Kozhi (Country Chicken)',
    description: 'Heritage breed from Chettinad farms. Deep, rich flavor with traditional taste.',
    price: 480.00,
    unit: 'kg',
    image: '/images/products/naattu-kozhi.png',
    category: 'Chicken',
    badge: 'Heritage',
    isPremium: true,
    rating: 4.9,
    reviewCount: 2198,
    soldToday: 34,
    stockLeft: 3,
    idealFor: ['Chettinad Curry', 'Pepper Fry', 'Biryani'],
    chefTip: 'Slow cook with freshly ground masala for the authentic Chettinad experience.',
    protein: '24g per 100g',
    weightOptions: [
      { label: '500g', priceMultiplier: 0.5 },
      { label: '1kg', priceMultiplier: 1 },
    ],
  },
  // MUTTON
  {
    id: 4,
    name: 'Goat Mutton Curry Cut',
    description: 'Mixed pieces with bone for marrow-rich traditional curries. Rich and flavorful.',
    price: 520.00,
    originalPrice: 600.00,
    unit: 'kg',
    image: '/images/products/mutton-curry.png',
    category: 'Mutton',
    badge: 'Best Seller',
    rating: 4.8,
    reviewCount: 4387,
    soldToday: 67,
    idealFor: ['Curry', 'Biryani', 'Stew'],
    chefTip: 'Brown the meat on high heat first to seal in the juices before slow cooking.',
    protein: '25g per 100g',
    piecesPerKg: '12-15 pieces',
    weightOptions: [
      { label: '500g', priceMultiplier: 0.5 },
      { label: '1kg', priceMultiplier: 1 },
      { label: '2kg', priceMultiplier: 1.85 },
    ],
  },
  {
    id: 5,
    name: 'Premium Mutton Keema',
    description: 'Ultra-fine mince, 80/20 lean-to-fat ratio for the perfect kebabs and koftas.',
    price: 580.00,
    unit: 'kg',
    image: '/images/products/mutton-keema.png',
    category: 'Mutton',
    badge: 'Choice Cut',
    rating: 4.7,
    reviewCount: 1892,
    soldToday: 41,
    idealFor: ['Kebab', 'Kofta', 'Stuffed Paratha'],
    chefTip: 'Add raw papaya paste to tenderize further for melt-in-mouth seekh kebabs.',
    protein: '22g per 100g',
    weightOptions: [
      { label: '250g', priceMultiplier: 0.25 },
      { label: '500g', priceMultiplier: 0.5 },
      { label: '1kg', priceMultiplier: 1 },
    ],
  },
  // FISH
  {
    id: 6,
    name: 'Vanjaram (Seer Fish) Steaks',
    description: 'The King of South Indian fish. Firm, flavorful, premium cuts ready to cook.',
    price: 700.00,
    originalPrice: 820.00,
    unit: 'kg',
    image: '/images/products/seer-fish.png',
    category: 'Fish',
    badge: 'Premium',
    isPremium: true,
    rating: 4.9,
    reviewCount: 3654,
    soldToday: 28,
    idealFor: ['Fry', 'Curry', 'Tandoori'],
    chefTip: 'Marinate in turmeric, chili, and lime for 30 minutes for the best fish fry.',
    protein: '29g per 100g',
    weightOptions: [
      { label: '500g', priceMultiplier: 0.5 },
      { label: '1kg', priceMultiplier: 1 },
    ],
  },
  {
    id: 7,
    name: 'Wild Atlantic Salmon',
    description: 'Imported, Omega-3 rich, vibrant sushi-grade fillets. Heart-healthy superfood.',
    price: 1850.00,
    unit: 'kg',
    image: '/images/products/salmon.png',
    category: 'Fish',
    badge: 'Imported',
    isPremium: true,
    rating: 4.8,
    reviewCount: 987,
    soldToday: 12,
    stockLeft: 2,
    idealFor: ['Sushi', 'Pan Sear', 'Bake'],
    chefTip: 'Bring to room temperature before cooking and sear skin-side down on high heat.',
    protein: '20g per 100g',
    weightOptions: [
      { label: '250g', priceMultiplier: 0.25 },
      { label: '500g', priceMultiplier: 0.5 },
    ],
  },
  // SEAFOOD
  {
    id: 8,
    name: 'Live Mud Crab',
    description: 'Meaty, sweet crab delicacies, farm-caught, cleaned and chilled to order.',
    price: 1200.00,
    unit: 'kg',
    image: '/images/products/mud-crab.png',
    category: 'Seafood',
    badge: 'Wild Caught',
    rating: 4.8,
    reviewCount: 742,
    soldToday: 19,
    idealFor: ['Curry', 'Pepper Crab', 'Steamed'],
    chefTip: 'Steam for 12 minutes with ginger and spring onion for the purest crab flavor.',
    protein: '18g per 100g',
    weightOptions: [
      { label: '500g', priceMultiplier: 0.5 },
      { label: '1kg', priceMultiplier: 1 },
    ],
  },
  {
    id: 9,
    name: 'Jumbo Tiger Prawns',
    description: 'Pristine jumbo prawns, cleaned and deveined. Ready for tandoori, grill, or curry.',
    price: 950.00,
    originalPrice: 1100.00,
    unit: 'kg',
    image: '/images/products/tiger-prawns.png',
    category: 'Seafood',
    badge: 'Fresh Catch',
    rating: 4.7,
    reviewCount: 2113,
    soldToday: 53,
    idealFor: ['Tandoori', 'Grill', 'Butter Garlic'],
    chefTip: 'Don\'t overcook! 2-3 minutes per side on high heat is all they need.',
    protein: '24g per 100g',
    piecesPerKg: '16-20 pieces',
    weightOptions: [
      { label: '250g', priceMultiplier: 0.25 },
      { label: '500g', priceMultiplier: 0.5 },
      { label: '1kg', priceMultiplier: 1 },
    ],
  },
  // EGGS
  {
    id: 10,
    name: 'Nattu Kozhi Eggs (12pk)',
    description: 'Heritage breed eggs with deeper golden yolks, rich taste. Preferred for kids.',
    price: 180.00,
    originalPrice: 210.00,
    unit: 'pack',
    image: '/images/products/eggs.png',
    category: 'Eggs',
    badge: 'Heritage',
    rating: 4.9,
    reviewCount: 6821,
    soldToday: 234,
    idealFor: ['Breakfast', 'Baking', 'Omelette'],
    chefTip: 'Add a splash of milk while whisking for the fluffiest omelettes.',
    protein: '13g per 100g',
    weightOptions: [
      { label: '12pk', priceMultiplier: 1 },
      { label: '24pk', priceMultiplier: 1.9 },
    ],
  },
  // EXOTIC
  {
    id: 11,
    name: 'Dressed Quail (Kaadai)',
    description: 'Rare game bird, tender and flavorful. Gourmet specialty from heritage farms.',
    price: 1200.00,
    unit: 'kg',
    image: '/images/products/quail.png',
    category: 'Exotic',
    badge: 'Gourmet',
    isPremium: true,
    rating: 4.9,
    reviewCount: 318,
    soldToday: 7,
    stockLeft: 2,
    idealFor: ['Pan Roast', 'BBQ', 'Fine Dining'],
    chefTip: 'Brine for 2 hours before roasting to keep the meat moist and flavorful.',
    protein: '22g per 100g',
    weightOptions: [
      { label: '500g', priceMultiplier: 0.5 },
      { label: '1kg', priceMultiplier: 1 },
    ],
  },
];

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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedWeights, setSelectedWeights] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, wishlist, toggleWishlist } = useCart();

  const categories = ['All', 'Chicken', 'Mutton', 'Fish', 'Seafood', 'Eggs', 'Exotic'];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
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
    ? products
    : products.filter(p => p.category === selectedCategory);

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

          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-igo-green text-white shadow-lg shadow-igo-green/25'
                    : 'bg-white text-neutral-500 hover:bg-white/80 shadow-sm'
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
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.25 }}
                      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-400 flex flex-col"
                    >
                    {/* Image Area */}
                    <div className="relative aspect-square overflow-hidden bg-neutral-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607623814075-e512199b4472?auto=format&fit=crop&q=80&w=800';
                        }}
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
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
                        <div className="absolute top-3 right-10 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                          <Flame className="w-3 h-3" />
                          {product.stockLeft}kg left
                        </div>
                      )}

                      {/* Wishlist */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                          isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-neutral-400 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                      </button>

                      {/* Quick View Overlay */}
                      <div className="absolute inset-0 bg-neutral-dark/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                          onClick={() => setQuickViewProduct(product)}
                          className="bg-white text-neutral-dark px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-igo-green hover:text-white transition-colors shadow-xl"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Quick View
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Name + Price */}
                      <div className="flex justify-between items-start gap-2 mb-1">
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

                      {/* Add to Cart */}
                      <button
                        onClick={() => addToCart(product, weight)}
                        className="mt-auto w-full bg-igo-green text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-igo-green/90 active:scale-[0.97] transition-all shadow-md shadow-igo-green/10"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </button>
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
