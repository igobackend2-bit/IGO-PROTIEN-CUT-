import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import OneClickCheckout from './OneClickCheckout';

const FloatingCheckoutBar = () => {
  const { cartCount, cartTotal, setIsCartOpen } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const freeDeliveryThreshold = 499;
  const total = cartTotal >= freeDeliveryThreshold ? cartTotal : cartTotal + 49;

  return (
    <>
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-16 md:bottom-0 left-0 right-0 z-[45] bg-white border-t border-neutral-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] px-4 py-3"
          >
            <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
              <div 
                className="flex flex-col flex-1"
                onClick={() => setIsCartOpen(true)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-igo-green/10 text-igo-green rounded flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </span>
                  <span className="font-bold text-neutral-dark">Item{cartCount > 1 ? 's' : ''} added</span>
                </div>
                <div className="text-igo-green font-display font-bold text-lg leading-none mt-1">
                  ₹{total}
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-igo-green text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-igo-green/20 active:scale-[0.98] transition-transform"
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <OneClickCheckout 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        total={total}
      />
    </>
  );
};

export default FloatingCheckoutBar;
