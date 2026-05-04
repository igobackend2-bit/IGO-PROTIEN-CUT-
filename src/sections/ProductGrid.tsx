import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Eye, TrendingUp, Info, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const products = [
  // CHICKEN
  {
    id: 1,
    name: 'Fresh Farm Chicken (Whole)',
    description: 'Hormone-free poultry from verified farms, iced to perfection.',
    price: 320.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800',
    category: 'Chicken',
    badge: 'Fresh Today'
  },
  {
    id: 2,
    name: 'Chicken Breast (Boneless)',
    description: 'Lean, protein-dense, 26g protein per 100g. Ideal for grills.',
    price: 420.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=800',
    category: 'Chicken',
    badge: 'Fitness Favorite'
  },
  {
    id: 3,
    name: 'Naattu Kozhi (Country Chicken)',
    description: 'Heritage breed from Chettinad heritage farms. Deep flavor.',
    price: 480.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?auto=format&fit=crop&q=80&w=800',
    category: 'Chicken',
    badge: 'Heritage',
    isPremium: true
  },
  // MUTTON
  {
    id: 4,
    name: 'Goat Mutton Curry Cut',
    description: 'Mixed pieces with bone for marrow-rich traditional curries.',
    price: 520.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800',
    category: 'Mutton',
    badge: 'Best Seller'
  },
  {
    id: 5,
    name: 'Premium Mutton Keema',
    description: 'Ultra-fine mince, 80/20 lean-to-fat ratio for kebabs.',
    price: 580.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&q=80&w=800',
    category: 'Mutton',
    badge: 'Choice Cut'
  },
  // FISH
  {
    id: 6,
    name: 'Vanjaram (Seer Fish) Steaks',
    description: 'The King of South Indian fish. Firm, flavorful, premium.',
    price: 700.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800',
    category: 'Fish',
    badge: 'Premium',
    isPremium: true
  },
  {
    id: 7,
    name: 'Wild Atlantic Salmon',
    description: 'Imported, Omega-3 rich, vibrant sushi-grade fillets.',
    price: 1850.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1599481238640-4c1288750d7a?auto=format&fit=crop&q=80&w=800',
    category: 'Fish',
    badge: 'Imported'
  },
  // SEAFOOD
  {
    id: 8,
    name: 'Live Mud Crab',
    description: 'Meaty, sweet meat delicacies, farm-caught and alive.',
    price: 1200.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=800',
    category: 'Seafood',
    badge: 'Live'
  },
  {
    id: 9,
    name: 'Jumbo Tiger Prawns',
    description: 'Pristine jumbo prawns, cleaned and ready for tandoori.',
    price: 950.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1565689157206-0fddef7589a2?auto=format&fit=crop&q=80&w=800',
    category: 'Seafood',
    badge: 'Fresh Catch'
  },
  // EGGS / EXOTIC
  {
    id: 10,
    name: 'Nattu Kozhi Eggs (12pk)',
    description: 'Heritage breed eggs with deeper golden yolks. Preferred for kids.',
    price: 180.00,
    unit: 'pack',
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=800',
    category: 'Eggs',
    badge: 'Heritage'
  },
  {
    id: 11,
    name: 'Dressed Quail (Kaadai)',
    description: 'Rare game bird, tender and flavorful gourmet specialty.',
    price: 1200.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=800',
    category: 'Exotic',
    badge: 'Gourmet',
    isPremium: true
  }
];

const ProductSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse h-full">
    <div className="aspect-square bg-neutral-200" />
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <div className="h-6 w-1/2 bg-neutral-200 rounded" />
        <div className="h-6 w-1/4 bg-neutral-200 rounded" />
      </div>
      <div className="h-4 w-full bg-neutral-100 rounded" />
      <div className="pt-4 border-t border-neutral-50 flex justify-between">
        <div className="h-3 w-1/3 bg-neutral-100 rounded" />
        <div className="h-3 w-1/4 bg-neutral-100 rounded" />
      </div>
    </div>
  </div>
);

const ProductGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const categories = ['All', 'Chicken', 'Mutton', 'Fish', 'Seafood', 'Exotic', 'Eggs'];

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <section id="products" className="py-24 bg-neutral-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-igo-gold font-bold text-sm uppercase tracking-widest">Fresh Marketplace</span>
            <h2 className="text-4xl font-display font-bold mt-4 text-neutral-dark">Browse Our Fresh Cuts</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat 
                  ? 'bg-igo-green text-white shadow-lg shadow-igo-green/20' 
                  : 'bg-white text-neutral-500 hover:bg-white/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              // Rendering Skeletons
              [...Array(8)].map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ProductSkeleton />
                </motion.div>
              ))
            ) : (
              filteredProducts.map((product) => (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${
                        product.isPremium ? 'bg-igo-gold' : 'bg-igo-green'
                      }`}>
                        {product.badge}
                      </span>
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-neutral-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-neutral-dark hover:bg-igo-gold hover:text-white transition-colors" title="Quick View">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-neutral-dark hover:bg-igo-green hover:text-white transition-colors"
                        title="Add to Cart"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display font-bold text-lg text-neutral-dark group-hover:text-igo-green transition-colors">
                        {product.name}
                      </h3>
                      <div className="text-right">
                        <span className="font-bold text-igo-green">₹{product.price.toFixed(0)}</span>
                        <span className="text-[10px] text-neutral-400 block -mt-1">per {product.unit}</span>
                      </div>
                    </div>
                    <p className="text-neutral-400 text-sm mb-6 line-clamp-1">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-50">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-neutral-300">
                        <TrendingUp className="w-3 h-3" />
                        Traceable Batch
                      </div>
                      <button className="text-igo-gold hover:text-igo-green text-xs font-bold flex items-center gap-1 transition-colors">
                        <Info className="w-3 h-3" />
                        Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-16 text-center">
          <button className="inline-flex items-center gap-3 text-neutral-dark font-bold hover:text-igo-green transition-colors group">
            View All Products
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:bg-igo-green group-hover:text-white transition-all shadow-md">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
