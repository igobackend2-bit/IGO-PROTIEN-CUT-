import React, { useState } from 'react';
import { Calendar, CheckCircle2, Sparkles, ArrowRight, Dumbbell, Users, Settings2, Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { INITIAL_SUBSCRIPTION_PLANS } from '../data/mockData';
import { Product } from '../types';
import { StoreService } from '../lib/storage';
import { createSubscription } from '../lib/api/subscriptions';

// Maps each fixed plan to the customer segment it targets — surfaced as a
// badge on the plan card, and used to steer daily buyers vs. gym users vs.
// families toward the right starting point.
const SEGMENT_META: Record<string, { label: string; icon: React.ReactNode }> = {
  Fitness: { label: 'Daily Buyers & Gym Users', icon: <Dumbbell className="w-3.5 h-3.5" /> },
  Family: { label: 'Families', icon: <Users className="w-3.5 h-3.5" /> },
  Custom: { label: 'High-Volume & Custom', icon: <Settings2 className="w-3.5 h-3.5" /> }
};

interface SubscriptionsPageProps {
  products?: Product[];
  onNavigate?: (path: string) => void;
}

interface BoxLine {
  productId: string;
  quantity: number;
}

// Maps the on-screen day chip labels to the 1=Mon..7=Sun numbering the
// canonical `subscriptions.weekdays` column (and the Flutter app) use.
const DAY_TO_ISO: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({ products = [], onNavigate }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-01');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [subscribed, setSubscribed] = useState(false);
  const [boxFrequency, setBoxFrequency] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [boxLines, setBoxLines] = useState<BoxLine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const userProfile = StoreService.getUserProfile();
  const defaultAddress = userProfile.savedAddresses.find((a) => a.isDefault) ?? userProfile.savedAddresses[0];

  const selectedPlan = INITIAL_SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId);
  const isCustomBuilder = selectedPlan?.category === 'Custom';

  const addToBox = (productId: string) => {
    setBoxLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) return prev.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + 1 } : l));
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateBoxQty = (productId: string, qty: number) => {
    setBoxLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.productId !== productId);
      return prev.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l));
    });
  };

  const boxTotal = boxLines.reduce((sum, line) => {
    const p = products.find((prod) => prod.id === line.productId);
    return sum + (p ? p.weightOptions[0].price * line.quantity : 0);
  }, 0);
  const boxDiscountedTotal = Math.round(boxTotal * 0.85); // 15% off vs. buying items individually

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Real persistence only exists for the Custom box builder — its lines are
  // tied to actual product ids. The fixed Fitness/Family plans (`itemsIncluded`
  // are plain description strings, not real product ids) have no safe way to
  // map onto the `subscriptions.product_id` FK, so we don't fake success for
  // them; see the button below for the honest message shown instead.
  const handleConfirmCustomBox = async () => {
    setSubmitError(null);
    if (!StoreService.isLoggedIn()) {
      setSubmitError('Please sign in to start a subscription.');
      onNavigate?.('/login');
      return;
    }
    if (!defaultAddress) {
      setSubmitError('Add a delivery address in My Account first.');
      return;
    }
    if (boxLines.length === 0) return;

    setIsSubmitting(true);
    try {
      const weekdays = selectedDays.map((d) => DAY_TO_ISO[d]).filter(Boolean);
      const results = await Promise.all(
        boxLines.map((line) =>
          createSubscription({
            productId: line.productId,
            quantity: line.quantity,
            address: defaultAddress,
            scheduleType: 'custom',
            weekdays,
            interval: boxFrequency === 'Weekly' ? 1 : 4,
            startDate: new Date(),
            paymentMethod: 'Cash on Delivery'
          })
        )
      );
      const failed = results.find((r) => !r.ok);
      if (failed) {
        setSubmitError(failed.error ?? 'Some items could not be subscribed. Please try again.');
        return;
      }
      setSubscribed(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="bg-[#08120B] border border-black rounded-3xl p-8 text-center max-w-3xl mx-auto space-y-3 text-white shadow-2xl">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4" /> RECURRING FRESH MEAT PASS
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Protein Cuts Subscriptions</h1>
        <p className="text-xs sm:text-sm text-neutral-300">
          Automate your high-protein diet or weekly family meat supply. Enjoy guaranteed morning 6 AM slots, zero delivery fees, and up to 20% discount.
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {INITIAL_SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlanId(plan.id)}
            className={`bg-white border rounded-3xl p-6 flex flex-col justify-between space-y-6 cursor-pointer transition shadow-sm ${
              selectedPlanId === plan.id
                ? 'border-emerald-500 bg-emerald-50/60 shadow-xl'
                : 'border-neutral-200 hover:border-emerald-300'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="text-lg font-bold text-[#08120B]">{plan.title}</h3>
                {plan.badge && (
                  <span className="bg-[#0F7B3A] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0">
                    {plan.badge}
                  </span>
                )}
              </div>
              {SEGMENT_META[plan.category] && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-1.5">
                  {SEGMENT_META[plan.category].icon} {SEGMENT_META[plan.category].label}
                </span>
              )}
              <p className="text-xs text-neutral-500">{plan.tagline}</p>

              <div className="my-4 pt-4 border-t border-neutral-200">
                <div className="text-2xl font-black text-[#08120B]">
                  ₹{plan.pricePerMonth} <span className="text-xs text-neutral-500 font-normal">/ month</span>
                </div>
                <div className="text-xs text-emerald-700 font-bold">{plan.savings}</div>
              </div>

              <ul className="space-y-2 text-xs text-neutral-600">
                {plan.itemsIncluded.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs font-semibold text-neutral-500 border-t border-neutral-200 pt-3">
              Target: <strong className="text-[#08120B]">{plan.recommendedFor}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Build Your Own Box — only for the Custom / high-volume plan */}
      {isCustomBuilder && (
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 max-w-4xl mx-auto space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[#08120B] flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-600" /> Build Your Own Box
            </h3>
            <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-xl p-1">
              {(['Weekly', 'Monthly'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setBoxFrequency(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    boxFrequency === f ? 'bg-[#0F7B3A] text-white' : 'text-neutral-500 hover:text-[#08120B]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Pick exactly what you want in your recurring box. Custom boxes get an automatic 15% discount vs. buying items individually.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
            {products.slice(0, 16).map((p) => {
              const line = boxLines.find((l) => l.productId === p.id);
              return (
                <div key={p.id} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-2.5 space-y-2">
                  <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full aspect-square rounded-xl object-cover" />
                  <div className="text-[11px] font-bold text-[#08120B] line-clamp-2 leading-tight">{p.name}</div>
                  <div className="text-[10px] text-emerald-700 font-black">₹{p.weightOptions[0].price}</div>
                  {line ? (
                    <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg p-1">
                      <button onClick={() => updateBoxQty(p.id, line.quantity - 1)} className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#08120B]">{line.quantity}</span>
                      <button onClick={() => updateBoxQty(p.id, line.quantity + 1)} className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToBox(p.id)}
                      className="w-full bg-white border border-emerald-300 text-emerald-700 hover:bg-[#0F7B3A] hover:text-white font-bold py-1.5 rounded-lg text-[10px] uppercase transition"
                    >
                      + Add to Box
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {boxLines.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-[#08120B] uppercase tracking-wider">Your Box ({boxLines.reduce((a, l) => a + l.quantity, 0)} items)</div>
              {boxLines.map((line) => {
                const p = products.find((prod) => prod.id === line.productId);
                if (!p) return null;
                return (
                  <div key={line.productId} className="flex items-center justify-between text-xs">
                    <span className="text-neutral-700">{p.name} x{line.quantity}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#08120B]">₹{p.weightOptions[0].price * line.quantity}</span>
                      <button onClick={() => updateBoxQty(p.id, 0)} className="text-neutral-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                <span className="text-xs font-bold text-neutral-600">Box Total ({boxFrequency}, 15% off)</span>
                <span className="text-lg font-black text-emerald-700">
                  ₹{boxDiscountedTotal} <span className="text-xs text-neutral-400 line-through font-normal">₹{boxTotal}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customize Delivery Schedule */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-2xl mx-auto space-y-6 shadow-sm">
        <h3 className="text-base font-bold text-[#08120B] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" /> Choose Preferred Weekly Delivery Days
        </h3>

        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {days.map((day) => {
            const isSelected = selectedDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`flex-1 py-3 px-2 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F7B3A] border-emerald-500 text-white shadow-lg'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-[#08120B]'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {subscribed ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center text-xs text-emerald-700 font-bold space-y-1">
            Subscription Activated Successfully!
            <div className="text-[11px] text-neutral-600 font-normal">
              Check My Account → Subscriptions to manage it. Your first delivery is scheduled for{' '}
              {new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.
            </div>
          </div>
        ) : isCustomBuilder ? (
          <>
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl px-3 py-2">
                {submitError}
              </div>
            )}
            <button
              onClick={handleConfirmCustomBox}
              disabled={isSubmitting || boxLines.length === 0}
              className="w-full bg-[#0F7B3A] hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-900/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Starting Subscription…
                </>
              ) : (
                <>
                  Confirm & Start Subscription <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            {boxLines.length === 0 && (
              <p className="text-[11px] text-neutral-400 text-center">Add at least one item to your box above.</p>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-3 py-2.5 text-center">
              This fixed plan isn't available for instant self-checkout yet — use{' '}
              <strong>Build Your Own Box</strong> above (the Custom plan) to start a real subscription now, or reach our
              team via Support to set this plan up for you.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
