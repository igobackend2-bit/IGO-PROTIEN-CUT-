import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, Zap, Timer, Sparkles, Clock, MapPin, User, Phone, Edit3, Gift, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import DeliverySlotPicker from './DeliverySlotPicker';
import OneClickCheckout from './OneClickCheckout';
import AuthModal from './AuthModal';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const [isFastLaneOpen, setIsFastLaneOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [isGifting, setIsGifting] = React.useState(false);
  const [isEditingAddress, setIsEditingAddress] = React.useState(false);

  const handleCheckoutClick = () => {
    const user = localStorage.getItem('igo_user');
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setIsFastLaneOpen(true);
    }
  };
  
  // Load saved address
  const [deliveryAddress, setDeliveryAddress] = React.useState(() => {
    const savedUser = JSON.parse(localStorage.getItem('igo_user') || '{}');
    return savedUser.address || 'Select delivery address';
  });

  const [giftDetails, setGiftDetails] = React.useState({
    name: localStorage.getItem('igo_gift_name') || '',
    phone: localStorage.getItem('igo_gift_phone') || '',
    address: localStorage.getItem('igo_gift_address') || ''
  });

  const saveAddress = (newAddr: string) => {
    setDeliveryAddress(newAddr);
    const savedUser = JSON.parse(localStorage.getItem('igo_user') || '{}');
    localStorage.setItem('igo_user', JSON.stringify({ ...savedUser, address: newAddr }));
    setIsEditingAddress(false);
  };

  const updateGiftDetails = (key: keyof typeof giftDetails, value: string) => {
    const updated = { ...giftDetails, [key]: value };
    setGiftDetails(updated);
    localStorage.setItem(`igo_gift_${String(key)}`, value);
  };


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
                      onClick={() => {
                        setIsCartOpen(false);
                        window.location.href = '/#products';
                      }}
                      className="bg-igo-green text-white px-8 py-3 rounded-xl font-bold hover:bg-igo-green/90 transition-colors shadow-lg shadow-igo-green/20"
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

              {/* Delivery Slot Picker */}
              {cart.length > 0 && (
                <div className="mt-8 border-t border-neutral-100 pt-6 px-4 space-y-6">
                  <DeliverySlotPicker />
                  
                  {/* Advanced Address Management */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-neutral-dark text-sm uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-igo-green" />
                        Deliver To
                      </h4>
                      {!isEditingAddress && (
                        <button 
                          onClick={() => setIsEditingAddress(true)}
                          className="text-[10px] font-bold text-igo-green uppercase bg-igo-green/5 px-2 py-1 rounded-md hover:bg-igo-green/10 transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          Change
                        </button>
                      )}
                    </div>

                    <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 relative overflow-hidden group">
                      {isEditingAddress ? (
                        <div className="space-y-3">
                          <textarea
                            autoFocus
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-igo-green/20 focus:border-igo-green transition-all"
                            rows={3}
                            placeholder="Enter your full delivery address..."
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => saveAddress(deliveryAddress)}
                              className="flex-1 bg-igo-green text-white py-2 rounded-xl text-xs font-bold hover:bg-igo-green/90 transition-colors"
                            >
                              Save Address
                            </button>
                            <button 
                              onClick={() => setIsEditingAddress(false)}
                              className="px-4 py-2 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                              {deliveryAddress}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="w-2 h-2 bg-igo-green rounded-full animate-pulse" />
                              <span className="text-[10px] text-neutral-400 font-bold uppercase">Active for this order</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Gifting Section */}
                    <div className={`rounded-2xl border transition-all duration-300 ${isGifting ? 'bg-indigo-50/30 border-indigo-100 p-4' : 'bg-neutral-50 border-neutral-100 p-4'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg transition-colors ${isGifting ? 'bg-indigo-500 text-white' : 'bg-igo-gold/10 text-igo-gold'}`}>
                            <Gift className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-neutral-800">Gift this order?</p>
                            <p className="text-[10px] text-neutral-400">Surprise friends or family</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsGifting(!isGifting)}
                          className={`w-10 h-5 rounded-full transition-all relative ${isGifting ? 'bg-indigo-500' : 'bg-neutral-200'}`}
                        >
                          <motion.div 
                            animate={{ x: isGifting ? 20 : 2 }}
                            className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>

                      <AnimatePresence>
                        {isGifting && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-6 space-y-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Recipient Name</label>
                                <div className="relative">
                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                  <input 
                                    type="text"
                                    value={giftDetails.name}
                                    onChange={(e) => updateGiftDetails('name', e.target.value)}
                                    placeholder="Friend's name"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Recipient Mobile</label>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                                  <input 
                                    type="tel"
                                    value={giftDetails.phone}
                                    onChange={(e) => updateGiftDetails('phone', e.target.value)}
                                    placeholder="+91 XXXXX XXXXX"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Recipient Address</label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-300" />
                                  <textarea 
                                    value={giftDetails.address}
                                    onChange={(e) => updateGiftDetails('address', e.target.value)}
                                    placeholder="Enter complete gift address..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[80px]"
                                  />
                                </div>
                              </div>
                              
                              <div className="bg-indigo-500/10 p-3 rounded-xl flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                                  <Check className="w-4 h-4" />
                                </div>
                                <p className="text-[10px] text-indigo-700 font-medium leading-tight">
                                  We'll include a special surprise note with this order!
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
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
                    onClick={handleCheckoutClick}
                    className="w-full bg-igo-green text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-igo-green/90 transition-all shadow-lg shadow-igo-green/20 active:scale-[0.98]"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleCheckoutClick}
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

            <AuthModal 
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
