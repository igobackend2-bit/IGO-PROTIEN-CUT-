import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, ShoppingBag, ArrowLeft, CheckCircle2,
  Truck, Zap, Phone, User, Home, Building2, CreditCard,
  Banknote, ChevronRight, Shield, Tag, AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { createOrder } from '../services/orderService';

declare global {
  interface Window { Razorpay: any; }
}

const DELIVERY_SLOTS = [
  { id: 'express',   label: 'Express 60–90 min',       icon: Zap,   extra: '₹49', note: 'Fastest'   },
  { id: 'morning',   label: 'Morning 7 AM – 11 AM',    icon: Truck, extra: 'Free', note: 'Tomorrow'  },
  { id: 'afternoon', label: 'Afternoon 12 PM – 4 PM',  icon: Truck, extra: 'Free', note: 'Tomorrow'  },
  { id: 'evening',   label: 'Evening 5 PM – 9 PM',     icon: Truck, extra: 'Free', note: 'Tomorrow'  },
];

const PAYMENT_METHODS = [
  { id: 'razorpay', label: 'UPI / Cards / Net Banking', icon: CreditCard, badge: 'Recommended' },
  { id: 'cod',      label: 'Cash on Delivery',          icon: Banknote,   badge: ''             },
];

const steps = ['Address', 'Slot', 'Payment'];

const Checkout = () => {
  const { cart, cartTotal, clearCart, deliverySlot, setDeliverySlot } = useCart();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep]     = useState(0);
  const [isProcessing, setIsProcessing]   = useState(false);
  const [orderSuccess, setOrderSuccess]   = useState<string | null>(null);
  const [coupon, setCoupon]               = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError]     = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [selectedSlot, setSelectedSlot]   = useState(deliverySlot || 'express');

  const [address, setAddress] = useState({
    name: '', phone: '', line1: '', line2: '',
    city: 'Coimbatore', pincode: '', type: 'home',
  });

  const deliveryCost = selectedSlot === 'express' ? (cartTotal >= 499 ? 0 : 49) : 0;
  const discount     = couponApplied ? Math.round(cartTotal * 0.1) : 0;
  const finalTotal   = cartTotal + deliveryCost - discount;

  const handleCouponApply = () => {
    if (coupon.trim().toUpperCase() === 'IGO10') {
      setCouponApplied(true); setCouponError('');
    } else {
      setCouponError('Invalid coupon code'); setCouponApplied(false);
    }
  };

  const loadRazorpay = (): Promise<boolean> => new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  // Save order + trigger email
  const saveOrder = async (orderId: string) => {
    const user = JSON.parse(localStorage.getItem('igo_user') || '{}');
    await createOrder({
      customer_name:  address.name || user.name || 'Guest',
      customer_email: user.email || '',
      customer_phone: address.phone,
      amount: finalTotal,
      items: cart.map(i => ({
        id: i.id, name: i.name, image: i.image,
        selectedWeight: i.selectedWeight,
        quantity: i.quantity, finalPrice: i.finalPrice,
      })),
      delivery_address: `${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city} - ${address.pincode}`,
      billing_address:  `${address.line1}, ${address.city}`,
      pincode:          address.pincode,
      payment_method:   paymentMethod === 'cod' ? 'COD' : 'Online',
      delivery_slot:    selectedSlot,
      delivery_date:    new Date().toISOString().split('T')[0],
    });
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const orderId = `IGO-${Date.now().toString(36).toUpperCase()}`;

    if (paymentMethod === 'cod') {
      await saveOrder(orderId);
      setIsProcessing(false);
      setOrderSuccess(orderId);
      clearCart();
      return;
    }

    const loaded = await loadRazorpay();
    if (!loaded) {
      alert('Payment gateway failed to load. Please try Cash on Delivery.');
      setIsProcessing(false);
      return;
    }

    const rzp = new window.Razorpay({
      key:         import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      amount:      finalTotal * 100,
      currency:    'INR',
      name:        'IGO Protein Cuts',
      description: `Order ${orderId}`,
      image:       '/logo.png',
      prefill:     { name: address.name, contact: address.phone },
      theme:       { color: '#2D7A3A' },
      handler: async () => {
        await saveOrder(orderId);
        setIsProcessing(false);
        setOrderSuccess(orderId);
        clearCart();
      },
      modal: { ondismiss: () => setIsProcessing(false) },
    });
    rzp.open();
    setIsProcessing(false);
  };

  // ── Order Success Screen ───────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12, delay: 0.1 }}
            className="w-24 h-24 bg-igo-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-igo-green" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-neutral-dark mb-2">Order Placed!</h1>
          <p className="text-neutral-500 mb-2">Your order is confirmed. Check your email for details.</p>
          <div className="inline-block bg-igo-green/10 text-igo-green font-mono font-bold px-4 py-2 rounded-xl mb-8 text-sm">
            {orderSuccess}
          </div>
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 mb-8 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-igo-green/10 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-igo-green" />
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Delivery to</p>
                <p className="text-sm font-medium text-neutral-dark">{address.line1}, {address.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-igo-gold/10 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-igo-gold" />
              </div>
              <div>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Slot</p>
                <p className="text-sm font-medium text-neutral-dark">
                  {DELIVERY_SLOTS.find(s => s.id === selectedSlot)?.label}
                </p>
              </div>
            </div>
          </div>
          <Link to="/" className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-igo-green text-white font-bold rounded-2xl hover:bg-igo-green/90 transition-all">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Empty Cart ─────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center px-6">
        <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" />
        <h2 className="text-xl font-bold text-neutral-dark mb-2">Your cart is empty</h2>
        <p className="text-neutral-400 mb-6">Add some fresh cuts before checking out!</p>
        <Link to="/" className="px-6 py-3 bg-igo-green text-white font-bold rounded-xl hover:bg-igo-green/90 transition-all">
          Shop Now
        </Link>
      </div>
    );
  }

  // ── Main Checkout ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-light">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-200 hover:bg-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-display font-bold text-neutral-dark">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-10 max-w-xs">
          {steps.map((step, i) => (
            <React.Fragment key={step}>
              <div
                className={`flex items-center gap-1.5 cursor-pointer ${i <= currentStep ? 'text-igo-green' : 'text-neutral-300'}`}
                onClick={() => i < currentStep && setCurrentStep(i)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  i < currentStep  ? 'bg-igo-green border-igo-green text-white'
                  : i === currentStep ? 'border-igo-green text-igo-green'
                  : 'border-neutral-200 text-neutral-300'}`}>
                  {i < currentStep ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className="text-xs font-bold hidden sm:inline">{step}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-igo-green' : 'bg-neutral-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* ── Main Panel ── */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">

              {/* Step 0: Address */}
              {currentStep === 0 && (
                <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100">
                    <h2 className="text-lg font-bold text-neutral-dark mb-6 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-igo-green" /> Delivery Address
                    </h2>
                    <div className="flex gap-3 mb-6">
                      {[{ id: 'home', label: 'Home', Icon: Home }, { id: 'work', label: 'Work', Icon: Building2 }].map(({ id, label, Icon }) => (
                        <button key={id} onClick={() => setAddress(a => ({ ...a, type: id }))}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                            address.type === id ? 'border-igo-green text-igo-green bg-igo-green/5' : 'border-neutral-200 text-neutral-400'}`}>
                          <Icon className="w-4 h-4" /> {label}
                        </button>
                      ))}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { key: 'name',    label: 'Full Name',           icon: User,   type: 'text', placeholder: 'Your full name',       full: false },
                        { key: 'phone',   label: 'Phone Number',         icon: Phone,  type: 'tel',  placeholder: '+91 98765 43210',       full: false },
                        { key: 'line1',   label: 'House / Flat / Street',icon: MapPin, type: 'text', placeholder: 'No. 12, Park Street',   full: true  },
                        { key: 'line2',   label: 'Area / Landmark',      icon: MapPin, type: 'text', placeholder: 'Near Gandhipuram',      full: false },
                        { key: 'city',    label: 'City',                 icon: MapPin, type: 'text', placeholder: 'Coimbatore',            full: false },
                        { key: 'pincode', label: 'Pincode',              icon: MapPin, type: 'text', placeholder: '641001',                full: false },
                      ].map(({ key, label, icon: Icon, type, placeholder, full }) => (
                        <div key={key} className={full ? 'sm:col-span-2' : ''}>
                          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5">{label}</label>
                          <div className="relative">
                            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                            <input type={type} placeholder={placeholder}
                              value={(address as any)[key]}
                              onChange={e => setAddress(a => ({ ...a, [key]: e.target.value }))}
                              className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-igo-green focus:bg-white focus:outline-none transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        if (!address.name || !address.phone || !address.line1 || !address.pincode) {
                          alert('Please fill all required fields'); return;
                        }
                        setCurrentStep(1);
                      }}
                      className="w-full mt-6 py-4 bg-igo-green text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-igo-green/90 transition-all shadow-lg shadow-igo-green/20 active:scale-[0.98]">
                      Continue to Delivery Slot <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Slot */}
              {currentStep === 1 && (
                <motion.div key="slot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100">
                    <h2 className="text-lg font-bold text-neutral-dark mb-6 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-igo-green" /> Choose Delivery Slot
                    </h2>
                    <div className="space-y-3">
                      {DELIVERY_SLOTS.map(({ id, label, icon: Icon, extra, note }) => (
                        <button key={id} onClick={() => { setSelectedSlot(id); setDeliverySlot(id); }}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                            selectedSlot === id ? 'border-igo-green bg-igo-green/5' : 'border-neutral-100 hover:border-neutral-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedSlot === id ? 'bg-igo-green text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className={`font-bold text-sm ${selectedSlot === id ? 'text-igo-green' : 'text-neutral-dark'}`}>{label}</p>
                              <p className="text-xs text-neutral-400">{note}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-bold ${extra === 'Free' ? 'text-igo-green' : 'text-neutral-500'}`}>{extra}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setCurrentStep(0)} className="flex-1 py-4 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-500 hover:bg-neutral-50 transition-all">Back</button>
                      <button onClick={() => setCurrentStep(2)} className="flex-1 py-4 bg-igo-green text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-igo-green/90 transition-all shadow-lg shadow-igo-green/20 active:scale-[0.98]">
                        Continue <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-100">
                    <h2 className="text-lg font-bold text-neutral-dark mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-igo-green" /> Payment Method
                    </h2>
                    <div className="space-y-3 mb-6">
                      {PAYMENT_METHODS.map(({ id, label, icon: Icon, badge }) => (
                        <button key={id} onClick={() => setPaymentMethod(id)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                            paymentMethod === id ? 'border-igo-green bg-igo-green/5' : 'border-neutral-100 hover:border-neutral-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === id ? 'bg-igo-green text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={`font-bold text-sm ${paymentMethod === id ? 'text-igo-green' : 'text-neutral-dark'}`}>{label}</span>
                          </div>
                          {badge && <span className="text-xs font-bold bg-igo-green/10 text-igo-green px-2 py-1 rounded-lg">{badge}</span>}
                        </button>
                      ))}
                    </div>

                    {/* Coupon */}
                    <div className="mb-6">
                      <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Coupon Code</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                          <input type="text" value={coupon}
                            onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(''); setCouponApplied(false); }}
                            placeholder="Try IGO10 for 10% off"
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-igo-green focus:outline-none transition-all" />
                        </div>
                        <button onClick={handleCouponApply} className="px-4 py-3 bg-neutral-dark text-white rounded-xl font-bold text-sm hover:bg-igo-green transition-all">Apply</button>
                      </div>
                      {couponApplied && <p className="text-xs text-igo-green font-bold mt-1.5 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 10% discount applied!</p>}
                      {couponError  && <p className="text-xs text-red-500 font-bold mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {couponError}</p>}
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setCurrentStep(1)} className="flex-1 py-4 border-2 border-neutral-200 rounded-2xl font-bold text-neutral-500 hover:bg-neutral-50 transition-all">Back</button>
                      <button onClick={handlePlaceOrder} disabled={isProcessing}
                        className="flex-1 py-4 bg-igo-green text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-igo-green/90 disabled:opacity-60 transition-all shadow-lg shadow-igo-green/20 active:scale-[0.98]">
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                            Processing...
                          </span>
                        ) : (
                          <>Place Order &#8377;{finalTotal} <ChevronRight className="w-5 h-5" /></>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4 text-neutral-400">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-medium">Secured by Razorpay — 256-bit SSL</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Order Summary ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-neutral-100 sticky top-24">
              <h3 className="font-bold text-neutral-dark mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-igo-green" />
                Order Summary
                <span className="ml-auto text-xs text-neutral-400">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
              </h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.image || '/images/products/chicken-breast.png'} alt={item.name} loading="lazy"
                      className="w-12 h-12 rounded-xl object-cover bg-neutral-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-neutral-dark truncate">{item.name}</p>
                      <p className="text-xs text-neutral-400">{item.selectedWeight} &times; {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-neutral-dark">&#8377;{item.finalPrice * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-medium">&#8377;{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Delivery</span>
                  <span className={deliveryCost === 0 ? 'text-igo-green font-bold' : 'font-medium'}>
                    {deliveryCost === 0 ? 'FREE' : `&#8377;${deliveryCost}`}
                  </span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm text-igo-green">
                    <span className="font-bold">Coupon (IGO10)</span>
                    <span className="font-bold">&#8722;&#8377;{discount}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-neutral-100">
                  <span>Total</span>
                  <span className="text-igo-green">&#8377;{finalTotal}</span>
                </div>
              </div>
            </div>
            {cartTotal < 499 && (
              <div className="bg-igo-green/5 border border-igo-green/20 rounded-2xl p-4 text-sm text-igo-green font-medium">
                Add &#8377;{499 - cartTotal} more for free delivery!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
