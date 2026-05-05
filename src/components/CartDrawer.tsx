import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, Zap, Timer, Sparkles, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import DeliverySlotPicker from './DeliverySlotPicker';
import OneClickCheckout from './OneClickCheckout';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const [isFastLaneOpen, setIsFastLaneOpen] = React.useState(false);

  const freeDeliveryThreshold = 499;
  const remaining = freeDeliveryThreshold - cartTotal;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-igo-green/10 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-igo-green" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-neutral-dark">Your Cart</h2>
                  <p className="text-xs text-neutral-400">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Delivery Banner */}
            {remaining > 0 && (
              <div className="mx-4 mt-4 bg-igo-green/10 border border-igo-green/20 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-igo-green" />
                  <span className="text-neutral-700">Add <span className="font-bold text-igo-green">₹{remaining}</span> more for FREE delivery!</span>
                </div>
                <div className="mt-2 h-1.5 bg-igo-green/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-igo-green rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((cartTotal / freeDeliveryThreshold) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {remaining <= 0 && (
              <div className="mx-4 mt-4 bg-igo-green text-white rounded-2xl px-4 py-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-bold">🎉 You got FREE delivery!</span>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              <AnimatePresence>
                {cart.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full py-16 text-center"
                  >
                    <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-neutral-300" />
                    </div>
                    <h3 className="font-bold text-xl text-neutral-dark mb-2">Your cart is empty</h3>
                    <p className="text-neutral-400 text-sm mb-8">Add some fresh protein cuts to get started!</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="bg-igo-green text-white px-8 py-3 rounded-xl font-bold hover:bg-igo-green/90 transition-colors"
                    >
                      Shop Now
                    </button>
                  </motion.div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.selectedWeight}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-neutral-50 rounded-2xl p-4 flex gap-4"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-neutral-dark truncate">{item.name}</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">{item.selectedWeight}</p>
                        <p className="text-igo-green font-bold mt-1">₹{item.finalPrice}</p>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.selectedWeight, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-igo-green hover:text-white flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.selectedWeight, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-neutral-100 hover:bg-igo-green hover:text-white flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedWeight)}
                            className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>

              {/* Smart Add-ons Section */}
              {cart.length > 0 && (
                <div className="mt-8 border-t border-neutral-100 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-igo-gold" />
                    <h4 className="font-bold text-xs uppercase tracking-widest text-neutral-400">Complete Your Meal</h4>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {[
                      { name: 'Tikka Marinade', price: 49, img: 'https://images.unsplash.com/photo-1589187151032-573a91d1707d?w=400' },
                      { name: 'Farm Eggs (6pk)', price: 60, img: '/images/products/eggs.png' },
                      { name: 'Curry Powder', price: 35, img: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400' }
                    ].map((addon, i) => (
                      <div key={i} className="min-w-[120px] bg-neutral-50 rounded-2xl p-3 border border-neutral-100 flex flex-col items-center text-center">
                        <img src={addon.img} alt={addon.name} className="w-12 h-12 rounded-lg object-cover mb-2" />
                        <h5 className="text-[10px] font-bold text-neutral-dark line-clamp-1">{addon.name}</h5>
                        <p className="text-[10px] text-igo-green font-bold mb-2">₹{addon.price}</p>
                        <button className="w-full py-1.5 bg-white border border-igo-green/20 text-igo-green text-[9px] font-bold rounded-lg hover:bg-igo-green hover:text-white transition-colors">
                          Add +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-100 px-6 py-6 space-y-4 bg-white">
                <div className="flex justify-between items-center text-sm text-neutral-500">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-bold text-neutral-dark">₹{cartTotal}</span>
                </div>
                {/* Delivery Slot Picker */}
                <div className="mb-8 pt-6 border-t border-neutral-100">
                  <DeliverySlotPicker />
                </div>

                <div className="flex justify-between items-center text-sm text-neutral-500">
                  <span>Delivery</span>
                  <span className={`font-bold ${cartTotal >= freeDeliveryThreshold ? 'text-igo-green' : 'text-neutral-dark'}`}>
                    {cartTotal >= freeDeliveryThreshold ? 'FREE' : '₹49'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-4">
                  <div className="flex flex-col">
                    <span className="font-display font-bold text-lg text-neutral-dark">Total</span>
                    <div className="flex items-center gap-1.5 text-igo-green text-[10px] font-bold">
                      <Timer className="w-3 h-3" />
                      Arriving in 22-35 mins
                    </div>
                  </div>
                  <span className="font-display font-bold text-xl text-igo-green">
                    ₹{cartTotal >= freeDeliveryThreshold ? cartTotal : cartTotal + 49}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setIsFastLaneOpen(true)}
                    className="w-full bg-igo-green text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-igo-green/90 transition-all shadow-lg shadow-igo-green/20 active:scale-[0.98]"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setIsFastLaneOpen(true)}
                    className="w-full bg-neutral-dark text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-neutral-dark/90 transition-all active:scale-[0.98] text-xs"
                  >
                    <Zap className="w-4 h-4 text-igo-gold fill-igo-gold" />
                    Fast Lane Checkout
                  </button>
                </div>
                <p className="text-center text-xs text-neutral-400">Secure checkout · 100% freshness guaranteed</p>
              </div>
            )}

            {/* Fast Lane Modal */}
            <OneClickCheckout 
              isOpen={isFastLaneOpen} 
              onClose={() => setIsFastLaneOpen(false)} 
              total={cartTotal >= freeDeliveryThreshold ? cartTotal : cartTotal + 49}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
