import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Sparkles, ChefHat } from 'lucide-react';
import { CartItem } from '../types';
import { StoreService } from '../lib/storage';
import { getBulkLineTotal } from '../lib/pricing';
import { useLang } from '../lib/language';
import { translateProductName } from '../lib/productNames';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { lang } = useLang();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [useWallet, setUseWallet] = useState(false);
  const userProfile = StoreService.getUserProfile();

  useEffect(() => {
    const updateCart = () => setCart(StoreService.getCart());
    updateCart();
    window.addEventListener('protein_cuts_cart_updated', updateCart);
    return () => window.removeEventListener('protein_cuts_cart_updated', updateCart);
  }, []);

  if (!isOpen) return null;

  const updateQuantity = (index: number, newQty: number) => {
    const newCart = [...cart];
    if (newQty <= 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].quantity = newQty;
    }
    setCart(newCart);
    StoreService.saveCart(newCart);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const coupons = StoreService.getCoupons();
    const match = coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase());

    // Bulk-tier discount applied per line, same as CartPage's actual charge —
    // previously this used the raw price with no discount, so the mini-cart
    // showed a higher total than what checkout actually charged for
    // quantity >= 3.
    const subtotal = cart.reduce((acc, item) => acc + getBulkLineTotal(item.selectedWeight.price, item.quantity), 0);

    if (match) {
      if (subtotal < match.minOrderValue) {
        setCouponMessage(`Minimum order value ₹${match.minOrderValue} required for this coupon.`);
        setAppliedDiscount(0);
      } else {
        const discount = match.discountType === 'flat' ? match.value : Math.round((subtotal * match.value) / 100);
        setAppliedDiscount(discount);
        setCouponMessage(`Coupon ${match.code} applied! Saved ₹${discount}`);
      }
    } else {
      setCouponMessage('Invalid Coupon Code. Try "PROTEIN100" or "IGO20"');
      setAppliedDiscount(0);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + getBulkLineTotal(item.selectedWeight.price, item.quantity), 0);
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 39;
  const walletDiscount = useWallet ? Math.min(subtotal, userProfile.IGOWalletBalance) : 0;
  const total = Math.max(0, subtotal - appliedDiscount - walletDiscount + deliveryFee);
  const freeDeliveryDeficit = 499 - subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-neutral-200 text-[#0A1F12] shadow-2xl flex flex-col justify-between">
          {/* Cart Header */}
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-[#0A1F12] tracking-tight">Your Express Cart</h2>
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((a, b) => a + b.quantity, 0)} Items
              </span>
            </div>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-[#0A1F12] transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar Progress */}
          <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 text-xs">
            {freeDeliveryDeficit > 0 ? (
              <div className="text-neutral-600">
                Add <strong className="text-emerald-700">₹{freeDeliveryDeficit}</strong> more for FREE Express Delivery!
                <div className="w-full h-1.5 bg-emerald-100 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#0F7B3A] transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / 499) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> You unlocked FREE 30-Min Express Delivery!
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length > 0 && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#0A1F12]">
                  <ChefHat className="w-3.5 h-3.5 text-emerald-600" /> Recipe Ingredients Assistant
                </div>
                <p className="text-[11px] text-neutral-500">
                  Planning Biryani or Curry? Get fresh veggies from <strong>Farmer's Factory</strong> & authentic masalas from <strong>IGO Mart</strong>.
                </p>
                <div className="flex gap-2 pt-1">
                  <a
                    href="https://farmersfactory.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-white border border-emerald-200 hover:border-emerald-400 text-emerald-700 font-bold p-2 rounded-xl text-[10px] text-center block transition"
                  >
                    Farmer's Factory ↗
                  </a>
                  <a
                    href="https://igomart.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#0F7B3A] text-white font-bold p-2 rounded-xl text-[10px] text-center block transition hover:bg-emerald-500"
                  >
                    IGO Mart ↗
                  </a>
                </div>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3 text-neutral-500">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-[#0A1F12]">Your Cart is Empty</h3>
                <p className="text-xs max-w-xs mx-auto text-neutral-500">
                  Add fresh chicken, mutton, wild seafood or eggs to start your order.
                </p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedWeight.label}-${item.cutPreference ?? ''}-${idx}`}
                  className="bg-white border border-neutral-200 rounded-2xl p-3 flex gap-3 items-center justify-between shadow-sm"
                >
                  <img
                    src={item.product.image}
                    alt={translateProductName(item.product.id, item.product.name, lang)}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#0A1F12] truncate">{translateProductName(item.product.id, item.product.name, lang)}</h4>
                    <p className="text-[11px] text-neutral-500">{item.selectedWeight.label}</p>
                    <div className="text-xs font-black text-emerald-700 mt-1">
                      ₹{getBulkLineTotal(item.selectedWeight.price, item.quantity)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:text-[#0A1F12] font-bold text-xs cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-[#0A1F12] w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:text-[#0A1F12] font-bold text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => updateQuantity(idx, 0)}
                    className="text-neutral-400 hover:text-[#0A1F12] transition p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-neutral-200 bg-white space-y-3">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Coupon (e.g. PROTEIN100)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-white border border-neutral-200 focus:border-emerald-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0A1F12] focus:outline-none uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {couponMessage && (
                <div
                  className={`text-[11px] p-2 rounded-lg border ${
                    couponMessage.includes('applied')
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-[#0A1F12] border-black text-white'
                  }`}
                >
                  {couponMessage}
                </div>
              )}

              {/* Wallet Usage Toggle */}
              {userProfile.IGOWalletBalance > 0 && (
                <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 p-2 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-[#0A1F12]">Use IGO Wallet Balance</div>
                      <div className="text-[10px] text-neutral-500">Available: ₹{userProfile.IGOWalletBalance}</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(e) => setUseWallet(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Bill Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600 pt-1 border-t border-neutral-200">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="text-[#0A1F12] font-semibold">₹{subtotal}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount</span>
                    <span>-₹{appliedDiscount}</span>
                  </div>
                )}
                {useWallet && walletDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>IGO Wallet Applied</span>
                    <span>-₹{walletDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Delivery Fee</span>
                  <span className="text-[#0A1F12]">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 text-sm font-black text-[#0A1F12]">
                  <span>Total Amount</span>
                  <span className="text-emerald-700">₹{total}</span>
                </div>
              </div>

              {/* Full Cart Page — where the delivery, payment & cooking-plan
                  checkout wizard now lives */}
              <button
                onClick={() => {
                  onClose();
                  onNavigate('/cart');
                }}
                className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-900/20"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
