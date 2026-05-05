import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, HeartCrack } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { products } from '../sections/ProductGrid';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistDrawer = ({ isOpen, onClose }: WishlistDrawerProps) => {
  const { wishlist, toggleWishlist, addToCart } = useCart();

  const wishlistedItems = products.filter(p => wishlist.includes(p.id));

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleMoveToCart = (product: any) => {
    addToCart(product, product.weightOptions?.[0]?.label || '500g');
    toggleWishlist(product.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-dark/40 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[100] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
              <h2 className="font-display font-bold text-xl flex items-center gap-2">
                Your Wishlist
                <span className="text-xs font-bold bg-igo-green text-white px-2 py-0.5 rounded-full">{wishlistedItems.length}</span>
              </h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <X className="w-4 h-4 text-neutral-600" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-neutral-50/50">
              {wishlistedItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <HeartCrack className="w-8 h-8 text-red-300" />
                  </div>
                  <h3 className="font-bold text-neutral-dark mb-2">Your wishlist is empty</h3>
                  <p className="text-sm text-neutral-500 max-w-[200px] mb-6">Save your favorite cuts here to find them quickly later.</p>
                  <button 
                    onClick={onClose}
                    className="px-6 py-3 bg-igo-green text-white rounded-xl font-bold hover:bg-igo-green/90 transition-colors"
                  >
                    Explore Products
                  </button>
                </div>
              ) : (
                wishlistedItems.map((item) => {
                  const defaultWeight = item.weightOptions?.[0];
                  const multiplier = defaultWeight?.priceMultiplier ?? 0.5;
                  const finalPrice = Math.round(item.price * multiplier);
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id} 
                      className="bg-white p-4 rounded-2xl border border-neutral-100 flex gap-4 group hover:shadow-md transition-all"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-sm leading-tight text-neutral-dark line-clamp-2">{item.name}</h4>
                            <button 
                              onClick={() => toggleWishlist(item.id)}
                              className="text-neutral-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">{defaultWeight?.label || '500g'}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-igo-green">₹{finalPrice}</span>
                          <button 
                            onClick={() => handleMoveToCart(item)}
                            className="text-[10px] font-bold bg-igo-green/10 text-igo-green px-3 py-1.5 rounded-lg hover:bg-igo-green hover:text-white transition-colors flex items-center gap-1.5"
                          >
                            <ShoppingBag className="w-3 h-3" /> Move to Cart
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistDrawer;
