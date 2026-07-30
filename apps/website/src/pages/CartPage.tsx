import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Tag,
  Clock,
  MapPin,
  Sparkles,
  Wallet,
  Utensils,
  ChefHat,
  ExternalLink,
  Store,
  CheckCircle2,
  Flame,
  Soup,
  Zap,
  Sunrise,
  Sun,
  Moon,
  Leaf,
  Gift,
  X,
  Check,
  Smartphone,
  CreditCard,
  BookOpen,
  Copy,
  Truck,
  PartyPopper
} from 'lucide-react';
import { CartItem, Product, ProductWeightOption, CookingType, RequiredIngredient, Order, SavedAddress } from '../types';
import { StoreService } from '../lib/storage';
import { COOKING_RECIPE_MAP } from '../data/cookingIngredientsData';
import { INITIAL_RECIPES } from '../data/mockData';
import { PartnerRedirectModal } from '../components/PartnerRedirectModal';
import { getActiveBulkTier, getBulkLineTotal } from '../lib/pricing';

interface CartPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
  onNavigate: (path: string) => void;
  onTrackOrder?: (orderId: string) => void;
}

type CheckoutStep = 1 | 2 | 3 | 4;

const STEP_LABELS: { id: CheckoutStep; label: string }[] = [
  { id: 1, label: 'Your Cart' },
  { id: 2, label: 'Delivery & Payment' },
  { id: 3, label: 'Cooking Plan' },
  { id: 4, label: 'Confirmed' }
];

export const CartPage: React.FC<CartPageProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onNavigate,
  onTrackOrder
}) => {
  const [cart, setCart] = useState<CartItem[]>(() => StoreService.getCart());
  const [giftNote, setGiftNote] = useState(() => StoreService.getGiftNote());
  const [userProfile, setUserProfile] = useState(() => StoreService.getUserProfile());

  // Wizard state
  const [step, setStep] = useState<CheckoutStep>(1);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copiedOrderNum, setCopiedOrderNum] = useState(false);

  // Step 2 — Delivery & Payment
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCouponName, setAppliedCouponName] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState('30-Min Express');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('UPI');
  const [isPlacing, setIsPlacing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Step 3 — Cooking Plan
  const [activeGlobalCookingType, setActiveGlobalCookingType] = useState<CookingType>('Biryani');
  const [viewingRecipeFor, setViewingRecipeFor] = useState<string | null>(null);

  // Partner Redirect Modal state
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [targetRedirectStore, setTargetRedirectStore] = useState<"Farmer's Factory" | 'IGO Mart'>("Farmer's Factory");
  const [activeIngredientsList, setActiveIngredientsList] = useState<RequiredIngredient[]>([]);

  useEffect(() => {
    const updateCart = () => {
      const currentCart = StoreService.getCart();
      setCart(currentCart);
      setUserProfile(StoreService.getUserProfile());
      setGiftNote(StoreService.getGiftNote());

      if (currentCart.length > 0 && currentCart[0].cookingType) {
        setActiveGlobalCookingType(currentCart[0].cookingType);
      }
    };
    updateCart();
    window.addEventListener('protein_cuts_cart_updated', updateCart);
    window.addEventListener('protein_cuts_user_updated', updateCart);
    return () => {
      window.removeEventListener('protein_cuts_cart_updated', updateCart);
      window.removeEventListener('protein_cuts_user_updated', updateCart);
    };
  }, []);

  useEffect(() => {
    if (!selectedAddressId && userProfile.addresses && userProfile.addresses.length > 0) {
      setSelectedAddressId(userProfile.addresses[0].id);
    }
  }, [userProfile, selectedAddressId]);

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

  const updateItemCookingType = (index: number, type: CookingType) => {
    const newCart = [...cart];
    newCart[index].cookingType = type;
    setCart(newCart);
    StoreService.saveCart(newCart);
    setActiveGlobalCookingType(type);
  };

  const handleClearCart = () => {
    setCart([]);
    StoreService.saveCart([]);
    StoreService.clearGiftNote();
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const targetCode = (codeToApply || couponCode).trim().toUpperCase();
    if (!targetCode) return;

    const coupons = StoreService.getCoupons();
    const match = coupons.find((c) => c.code.toUpperCase() === targetCode);
    const subtotalForCoupon = cart.reduce((acc, item) => acc + item.selectedWeight.price * item.quantity, 0);

    if (match) {
      if (subtotalForCoupon < match.minOrderValue) {
        setCouponMessage(`Minimum order value ₹${match.minOrderValue} required for coupon ${match.code}.`);
        setAppliedDiscount(0);
        setAppliedCouponName(null);
      } else {
        const discount = match.discountType === 'flat' ? match.value : Math.round((subtotalForCoupon * match.value) / 100);
        setAppliedDiscount(discount);
        setAppliedCouponName(match.code);
        setCouponMessage(`Coupon ${match.code} applied! Saved ₹${discount}`);
        setCouponCode(match.code);
      }
    } else {
      setCouponMessage('Invalid Coupon Code. Try "PROTEIN100" or "IGO20"');
      setAppliedDiscount(0);
      setAppliedCouponName(null);
    }
  };

  const openPartnerModal = (storeName: "Farmer's Factory" | 'IGO Mart', items: RequiredIngredient[]) => {
    setTargetRedirectStore(storeName);
    setActiveIngredientsList(items);
    setRedirectModalOpen(true);
  };

  // Cost calculations — bulk/wholesale tier discount is applied per line item
  // based on quantity, on top of the catalog price.
  const subtotal = cart.reduce((acc, item) => acc + getBulkLineTotal(item.selectedWeight.price, item.quantity), 0);
  const bulkDiscountTotal = cart.reduce(
    (acc, item) => acc + (item.selectedWeight.price * item.quantity - getBulkLineTotal(item.selectedWeight.price, item.quantity)),
    0
  );
  const totalOriginalPrice = cart.reduce(
    (acc, item) => acc + (item.selectedWeight.originalPrice || item.selectedWeight.price * 1.2) * item.quantity,
    0
  );
  const catalogSavings = Math.max(0, Math.round(totalOriginalPrice - subtotal));

  const isPriorityMember = userProfile.membershipTier === 'Platinum' || userProfile.membershipTier === 'Elite';
  const deliveryFee = isPriorityMember || subtotal >= 499 || subtotal === 0 ? 0 : 39;
  const walletDiscount = useWallet ? Math.min(subtotal, userProfile.IGOWalletBalance || 250) : 0;
  const tax = Math.round(subtotal * 0.05);
  const grandTotal = Math.max(0, subtotal - appliedDiscount - walletDiscount + deliveryFee + tax);
  const totalSavings = catalogSavings + appliedDiscount + walletDiscount + (deliveryFee === 0 && subtotal > 0 && !isPriorityMember ? 39 : 0);
  const freeDeliveryDeficit = 499 - subtotal;

  const availableCoupons = StoreService.getCoupons();
  const recommendedCuts = products.filter((p) => !cart.some((ci) => ci.product.id === p.id)).slice(0, 4);

  const activeRecipe = COOKING_RECIPE_MAP[activeGlobalCookingType] || COOKING_RECIPE_MAP['Biryani'];

  const cookingOptions: { type: CookingType; icon: React.ReactNode; label: string }[] = [
    { type: 'Biryani', icon: <Flame className="w-4 h-4 text-emerald-600" />, label: 'Biryani (Dum / Hyd)' },
    { type: 'Curry / Gravy', icon: <Soup className="w-4 h-4 text-emerald-600" />, label: 'Curry / Gravy' },
    { type: 'Fry / Roast', icon: <Utensils className="w-4 h-4 text-emerald-600" />, label: 'Dry Fry / Sukka' },
    { type: 'Kebab / Tandoori', icon: <ChefHat className="w-4 h-4 text-emerald-600" />, label: 'Kebab / Tikka' },
    { type: 'Soup / Broth', icon: <Soup className="w-4 h-4 text-emerald-600" />, label: 'Healthy Soup' },
    { type: 'Salad / Meal Prep', icon: <Utensils className="w-4 h-4 text-emerald-600" />, label: 'Meal Prep' }
  ];

  const deliverySlots = [
    { id: 'express', label: '30-Min Express', sub: 'Instant Dispatch', Icon: Zap },
    { id: 'morn', label: 'Morning', sub: '07:00 - 09:00 AM', Icon: Sunrise },
    { id: 'aft', label: 'Afternoon', sub: '12:00 - 02:00 PM', Icon: Sun },
    { id: 'eve', label: 'Evening', sub: '05:00 - 07:00 PM', Icon: Moon }
  ];

  const addresses: SavedAddress[] = userProfile.addresses || [];
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  // Recipes that genuinely exist for items in the cart, matched by category
  // — only shows a "View Recipe" link where a real recipe is available,
  // rather than guessing or linking somewhere broken.
  const recipeForCategory = (category: string) => INITIAL_RECIPES.find((r) => r.category === category);

  const goToStep = (target: CheckoutStep) => {
    if (target <= step || target === step + 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(target);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return;
    setPaymentError(null);
    setIsPlacing(true);

    // Writes to the canonical `orders` table via the customer's own session,
    // so the order lands in the admin dashboard immediately. Unlike the old
    // fire-and-forget path, a failure here is surfaced instead of showing a
    // confirmation screen for an order that was never saved.
    const result = await StoreService.placeOrderRemote(
      {
        customerName: userProfile.name,
        customerEmail: userProfile.email,
        customerPhone: userProfile.phone,
        shippingAddress: selectedAddress,
        items: cart,
        subtotal,
        discountAmount: appliedDiscount + walletDiscount,
        deliveryFee,
        tax,
        totalAmount: grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
        status: 'Placed',
        deliverySlot: selectedSlot
      },
      appliedCouponName
    );

    setIsPlacing(false);

    if (!result.ok || !result.order) {
      setPaymentError(result.error ?? 'Could not place your order. Please try again.');
      return;
    }

    StoreService.saveCart([]);
    setPlacedOrder(result.order);
    setStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyOrderNumber = () => {
    if (!placedOrder) return;
    navigator.clipboard.writeText(placedOrder.orderNumber);
    setCopiedOrderNum(true);
    setTimeout(() => setCopiedOrderNum(false), 2000);
  };

  // ---------------------------------------------------------------------
  // STEP 4 — Order Confirmation (takes priority over everything else, even
  // though the cart itself has already been cleared at this point)
  // ---------------------------------------------------------------------
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-white text-[#08120B] pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
            <PartyPopper className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-[#08120B]">Order Placed Successfully!</h1>
            <p className="text-sm text-neutral-500">
              Your cold-chain order is confirmed and being prepared by our master butchers.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex items-center justify-between gap-4 max-w-md mx-auto">
            <div className="text-left">
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Your Order Number</div>
              <div className="text-2xl font-black text-[#08120B] font-mono tracking-wider">{placedOrder.orderNumber}</div>
            </div>
            <button
              onClick={handleCopyOrderNumber}
              className="p-3 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer shrink-0"
              title="Copy order number"
            >
              {copiedOrderNum ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-6 text-left space-y-3 shadow-sm">
            <h3 className="font-bold text-[#08120B] text-sm border-b border-neutral-200 pb-3">Order Summary</h3>
            {placedOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-neutral-600">
                  {item.product.name} <span className="text-neutral-400">({item.selectedWeight.label} × {item.quantity})</span>
                </span>
                <span className="font-bold text-[#08120B]">₹{item.selectedWeight.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-black text-[#08120B]">Total Paid</span>
              <span className="text-xl font-black text-emerald-700">₹{placedOrder.totalAmount}</span>
            </div>
            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 pt-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" /> Delivery slot: {placedOrder.deliverySlot}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onTrackOrder && onTrackOrder(placedOrder.id)}
              className="w-full sm:w-auto bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" /> Track This Order
            </button>
            <button
              onClick={() => onNavigate('/account')}
              className="w-full sm:w-auto bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer"
            >
              View in My Orders
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 pt-1">
            This order is now saved to your account and will always be visible under My Orders in your Profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#08120B] pb-20">
      {/* Top Header Breadcrumb */}
      <div className="bg-emerald-50 border-b border-emerald-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => onNavigate('/search')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 mb-2 cursor-pointer transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#08120B] tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-7 h-7 text-[#0F7B3A]" />
              Your Express Cold-Chain Cart
            </h1>
            <p className="text-xs text-neutral-600 mt-1">
              0-4°C Vacuum-Chilled Packing • Antibiotic-Free Fresh Protein • 30-Min Express Dispatch
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-xs font-bold text-neutral-600 hover:text-[#08120B] bg-white border border-neutral-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-sm w-fit"
            >
              <Trash2 className="w-4 h-4" /> Clear Cart
            </button>
          )}
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-6 shadow-sm my-12">
            <div className="w-24 h-24 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#08120B]">Your Cart is Currently Empty</h2>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Explore farm-fresh, 100% antibiotic-free chicken cuts, tender mutton, wild-caught seafood, and fresh farm eggs.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('/category/chicken')}
                className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-900/20 cursor-pointer"
              >
                Shop Fresh Chicken
              </button>
              <button
                onClick={() => onNavigate('/offers')}
                className="bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                View Hot Offers
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
            {STEP_LABELS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => goToStep(s.id)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border-2 transition ${
                      step === s.id
                        ? 'bg-[#0F7B3A] border-[#0F7B3A] text-white shadow-lg'
                        : step > s.id
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                        : 'bg-white border-neutral-200 text-neutral-400'
                    }`}
                  >
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                  <span
                    className={`text-[10px] font-bold text-center whitespace-nowrap ${
                      step === s.id ? 'text-[#08120B]' : 'text-neutral-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
                {idx < STEP_LABELS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full ${step > s.id ? 'bg-emerald-400' : 'bg-neutral-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Gift Note Banner */}
          {giftNote && step === 1 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start justify-between gap-3 mb-6">
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#08120B]">Gift note for {giftNote.recipientName}</div>
                  <p className="text-xs text-neutral-600 mt-1 italic">"{giftNote.message}"</p>
                </div>
              </div>
              <button
                onClick={() => StoreService.clearGiftNote()}
                className="text-neutral-400 hover:text-[#08120B] shrink-0 cursor-pointer"
                title="Remove gift note"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* Left Column: step content */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
              {/* ============ STEP 1: PRODUCT DETAILS, PRICE & TOTAL ============ */}
              {step === 1 && (
                <>
                  <div className="bg-white border border-neutral-200 rounded-2xl p-4 text-xs shadow-sm">
                    {isPriorityMember ? (
                      <div className="flex items-center gap-2 text-emerald-700 font-bold">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                        <span>{userProfile.membershipTier} Member Perk: FREE Express Delivery on every order, no minimum!</span>
                      </div>
                    ) : freeDeliveryDeficit > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-neutral-600 font-semibold">
                          <span>
                            Add <strong className="text-emerald-700 font-black">₹{freeDeliveryDeficit}</strong> more to get FREE Express Delivery!
                          </span>
                          <span className="text-emerald-700 font-bold">₹{subtotal} / ₹499</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-[#0F7B3A] transition-all duration-300"
                            style={{ width: `${Math.min(100, (subtotal / 499) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-700 font-bold">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>You unlocked FREE 30-Min Express Cold-Chain Delivery!</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                      <h3 className="font-bold text-[#08120B] text-sm">Itemized Cart ({cart.reduce((a, b) => a + b.quantity, 0)} Items)</h3>
                      <span className="text-xs text-neutral-500">0-4°C Chilled Sealed</span>
                    </div>

                    <div className="divide-y divide-neutral-100 p-4 space-y-4">
                      {cart.map((item, idx) => {
                        const originalUnit = item.selectedWeight.originalPrice || Math.round(item.selectedWeight.price * 1.2);
                        const itemSavings = (originalUnit - item.selectedWeight.price) * item.quantity;

                        return (
                          <div key={`${item.product.id}-${item.selectedWeight.label}`} className="pt-4 first:pt-0">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <button onClick={() => onSelectProduct(item.product)} className="cursor-pointer shrink-0">
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    referrerPolicy="no-referrer"
                                    className="w-24 h-24 rounded-2xl object-cover border border-neutral-200"
                                  />
                                </button>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    {item.product.category} • {item.product.boneType}
                                  </span>
                                  <h4
                                    onClick={() => onSelectProduct(item.product)}
                                    className="font-bold text-[#08120B] text-sm cursor-pointer hover:text-emerald-700 transition"
                                  >
                                    {item.product.name}
                                  </h4>
                                  <p className="text-xs text-neutral-600">
                                    Pack Option: <strong className="text-[#08120B]">{item.selectedWeight.label}</strong> ({item.selectedWeight.servings || '2-3 Persons'})
                                  </p>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="font-black text-emerald-700">₹{item.selectedWeight.price}</span>
                                    <span className="text-neutral-400 line-through">₹{originalUnit}</span>
                                    {itemSavings > 0 && (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                        Save ₹{itemSavings}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 border-neutral-100 pt-2 sm:pt-0">
                                <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl p-1.5">
                                  <button
                                    onClick={() => updateQuantity(idx, item.quantity - 1)}
                                    className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm cursor-pointer transition"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="font-mono font-black text-[#08120B] text-sm w-6 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(idx, item.quantity + 1)}
                                    className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm cursor-pointer transition"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="text-right">
                                  <div className="text-sm font-black text-emerald-700">
                                    ₹{getBulkLineTotal(item.selectedWeight.price, item.quantity)}
                                  </div>
                                  {getActiveBulkTier(item.quantity).discountPct > 0 && (
                                    <div className="text-[9px] font-bold text-emerald-600 uppercase">
                                      Bulk -{getActiveBulkTier(item.quantity).discountPct}%
                                    </div>
                                  )}
                                  <button
                                    onClick={() => updateQuantity(idx, 0)}
                                    className="text-[10px] text-neutral-500 hover:text-[#08120B] font-semibold flex items-center gap-1 justify-end mt-1 cursor-pointer transition"
                                  >
                                    <Trash2 className="w-3 h-3" /> Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {recommendedCuts.length > 0 && (
                    <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
                      <div>
                        <h3 className="font-bold text-[#08120B] text-base flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600" /> Frequently Bought Together
                        </h3>
                        <p className="text-xs text-neutral-500">Complete your kitchen order with fresh protein additions.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recommendedCuts.map((p) => (
                          <div key={p.id} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-[#08120B] truncate">{p.name}</h4>
                              <div className="text-xs text-emerald-700 font-bold mt-0.5">₹{p.basePrice}</div>
                            </div>
                            <button
                              onClick={() => onAddToCart(p, p.weightOptions[0], 1)}
                              className="bg-emerald-50 hover:bg-[#0F7B3A] text-emerald-700 hover:text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer shrink-0 transition"
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ============ STEP 2: DELIVERY TIMING, PROMO CODE & PAYMENT ============ */}
              {step === 2 && (
                <>
                  <div className="bg-white border border-neutral-200 rounded-3xl p-5 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-[#08120B] text-sm border-b border-neutral-200 pb-3">
                      <MapPin className="w-4 h-4 text-emerald-600" /> Deliver To
                    </div>
                    {addresses.length === 0 ? (
                      <div className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-center">
                        No saved address found.{' '}
                        <button onClick={() => onNavigate('/account')} className="text-emerald-700 font-bold underline cursor-pointer">
                          Add one in your Profile
                        </button>{' '}
                        to continue.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-3 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                              selectedAddressId === addr.id
                                ? 'bg-emerald-50 border-emerald-500 text-[#08120B]'
                                : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#08120B]'
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
                              <div className="text-xs font-bold text-[#08120B] flex items-center gap-2">
                                <span>{addr.name} ({addr.type})</span>
                                {addr.isDefault && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] px-2 py-0.5 rounded">DEFAULT</span>}
                              </div>
                              <div className="text-[11px] text-neutral-600 mt-0.5">
                                {addr.flatNo}, {addr.street}, {addr.landmark}, {addr.city} - {addr.pincode}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-3xl p-5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <div className="flex items-center gap-2 font-bold text-[#08120B] text-sm">
                        <Clock className="w-4 h-4 text-emerald-600" /> Select Delivery Time Slot
                      </div>
                      <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Cold Chain Guaranteed
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {deliverySlots.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSlot(s.label === '30-Min Express' ? '30-Min Express' : s.sub)}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                            selectedSlot === (s.label === '30-Min Express' ? '30-Min Express' : s.sub)
                              ? 'bg-[#0F7B3A] border-emerald-400 text-white shadow-lg'
                              : 'bg-white border-neutral-200 text-neutral-600 hover:border-emerald-300'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <s.Icon className="w-3.5 h-3.5" /> {s.label}
                          </div>
                          <div
                            className={`text-[10px] mt-0.5 ${
                              selectedSlot === (s.label === '30-Min Express' ? '30-Min Express' : s.sub) ? 'text-emerald-100' : 'text-neutral-400'
                            }`}
                          >
                            {s.sub}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-[#08120B] text-sm">
                      <Tag className="w-4 h-4 text-emerald-600" /> Apply Promo Code / Coupon
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter Code (e.g. PROTEIN100)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-white border border-neutral-200 focus:border-emerald-500 text-[#08120B] font-bold text-xs px-3.5 py-2.5 rounded-xl focus:outline-none uppercase placeholder:normal-case placeholder:font-normal placeholder:text-neutral-400"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        className="bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider cursor-pointer transition"
                      >
                        Apply
                      </button>
                    </div>
                    {couponMessage && (
                      <div
                        className={`text-xs p-3 rounded-xl border font-semibold ${
                          appliedDiscount > 0
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-[#08120B] border-black text-white'
                        }`}
                      >
                        {couponMessage}
                      </div>
                    )}
                    <div className="space-y-2 pt-2 border-t border-neutral-200">
                      <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Available Coupons</span>
                      <div className="space-y-2">
                        {availableCoupons.map((c) => (
                          <div
                            key={c.code}
                            onClick={() => handleApplyCoupon(c.code)}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                              appliedCouponName === c.code
                                ? 'bg-emerald-50 border-emerald-400 text-[#08120B]'
                                : 'bg-white border-neutral-200 text-neutral-600 hover:border-emerald-300'
                            }`}
                          >
                            <div>
                              <span className="font-bold text-emerald-700 uppercase">{c.code}</span>
                              <p className="text-[10px] text-neutral-500">{c.description}</p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              {appliedCouponName === c.code ? 'Applied' : 'Tap to Apply'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-3xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-[#08120B] text-sm">
                      <CreditCard className="w-4 h-4 text-emerald-600" /> Select Payment Method
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          { id: 'UPI', label: 'UPI', icon: Smartphone },
                          { id: 'Credit/Debit Card', label: 'Card', icon: CreditCard },
                          { id: 'IGO Wallet', label: `Wallet (₹${userProfile.IGOWalletBalance || 0})`, icon: Wallet },
                          { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: ShieldCheck }
                        ] as { id: Order['paymentMethod']; label: string; icon: React.ElementType }[]
                      ).map((method) => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition cursor-pointer ${
                              paymentMethod === method.id
                                ? 'bg-emerald-50 border-emerald-500 text-[#08120B] font-bold'
                                : 'bg-white border-neutral-200 text-neutral-500 hover:text-[#08120B]'
                            }`}
                          >
                            <Icon className="w-5 h-5 text-emerald-600" />
                            <span className="text-xs">{method.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-neutral-200">
                      <input
                        type="checkbox"
                        checked={useWallet}
                        onChange={(e) => setUseWallet(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-[#0F7B3A] focus:ring-emerald-500 bg-white cursor-pointer"
                      />
                      <span className="text-xs text-neutral-600 font-medium">
                        Also redeem up to ₹{userProfile.IGOWalletBalance || 250} IGO Wallet credit on this order
                      </span>
                    </label>

                    {paymentError && (
                      <div className="bg-[#08120B] border border-black rounded-xl p-3 text-[11px] text-white">{paymentError}</div>
                    )}
                  </div>
                </>
              )}

              {/* ============ STEP 3: WHAT ARE YOU COOKING? ============ */}
              {step === 3 && (
                <>
                  <div className="bg-white border border-emerald-200 rounded-3xl p-6 space-y-5 shadow-sm">
                    <div>
                      <h3 className="text-lg font-black text-[#08120B] flex items-center gap-2">
                        <ChefHat className="w-5 h-5 text-[#0F7B3A]" /> What are you planning to cook?
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Pick a cooking style and we'll match fresh vegetables and masalas to go with your order.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-neutral-50 p-1 rounded-2xl border border-neutral-200 w-fit flex-wrap">
                      {(['Biryani', 'Curry / Gravy', 'Fry / Roast', 'Kebab / Tandoori'] as CookingType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setActiveGlobalCookingType(type);
                            if (cart.length > 0) updateItemCookingType(0, type);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            activeGlobalCookingType === type
                              ? 'bg-[#0F7B3A] text-white shadow'
                              : 'text-neutral-500 hover:text-[#08120B]'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    {/* Per cart item: cooking style + recipe link */}
                    <div className="space-y-2">
                      {cart.map((item, idx) => {
                        const itemCookingType = item.cookingType || activeGlobalCookingType;
                        const matchedRecipe = recipeForCategory(item.product.category);
                        return (
                          <div key={`${item.product.id}-${idx}`} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={item.product.image} alt={item.product.name} className="w-11 h-11 rounded-xl object-cover shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#08120B] truncate">{item.product.name}</div>
                                <div className="text-[10px] text-neutral-500">Cooking as: <strong className="text-emerald-700">{itemCookingType}</strong></div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <select
                                value={itemCookingType}
                                onChange={(e) => updateItemCookingType(idx, e.target.value as CookingType)}
                                className="text-[11px] font-semibold border border-neutral-200 rounded-lg px-2 py-1.5 bg-white text-neutral-600 focus:outline-none focus:border-emerald-400 cursor-pointer"
                              >
                                {cookingOptions.map((opt) => (
                                  <option key={opt.type} value={opt.type}>{opt.label}</option>
                                ))}
                              </select>
                              {matchedRecipe && (
                                <button
                                  onClick={() => setViewingRecipeFor(matchedRecipe.id)}
                                  className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-emerald-100 transition"
                                >
                                  <BookOpen className="w-3.5 h-3.5" /> Recipe
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 2 CATEGORIES: VEGETABLES (FARMER'S FACTORY) vs MASALAS (IGO MART) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                            <div className="flex items-center gap-2 font-black text-[#08120B] text-sm">
                              <Leaf className="w-4 h-4 text-emerald-600" /> Fresh Vegetables & Herbs
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              Farmer's Factory Partner
                            </span>
                          </div>
                          <div className="space-y-2">
                            {activeRecipe.vegetables.map((v) => (
                              <div key={v.id} className="bg-white border border-neutral-200 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2.5">
                                  <img src={v.image} alt={v.name} className="w-9 h-9 rounded-lg object-cover border border-neutral-200" />
                                  <div>
                                    <div className="font-bold text-[#08120B]">{v.name}</div>
                                    <div className="text-[10px] text-neutral-500">{v.quantity}</div>
                                  </div>
                                </div>
                                <div className="text-xs font-black text-emerald-700">₹{v.estimatedPrice}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => openPartnerModal("Farmer's Factory", activeRecipe.vegetables)}
                          className="w-full bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-sm mt-2"
                        >
                          <Store className="w-4 h-4 text-emerald-600" />
                          Order Vegetables on Farmer's Factory <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                            <div className="flex items-center gap-2 font-black text-[#08120B] text-sm">
                              <Flame className="w-4 h-4 text-emerald-600" /> Masalas, Spices & Groceries
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              IGO Mart Partner
                            </span>
                          </div>
                          <div className="space-y-2">
                            {activeRecipe.masalasAndSpices.map((m) => (
                              <div key={m.id} className="bg-white border border-neutral-200 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2.5">
                                  <img src={m.image} alt={m.name} className="w-9 h-9 rounded-lg object-cover border border-neutral-200" />
                                  <div>
                                    <div className="font-bold text-[#08120B]">{m.name}</div>
                                    <div className="text-[10px] text-neutral-500">{m.quantity}</div>
                                  </div>
                                </div>
                                <div className="text-xs font-black text-emerald-700">₹{m.estimatedPrice}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => openPartnerModal('IGO Mart', activeRecipe.masalasAndSpices)}
                          className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md mt-2"
                        >
                          <Store className="w-4 h-4" />
                          Order Spices & Groceries on IGO Mart <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: sticky running summary + step navigation */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="font-bold text-[#08120B] text-base border-b border-neutral-200 pb-3">Order Summary</h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Items Total</span>
                    <span className="font-bold text-[#08120B]">₹{subtotal}</span>
                  </div>

                  {bulkDiscountTotal > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Bulk / Wholesale Discount</span>
                      <span>-₹{bulkDiscountTotal}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-600">
                    <span>0-4°C Vacuum Gel Pack Packing</span>
                    <span className="font-bold text-emerald-700 uppercase text-[10px]">FREE</span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Express Delivery Fee</span>
                    {deliveryFee === 0 ? (
                      <span className="font-bold text-emerald-700 uppercase text-[10px]">FREE</span>
                    ) : (
                      <span className="font-bold text-[#08120B]">₹{deliveryFee}</span>
                    )}
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Taxes & GST</span>
                    <span className="font-bold text-[#08120B]">₹{tax}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Promo Coupon ({appliedCouponName})</span>
                      <span>-₹{appliedDiscount}</span>
                    </div>
                  )}

                  {walletDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>IGO Wallet Points</span>
                      <span>-₹{walletDiscount}</span>
                    </div>
                  )}

                  {totalSavings > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center text-xs font-bold text-emerald-700">
                      Total Savings on this order: ₹{totalSavings}
                    </div>
                  )}

                  <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                    <div>
                      <div className="text-sm font-black text-[#08120B]">Grand Payable Total</div>
                      <div className="text-[10px] text-neutral-500">Includes all applicable Taxes & GST</div>
                    </div>
                    <div className="text-2xl font-black text-emerald-700">₹{grandTotal}</div>
                  </div>
                </div>

                {/* Step navigation buttons */}
                <div className="flex items-center gap-3 pt-2">
                  {step > 1 && (
                    <button
                      onClick={() => goToStep((step - 1) as CheckoutStep)}
                      className="px-4 py-3.5 rounded-2xl border border-neutral-200 text-neutral-600 hover:text-[#08120B] hover:border-neutral-300 transition cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}

                  {step === 1 && (
                    <button
                      onClick={() => goToStep(2)}
                      className="flex-1 bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Continue to Delivery & Payment <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {step === 2 && (
                    <button
                      onClick={() => selectedAddress && goToStep(3)}
                      disabled={!selectedAddress}
                      className="flex-1 bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue to Cooking Plan <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {step === 3 && (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacing}
                      className="flex-1 bg-[#0F7B3A] hover:bg-emerald-500 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      {isPlacing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>Place Order — ₹{grandTotal} <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-neutral-500 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Satisfaction Guarantee • Antibiotic-Free Fresh Protein
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Preview Modal */}
      {viewingRecipeFor && (() => {
        const recipe = INITIAL_RECIPES.find((r) => r.id === viewingRecipeFor);
        if (!recipe) return null;
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-neutral-200 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto custom-scrollbar text-[#08120B] relative shadow-2xl">
              <button
                onClick={() => setViewingRecipeFor(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-[#08120B] bg-white rounded-full p-1 cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <img src={recipe.image} alt={recipe.title} referrerPolicy="no-referrer" className="w-full h-44 object-cover rounded-t-3xl" />
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-[#08120B]">{recipe.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                    <span>Difficulty: <strong className="text-[#08120B]">{recipe.difficulty}</strong></span>
                    <span>Protein: <strong className="text-emerald-700">{recipe.protein}</strong></span>
                    <span>Prep + Cook: <strong className="text-[#08120B]">{recipe.prepTime} + {recipe.cookTime}</strong></span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Ingredients</h3>
                  <ul className="space-y-1.5 text-xs text-neutral-600">
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> {ing}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Method</h3>
                  <ol className="space-y-2 text-xs text-neutral-600 list-decimal list-inside">
                    {recipe.steps.map((st, idx) => (
                      <li key={idx}>{st}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Partner Redirect Modal for Farmer's Factory & IGO Mart */}
      <PartnerRedirectModal
        isOpen={redirectModalOpen}
        onClose={() => setRedirectModalOpen(false)}
        targetStore={targetRedirectStore}
        ingredients={activeIngredientsList}
        dishName={activeRecipe.dishName}
      />
    </div>
  );
};
