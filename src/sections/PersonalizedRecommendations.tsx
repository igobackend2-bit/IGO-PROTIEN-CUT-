import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, History, ArrowRight, ShoppingBag, Star } from 'lucide-react';
import { useCart, Product } from '../context/CartContext';
import { products } from './ProductGrid';

const PersonalizedRecommendations = () => {
  const { wishlist, addToCart, cart } = useCart();
  
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));
  
  // Mock frequently purchased based on cart or generic popular items
  const frequentlyPurchased = products.slice(0, 4);
  
  // Mock AI recommendations
  const aiRecommendations = products.slice(4, 8);

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="min-w-[240px] md:min-w-[280px] bg-white rounded-3xl p-4 border border-neutral-100 shadow-sm hover:shadow-xl transition-all group"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-neutral-50">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <button 
          onClick={() => addToCart(product, '500g')}
          className="absolute bottom-3 right-3 w-10 h-10 bg-igo-green text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-igo-green/90 transition-all scale-0 group-hover:scale-100"
        >
          <ShoppingBag className="w-5 h-5" />
        </button>
      </div>
      <div className="flex justify-between items-start mb-1">
        <h5 className="font-bold text-neutral-dark text-sm line-clamp-1">{product.name}</h5>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-igo-gold text-igo-gold" />
          <span className="text-[10px] font-bold text-neutral-400">{product.rating}</span>
        </div>
      </div>
      <p className="text-xs text-neutral-400 mb-3">{product.category}</p>
      <div className="flex items-center justify-between">
        <span className="font-display font-bold text-igo-green">₹{product.price}</span>
        <button className="text-[10px] font-bold text-igo-green hover:underline uppercase tracking-wider">Quick Add +</button>
      </div>
    </motion.div>
  );

  return (
    <section className="py-20 bg-neutral-light/30">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Wishlist Section */}
        {wishlistProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl text-neutral-dark">Your Wishlist</h3>
                  <p className="text-sm text-neutral-400 font-medium">Items you've saved for later</p>
                </div>
              </div>
              <button className="flex items-center gap-2 text-sm font-bold text-igo-green hover:underline">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
              {wishlistProducts.map(product => (
                <div key={product.id} className="snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frequently Purchased */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <History className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-neutral-dark">Frequently Purchased</h3>
                <p className="text-sm text-neutral-400 font-medium">Staples for your kitchen</p>
              </div>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
            {frequentlyPurchased.map(product => (
              <div key={product.id} className="snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-igo-gold/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-igo-gold" />
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl text-neutral-dark">Recommended for You</h3>
                <p className="text-sm text-neutral-400 font-medium">Based on current freshness & trends</p>
              </div>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
            {aiRecommendations.map(product => (
              <div key={product.id} className="snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default PersonalizedRecommendations;
