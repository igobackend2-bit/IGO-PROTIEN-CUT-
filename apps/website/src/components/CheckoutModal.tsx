import React, { useState } from 'react';
import { X, MapPin, Clock, CreditCard, ShieldCheck, ArrowRight, Smartphone, Wallet, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavedAddress, Order } from '../types';
import { StoreService } from '../lib/storage';
import { getBulkLineTotal } from '../lib/pricing';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess
}) => {
  const userProfile = StoreService.getUserProfile();
  const cart = StoreService.getCart();

  const [addresses] = useState<SavedAddress[]>(userProfile.addresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(userProfile.addresses[0]?.id || '');
  const [selectedSlot, setSelectedSlot] = useState<string>('Express 30 Mins (Chilled Insulation)');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Credit/Debit Card' | 'Net Banking' | 'IGO Wallet' | 'Cash on Delivery'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Real Razorpay checkout is used automatically once VITE_RAZORPAY_KEY_ID is set in .env.
  // Until then, payment stays simulated so the flow is always testable end-to-end.
  const razorpayKeyId = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID as string | undefined;
  const isRazorpayConfigured = !!razorpayKeyId && razorpayKeyId !== 'MY_RAZORPAY_KEY_ID';

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + getBulkLineTotal(item.selectedWeight.price, item.quantity), 0);
  const isPriorityMember = userProfile.membershipTier === 'Platinum' || userProfile.membershipTier === 'Elite';
  const deliveryFee = isPriorityMember || subtotal >= 499 || subtotal === 0 ? 0 : 39;
  const tax = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + deliveryFee + tax;

  const deliverySlots = [
    { id: 'express', label: 'Express 30 Mins (Chilled Insulation)', type: 'express' },
    { id: 'morn', label: 'Tomorrow Morning (07:00 AM - 09:00 AM)', type: 'standard' },
    { id: 'aft', label: 'Tomorrow Afternoon (12:00 PM - 02:00 PM)', type: 'standard' },
    { id: 'eve', label: 'Tomorrow Evening (06:00 PM - 08:00 PM)', type: 'standard' }
  ];

  const finalizeOrder = async (paymentStatus: 'Paid' | 'Pending') => {
    const activeAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

    // Writes to the canonical `orders` table via the customer's own Supabase
    // session, so this order appears in the admin dashboard immediately.
    const result = await StoreService.placeOrderRemote({
      customerName: userProfile.name,
      customerEmail: userProfile.email,
      customerPhone: userProfile.phone,
      shippingAddress: activeAddress,
      items: cart,
      subtotal,
      discountAmount: 0,
      deliveryFee,
      tax,
      totalAmount,
      paymentMethod,
      paymentStatus,
      status: 'Placed',
      deliverySlot: selectedSlot
    });

    if (!result.ok || !result.order) {
      // Never show a confirmation for an order that wasn't saved. If the
      // payment already succeeded, the customer needs to know so support can
      // reconcile rather than assuming the order is on its way.
      setIsPlacing(false);
      setPaymentError(
        result.error ??
          (paymentStatus === 'Paid'
            ? 'Payment succeeded but the order could not be saved. Please contact support before retrying.'
            : 'Could not place your order. Please try again.')
      );
      return;
    }

    // Clear Cart
    StoreService.saveCart([]);

    // Trigger Confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    setIsPlacing(false);
    onClose();
    onOrderSuccess(result.order);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setPaymentError(null);
    setIsPlacing(true);

    const usesGateway = paymentMethod !== 'Cash on Delivery' && paymentMethod !== 'IGO Wallet';

    if (isRazorpayConfigured && usesGateway) {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setPaymentError('Could not load payment gateway. Check your connection and try again.');
        setIsPlacing(false);
        return;
      }

      const rzp = new (window as any).Razorpay({
        key: razorpayKeyId,
        amount: totalAmount * 100, // paise
        currency: 'INR',
        name: 'IGO Protein Cuts',
        description: `Order for ${cart.length} item(s)`,
        prefill: {
          name: userProfile.name,
          email: userProfile.email,
          contact: userProfile.phone
        },
        theme: { color: '#0F7B3A' },
        handler: () => {
          // Payment succeeded — Razorpay already collected & authorized the charge.
          // finalizeOrder is async now; errors are surfaced inside it, and this
          // catch only guards against an unexpected throw leaving the button
          // stuck in its loading state.
          void finalizeOrder('Paid').catch(() => {
            setIsPlacing(false);
            setPaymentError(
              'Payment succeeded but the order could not be saved. Please contact support.'
            );
          });
        },
        modal: {
          ondismiss: () => {
            setIsPlacing(false);
            setPaymentError('Payment was cancelled. Your order was not placed.');
          }
        }
      });

      rzp.on('payment.failed', () => {
        setIsPlacing(false);
        setPaymentError('Payment failed. Please try another method or card.');
      });

      rzp.open();
      return;
    }

    // Simulated flow — used when no real payment gateway key is configured yet.
    setTimeout(() => {
      void finalizeOrder(paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid').catch(() => {
        setIsPlacing(false);
        setPaymentError('Could not place your order. Please try again.');
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-2xl w-full text-[#0A1F12] overflow-hidden relative shadow-2xl my-auto">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600 animate-pulse" />
            <h2 className="text-base font-bold text-[#0A1F12]">Express Checkout • IGO Protein Cuts</h2>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-[#0A1F12] transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Section 1: Delivery Address */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> 1. Select Delivery Address
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                    selectedAddressId === addr.id
                      ? 'bg-emerald-50 border-emerald-500 text-[#0A1F12]'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 accent-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#0A1F12] flex items-center gap-2">
                      <span>{addr.name} ({addr.type})</span>
                      {addr.isDefault && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-2 py-0.2 rounded">DEFAULT</span>}
                    </div>
                    <div className="text-[11px] text-neutral-600 mt-0.5">
                      {addr.flatNo}, {addr.street}, {addr.landmark}, {addr.city} - {addr.pincode}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Phone: {addr.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Delivery Slot */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" /> 2. Delivery Time Slot
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {deliverySlots.map((slot) => (
                <button
                  type="button"
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.label)}
                  className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                    selectedSlot === slot.label
                      ? 'bg-emerald-50 border-emerald-500 text-[#0A1F12] font-bold'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {slot.type === 'express' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                    <span>{slot.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" /> 3. Select Payment Method
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'UPI', label: 'UPI (GPay / PhonePe / Paytm)', icon: Smartphone },
                { id: 'Credit/Debit Card', label: 'Card Payment', icon: CreditCard },
                { id: 'IGO Wallet', label: `IGO Wallet (₹${userProfile.IGOWalletBalance})`, icon: Wallet },
                { id: 'Cash on Delivery', label: 'Cash / Pay on Delivery', icon: ShieldCheck }
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition cursor-pointer ${
                      paymentMethod === method.id
                        ? 'bg-emerald-50 border-emerald-500 text-[#0A1F12] font-bold'
                        : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs">{method.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'UPI' && !isRazorpayConfigured && (
              <div className="mt-3 bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                <label className="block text-xs text-neutral-600 font-semibold mb-1">Enter VPA / UPI ID</label>
                <input
                  type="text"
                  placeholder="username@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-white border border-neutral-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-[#0A1F12] focus:outline-none"
                />
              </div>
            )}

            {paymentMethod === 'Credit/Debit Card' && !isRazorpayConfigured && (
              <div className="mt-3 bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-2">
                <label className="block text-xs text-neutral-600 font-semibold mb-1">Card Details</label>
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  className="w-full bg-white border border-neutral-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-[#0A1F12] focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength={5}
                    className="w-1/2 bg-white border border-neutral-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-[#0A1F12] focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    maxLength={3}
                    className="w-1/2 bg-white border border-neutral-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-[#0A1F12] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'Net Banking' && !isRazorpayConfigured && (
              <div className="mt-3 bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                <label className="block text-xs text-neutral-600 font-semibold mb-1">Select Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-white border border-neutral-200 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-[#0A1F12] focus:outline-none"
                >
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank'].map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
            )}

            {isRazorpayConfigured && paymentMethod !== 'Cash on Delivery' && paymentMethod !== 'IGO Wallet' && (
              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-700">
                You'll securely enter your {paymentMethod.toLowerCase()} details on the next screen via Razorpay.
              </div>
            )}

            {paymentError && (
              <div className="mt-3 bg-[#0A1F12] border border-black rounded-xl p-3 text-[11px] text-white">
                {paymentError}
              </div>
            )}
          </div>

          {/* Order Summary & Pay Button */}
          <div className="pt-4 border-t border-neutral-200 bg-neutral-50 -mx-6 -mb-6 p-6">
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-neutral-600 font-semibold">Total Payable Amount</span>
              <span className="text-xl font-black text-[#0F7B3A] bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">₹{totalAmount}</span>
            </div>

            <button
              type="submit"
              disabled={isPlacing}
              className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-900/20"
            >
              {isPlacing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Securing Order & Cold Chain Booking...
                </>
              ) : (
                <>
                  Confirm & Pay ₹{totalAmount} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
