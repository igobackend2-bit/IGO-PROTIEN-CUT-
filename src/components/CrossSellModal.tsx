import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShoppingBag, ArrowRight, Star, Sparkles, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const relatedProducts = [
  { id: 101, name: 'Premium Chicken Breast', price: 210, img: '/images/products/chicken-breast.png', rating: 4.9 },
  { id: 102, name: 'Mutton Curry Cut', price: 450, img: '/images/products/mutton-curry.png', rating: 4.8 },
  { id: 104, name: 'Nattu Kozhi Eggs', price: 180, img: '/images/products/eggs.png', rating: 5.0 },
];

const CrossSellModal = () => {
  const { isAddedModalOpen, setIsAddedModalOpen, lastAddedItem, setIsCartOpen, addToCart, wishlist, toggleWishlist } = useCart();

  if (!lastAddedItem) return null;

  return (
    <AnimatePresence>
      {isAddedModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAddedModalOpen(false)}
            className="fixed inset-0 bg-neutral-dark/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] md:w-[550px] bg-white rounded-[3rem] overflow-hidden z-[110] shadow-2xl"
          >
            {/* Header Success Strip */}
            <div className="bg-igo-green p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg">Added to Cart!</h3>
                  <p className="text-xs text-white/70">Item successfully added to your bag</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddedModalOpen(false)}
                className="w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {/* Added Item Preview */}
              <div className="flex items-center gap-6 p-4 bg-neutral-light rounded-2xl mb-10 border border-neutral-100">
                <img 
                  src={lastAddedItem.image} 
                  alt={lastAddedItem.name} 
                  className="w-20 h-20 rounded-xl object-cover shadow-md"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-neutral-dark">{lastAddedItem.name}</h4>
                  <p className="text-xs text-neutral-400 mt-1">{lastAddedItem.selectedWeight}</p>
                  <p className="text-igo-green font-bold mt-1">₹{lastAddedItem.finalPrice}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-neutral-300 uppercase block mb-1">Qty</span>
                  <span className="text-lg font-bold text-neutral-dark">1</span>
                </div>
              </div>

              {/* Cross-sell Section */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-igo-gold" />
                    <h4 className="font-bold text-xs uppercase tracking-widest text-neutral-400">Customers Also Bought</h4>
                  </div>
                  <button className="text-[10px] font-bold text-igo-green hover:underline uppercase tracking-wider">View All</button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {relatedProducts.map(product => (
                    <div key={product.id} className="group cursor-pointer">
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-neutral-100">
                        <img 
                          src={product.img} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        <button 
                          onClick={() => addToCart(product as any, '500g')}
                          className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-md rounded-lg shadow-lg flex items-center justify-center text-igo-green hover:bg-igo-green hover:text-white transition-all"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                      <h5 className="text-[10px] font-bold text-neutral-dark truncate">{product.name}</h5>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] font-bold text-igo-green">₹{product.price}</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            className={`transition-colors ${wishlist.includes(product.id) ? 'text-red-500' : 'text-neutral-300 hover:text-red-500'}`}
                          >
                            <Heart className={`w-3 h-3 ${wishlist.includes(product.id) ? 'fill-red-500' : ''}`} />
                          </button>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-igo-gold text-igo-gold" />
                            <span className="text-[9px] text-neutral-400 font-bold">{product.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setIsAddedModalOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full py-4 rounded-2xl bg-igo-green text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-igo-green/90 transition-all shadow-lg shadow-igo-green/20 active:scale-[0.98]"
                >
                  Continue to Purchase
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsAddedModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-neutral-100 text-neutral-500 font-bold text-xs hover:bg-neutral-200 transition-all"
                  >
                    Add More Items
                  </button>
                  <button 
                    onClick={() => {
                      setIsAddedModalOpen(false);
                      setIsCartOpen(true);
                    }}
                    className="flex-1 py-3 rounded-xl bg-neutral-dark text-white font-bold text-xs hover:bg-neutral-800 transition-all"
                  >
                    Checkout Now
                  </button>
                </div>
              </div>

              <p className="mt-6 text-center text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                Quick Checkout: No other products needed? Click "Checkout Now"
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CrossSellModal;
