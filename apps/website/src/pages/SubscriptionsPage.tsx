import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Sparkles, ArrowRight, Dumbbell, Users, Settings2, Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { INITIAL_SUBSCRIPTION_PLANS } from '../data/mockData';
import { Product, SubscriptionPlan } from '../types';
import { StoreService } from '../lib/storage';
import { createSubscription } from '../lib/api/subscriptions';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { useLang } from '../lib/language';

// The fallback is exactly what this page rendered before it was wired to the
// CMS — see the contract in useSiteContent.ts. Once an admin edits
// `plans.subscriptions` in /admin, this block's `eyebrow`/`heading`/`items`
// take over; until then, or if Supabase is unreachable, the page looks
// identical to today.
const SUBSCRIPTIONS_FALLBACK = {
  eyebrow: 'RECURRING FRESH MEAT PASS',
  heading: 'Protein Cuts Subscriptions',
  items: INITIAL_SUBSCRIPTION_PLANS
};

// Maps each fixed plan to the customer segment it targets — surfaced as a
// badge on the plan card, and used to steer daily buyers vs. gym users vs.
// families toward the right starting point.
const SEGMENT_META: Record<string, { label: string; icon: React.ReactNode }> = {
  Fitness: { label: 'Daily Buyers & Gym Users', icon: <Dumbbell className="w-3.5 h-3.5" /> },
  Family: { label: 'Families', icon: <Users className="w-3.5 h-3.5" /> },
  Custom: { label: 'High-Volume & Custom', icon: <Settings2 className="w-3.5 h-3.5" /> }
};

const SEGMENT_META_TA: Record<string, { label: string }> = {
  Fitness: { label: 'தினசரி வாங்குபவர்கள் & ஜிம் பயனர்கள்' },
  Family: { label: 'குடும்பங்கள்' },
  Custom: { label: 'அதிக அளவு & தனிப்பயன்' }
};

// Tamil variants of the mock subscription plans (id-keyed, mirrors the
// English INITIAL_SUBSCRIPTION_PLANS shape). Only used when subsBlock.items
// falls back to INITIAL_SUBSCRIPTION_PLANS (i.e. no CMS override) — live CMS
// content has no per-language field, so CMS-sourced plans stay as typed.
const SUBSCRIPTION_PLANS_TA: Record<
  string,
  { title: string; tagline: string; badge?: string; savings: string; itemsIncluded: string[]; recommendedFor: string }
> = {
  'plan-01': {
    title: 'டெய்லி ஃபிட்னஸ் புரோட்டீன் பிளான்',
    tagline: 'ஜிம் புரதம் ஒருபோதும் தீராது',
    itemsIncluded: ['500g எலும்பில்லா கோழி மார்பகம்', '6 ஆர்கானிக் முட்டைகள்', 'இலவச எக்ஸ்பிரஸ் காலை டெலிவரி'],
    savings: '₹601 / மாதம் சேமிக்கவும்',
    badge: 'அதிகம் பிரபலமானது',
    recommendedFor: 'விளையாட்டு வீரர்கள், ஜிம் பயனர்கள் & மேக்ரோ கண்காணிப்பாளர்கள்'
  },
  'plan-02': {
    title: 'வாராந்திர குடும்ப இறைச்சி பாக்ஸ்',
    tagline: 'புதிய வார இறுதி விருந்து தானாக',
    itemsIncluded: ['1kg கறி கட் கோழி', '500g மட்டன் கட்', '500g வஞ்சிரம் மீன் ஸ்டீக்ஸ்', '30 முட்டைகள் ட்ரே'],
    savings: '₹701 / மாதம் சேமிக்கவும்',
    recommendedFor: '3 முதல் 5 உறுப்பினர்கள் கொண்ட குடும்பங்கள்'
  },
  'plan-03': {
    title: 'மாதாந்திர எலைட் மீட் பாஸ்',
    tagline: 'வரம்பற்ற இலவச எக்ஸ்பிரஸ் டெலிவரிகள் + 20% தள்ளுபடி',
    itemsIncluded: ['தனிப்பயன் இறைச்சி தேர்வாளர்', 'முன்னுரிமை 20-நிமிட எக்ஸ்பிரஸ் நேரம்', 'பிரத்யேக IGO பட்லர் சேவை', '0 டெலிவரி கட்டணம்'],
    savings: '₹1201 / மாதம் சேமிக்கவும்',
    badge: 'லக்ஷரி VIP',
    recommendedFor: 'இறைச்சி ஆர்வலர்கள் & அதிக அளவு வாங்குபவர்கள்'
  },
  'plan-04': {
    title: 'பார்பிக்யூ & கிரில் பேக்',
    tagline: 'வார இறுதி கிரில்லிங்கிற்கான அனைத்தும், வெள்ளி காலை டெலிவரி',
    itemsIncluded: ['500g கோழி லாலிபாப் கட்ஸ்', '500g தந்தூரி சிக்கன் டிக்கா (மசாலா தடவப்பட்டது)', '500g மட்டன் சீக் கபாப் (மசாலா தடவப்பட்டது)', '500g செஃப் பேரி பேரி மசாலா கோழி சிறகுகள்'],
    savings: '₹601 / மாதம் சேமிக்கவும்',
    badge: 'புதியது',
    recommendedFor: 'வார இறுதி கிரில்லர்கள் & பார்பிக்யூ ஹோஸ்ட்கள்'
  }
};

const DAY_LABELS_TA: Record<string, string> = {
  Mon: 'திங்கள்',
  Tue: 'செவ்வாய்',
  Wed: 'புதன்',
  Thu: 'வியாழன்',
  Fri: 'வெள்ளி',
  Sat: 'சனி',
  Sun: 'ஞாயிறு'
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

// The two fixed plans (Daily Fitness, Weekly Family) describe their contents
// as plain strings ("500g Boneless Chicken Breast") with no product id —
// that's why they used to dead-end at "not available for instant
// self-checkout". These keyword sets resolve each described item to a real
// catalog product (by name, case-insensitive substring match), so the plan
// can be subscribed through the exact same real per-product flow the Custom
// box builder already uses below. The Custom-category plans (Monthly Elite,
// BBQ & Grill) aren't listed here on purpose — they already work via the
// manual box builder.
const FIXED_PLAN_ITEMS: Record<string, { keywords: string[] }[]> = {
  'plan-01': [
    { keywords: ['chicken', 'breast'] }, // 500g Boneless Chicken Breast
    { keywords: ['organic', 'egg'] } // 6 Organic Eggs
  ],
  'plan-02': [
    { keywords: ['chicken', 'curry'] }, // 1kg Curry Cut Chicken
    { keywords: ['mutton', 'curry'] }, // 500g Mutton Cut
    { keywords: ['seer'] }, // 500g Seer Fish Steaks
    { keywords: ['white', 'egg'] } // 30 Eggs Tray
  ]
};

const matchProductByKeywords = (keywords: string[], products: Product[]): Product | undefined =>
  products.find((p) => keywords.every((k) => p.name.toLowerCase().includes(k)));

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({ products = [], onNavigate }) => {
  const { lang } = useLang();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-01');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [subscribed, setSubscribed] = useState(false);
  const [boxFrequency, setBoxFrequency] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [boxLines, setBoxLines] = useState<BoxLine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const userProfile = StoreService.getUserProfile();
  const defaultAddress = userProfile.savedAddresses.find((a) => a.isDefault) ?? userProfile.savedAddresses[0];

  const subsBlock = useSiteContent('plans.subscriptions', SUBSCRIPTIONS_FALLBACK);
  const resolvedHeading =
    lang === 'ta'
      ? { eyebrow: 'தொடர் புதிய இறைச்சி பாஸ்', heading: 'ப்ரோட்டீன் கட்ஸ் சந்தாக்கள்' }
      : { eyebrow: subsBlock.eyebrow, heading: subsBlock.heading };
  const plans: SubscriptionPlan[] =
    Array.isArray(subsBlock.items) && subsBlock.items.length > 0 ? subsBlock.items : INITIAL_SUBSCRIPTION_PLANS;
  // Deliberately NOT gated on "plans === INITIAL_SUBSCRIPTION_PLANS" — that
  // reference-equality check silently fails in production because the CMS
  // (igo_site_content, key `plans.subscriptions`) almost always has a stored
  // row seeded with the same plan-01..04 ids, so `plans` is a *new* array
  // with identical content, not the same object reference. That made this
  // always evaluate false live, so the Tamil title/tagline/items lookup
  // below never fired even though the ids matched. Look up by id directly
  // instead — CMS-authored plans that reuse the original ids still get
  // translated; anything with unrecognized ids just falls through untouched.

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const isCustomBuilder = selectedPlan?.category === 'Custom';

  // Auto-fill the box with real matched products whenever a fixed plan is
  // selected, so the customer never has to build it manually — Custom plans
  // keep starting empty since those are meant to be hand-picked.
  useEffect(() => {
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;
    setSubscribed(false);
    setSubmitError(null);
    if (plan.category === 'Custom') {
      setBoxLines([]);
      return;
    }
    const itemDefs = FIXED_PLAN_ITEMS[plan.id];
    const matched = (itemDefs ?? [])
      .map((def) => matchProductByKeywords(def.keywords, products))
      .filter((p): p is Product => !!p)
      .map((p) => ({ productId: p.id, quantity: 1 }));
    setBoxLines(matched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanId, products.length]);

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

  // Every plan — Custom (hand-picked) or fixed (auto-matched above) —
  // ultimately submits as one real per-product subscription per box line, so
  // this one handler covers both instead of only the Custom builder.
  const handleConfirmCustomBox = async () => {
    setSubmitError(null);
    if (!StoreService.isLoggedIn()) {
      setSubmitError(lang === 'ta' ? 'சந்தாவைத் தொடங்க உள்நுழையவும்.' : 'Please sign in to start a subscription.');
      onNavigate?.('/login');
      return;
    }
    if (!defaultAddress) {
      setSubmitError(lang === 'ta' ? 'முதலில் என் கணக்கில் ஒரு டெலிவரி முகவரியைச் சேர்க்கவும்.' : 'Add a delivery address in My Account first.');
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
        setSubmitError(failed.error ?? (lang === 'ta' ? 'சில பொருட்களுக்கு சந்தா செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Some items could not be subscribed. Please try again.'));
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
      <div className="bg-[#0A1F12] rounded-3xl p-8 text-center max-w-3xl mx-auto space-y-3 text-white shadow-lg shadow-emerald-950/20">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4" /> {resolvedHeading.eyebrow}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{resolvedHeading.heading}</h1>
        <p className="text-xs sm:text-sm text-neutral-300">
          {lang === 'ta'
            ? 'உங்கள் அதிக புரத உணவு அல்லது வாராந்திர குடும்ப இறைச்சி விநியோகத்தை தானியங்குபடுத்துங்கள். உத்தரவாதமான காலை 6 மணி நேரங்கள், பூஜ்ஜிய டெலிவரி கட்டணங்கள் மற்றும் 20% வரை தள்ளுபடி பெறுங்கள்.'
            : 'Automate your high-protein diet or weekly family meat supply. Enjoy guaranteed morning 6 AM slots, zero delivery fees, and up to 20% discount.'}
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const planTa = SUBSCRIPTION_PLANS_TA[plan.id];
          const displayPlan = lang === 'ta' && planTa ? { ...plan, ...planTa } : plan;
          const segmentMeta = lang === 'ta' ? SEGMENT_META_TA[plan.category] : SEGMENT_META[plan.category];
          return (
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
                <h3 className="text-lg font-bold text-[#0A1F12]">{displayPlan.title}</h3>
                {displayPlan.badge && (
                  <span className="bg-[#0F7B3A] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shrink-0">
                    {displayPlan.badge}
                  </span>
                )}
              </div>
              {SEGMENT_META[plan.category] && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-1.5">
                  {SEGMENT_META[plan.category].icon} {segmentMeta?.label ?? SEGMENT_META[plan.category].label}
                </span>
              )}
              <p className="text-xs text-neutral-500">{displayPlan.tagline}</p>

              <div className="my-4 pt-4 border-t border-neutral-200">
                <div className="text-2xl font-black text-[#0A1F12]">
                  ₹{plan.pricePerMonth} <span className="text-xs text-neutral-500 font-normal">{lang === 'ta' ? '/ மாதம்' : '/ month'}</span>
                </div>
                <div className="text-xs text-emerald-700 font-bold">{displayPlan.savings}</div>
              </div>

              <ul className="space-y-2 text-xs text-neutral-600">
                {displayPlan.itemsIncluded.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs font-semibold text-neutral-500 border-t border-neutral-200 pt-3">
              {lang === 'ta' ? 'இலக்கு:' : 'Target:'} <strong className="text-[#0A1F12]">{displayPlan.recommendedFor}</strong>
            </div>
          </div>
          );
        })}
      </div>

      {/* Build Your Own Box — only for the Custom / high-volume plan */}
      {isCustomBuilder && (
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 max-w-4xl mx-auto space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[#0A1F12] flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-emerald-600" /> {lang === 'ta' ? 'உங்கள் சொந்த பெட்டியை உருவாக்குங்கள்' : 'Build Your Own Box'}
            </h3>
            <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 rounded-xl p-1">
              {(['Weekly', 'Monthly'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setBoxFrequency(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    boxFrequency === f ? 'bg-[#0F7B3A] text-white' : 'text-neutral-500 hover:text-[#0A1F12]'
                  }`}
                >
                  {lang === 'ta' ? (f === 'Weekly' ? 'வாராந்திரம்' : 'மாதாந்திரம்') : f}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            {lang === 'ta'
              ? 'உங்கள் தொடர் பெட்டியில் என்ன வேண்டும் என்பதை சரியாகத் தேர்ந்தெடுக்கவும். தனிப்பயன் பெட்டிகளுக்கு தனித்தனியாக பொருட்களை வாங்குவதை விட தானாக 15% தள்ளுபடி கிடைக்கும்.'
              : 'Pick exactly what you want in your recurring box. Custom boxes get an automatic 15% discount vs. buying items individually.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
            {products.slice(0, 16).map((p) => {
              const line = boxLines.find((l) => l.productId === p.id);
              return (
                <div key={p.id} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-2.5 space-y-2">
                  <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full aspect-square rounded-xl object-cover" />
                  <div className="text-[11px] font-bold text-[#0A1F12] line-clamp-2 leading-tight">{p.name}</div>
                  <div className="text-[10px] text-emerald-700 font-black">₹{p.weightOptions[0].price}</div>
                  {line ? (
                    <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-lg p-1">
                      <button onClick={() => updateBoxQty(p.id, line.quantity - 1)} className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-[#0A1F12]">{line.quantity}</span>
                      <button onClick={() => updateBoxQty(p.id, line.quantity + 1)} className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToBox(p.id)}
                      className="w-full bg-white border border-emerald-300 text-emerald-700 hover:bg-[#0F7B3A] hover:text-white font-bold py-1.5 rounded-lg text-[10px] uppercase transition"
                    >
                      {lang === 'ta' ? '+ பெட்டியில் சேர்' : '+ Add to Box'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Plan Includes — for fixed (non-Custom) plans, the box above is
          already auto-populated with real matched products, so show what
          got matched instead of the full pick-anything grid. */}
      {!isCustomBuilder && boxLines.length > 0 && (
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 max-w-4xl mx-auto space-y-3 shadow-sm">
          <h3 className="text-base font-bold text-[#0A1F12] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {lang === 'ta' ? 'இந்த திட்டத்தில் அடங்கும்' : 'This Plan Includes'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {boxLines.map((line) => {
              const p = products.find((prod) => prod.id === line.productId);
              if (!p) return null;
              return (
                <div key={line.productId} className="bg-neutral-50 border border-neutral-200 rounded-2xl p-2.5 space-y-1">
                  <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full aspect-square rounded-xl object-cover" />
                  <div className="text-[11px] font-bold text-[#0A1F12] line-clamp-2 leading-tight">{p.name}</div>
                  <div className="text-[10px] text-emerald-700 font-black">₹{p.weightOptions[0].price}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Box summary — shared by the manual Custom builder and the
          auto-matched fixed plans; both submit through the same real
          per-product subscription flow. Custom boxes get the advertised 15%
          multi-item discount; fixed plans show their real per-delivery total
          as-is, since that discount claim was never part of those plans. */}
      {boxLines.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 max-w-4xl mx-auto space-y-2">
          <div className="text-xs font-bold text-[#0A1F12] uppercase tracking-wider">
            {lang === 'ta'
              ? `${isCustomBuilder ? 'உங்கள் பெட்டி' : 'திட்ட மொத்தம்'} (${boxLines.reduce((a, l) => a + l.quantity, 0)} பொருட்கள்)`
              : `${isCustomBuilder ? 'Your Box' : 'Plan Total'} (${boxLines.reduce((a, l) => a + l.quantity, 0)} items)`}
          </div>
          {boxLines.map((line) => {
            const p = products.find((prod) => prod.id === line.productId);
            if (!p) return null;
            return (
              <div key={line.productId} className="flex items-center justify-between text-xs">
                <span className="text-neutral-700">{p.name} x{line.quantity}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0A1F12]">₹{p.weightOptions[0].price * line.quantity}</span>
                  {isCustomBuilder && (
                    <button onClick={() => updateBoxQty(p.id, 0)} className="text-neutral-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
            <span className="text-xs font-bold text-neutral-600">
              {lang === 'ta'
                ? isCustomBuilder
                  ? `பெட்டி மொத்தம் (${boxFrequency === 'Weekly' ? 'வாராந்திரம்' : 'மாதாந்திரம்'}, 15% தள்ளுபடி)`
                  : 'டெலிவரிக்கு மொத்தம்'
                : isCustomBuilder
                  ? `Box Total (${boxFrequency}, 15% off)`
                  : 'Per-Delivery Total'}
            </span>
            {isCustomBuilder ? (
              <span className="text-lg font-black text-emerald-700">
                ₹{boxDiscountedTotal} <span className="text-xs text-neutral-400 line-through font-normal">₹{boxTotal}</span>
              </span>
            ) : (
              <span className="text-lg font-black text-emerald-700">₹{boxTotal}</span>
            )}
          </div>
        </div>
      )}

      {/* Customize Delivery Schedule */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-2xl mx-auto space-y-6 shadow-sm">
        <h3 className="text-base font-bold text-[#0A1F12] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" /> {lang === 'ta' ? 'விருப்பமான வாராந்திர டெலிவரி நாட்களைத் தேர்ந்தெடுக்கவும்' : 'Choose Preferred Weekly Delivery Days'}
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
                    : 'bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-[#0A1F12]'
                }`}
              >
                {lang === 'ta' ? DAY_LABELS_TA[day] : day}
              </button>
            );
          })}
        </div>

        {subscribed ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center text-xs text-emerald-700 font-bold space-y-1">
            {lang === 'ta' ? 'சந்தா வெற்றிகரமாக செயல்படுத்தப்பட்டது!' : 'Subscription Activated Successfully!'}
            <div className="text-[11px] text-neutral-600 font-normal">
              {lang === 'ta' ? (
                <>
                  அதை நிர்வகிக்க என் கணக்கு → சந்தாக்கள் பார்க்கவும். உங்கள் முதல் டெலிவரி{' '}
                  {new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} அன்று திட்டமிடப்பட்டுள்ளது.
                </>
              ) : (
                <>
                  Check My Account → Subscriptions to manage it. Your first delivery is scheduled for{' '}
                  {new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.
                </>
              )}
            </div>
          </div>
        ) : boxLines.length > 0 ? (
          <>
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl px-3 py-2">
                {submitError}
              </div>
            )}
            <button
              onClick={handleConfirmCustomBox}
              disabled={isSubmitting}
              className="w-full bg-[#0F7B3A] hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-900/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {lang === 'ta' ? 'சந்தா தொடங்குகிறது…' : 'Starting Subscription…'}
                </>
              ) : (
                <>
                  {lang === 'ta'
                    ? isCustomBuilder ? 'உறுதிசெய்து சந்தாவைத் தொடங்கவும்' : 'திட்டத்தை செயல்படுத்தி சந்தாவைத் தொடங்கவும்'
                    : isCustomBuilder ? 'Confirm & Start Subscription' : 'Activate Plan & Start Subscription'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        ) : isCustomBuilder ? (
          <p className="text-[11px] text-neutral-400 text-center">
            {lang === 'ta' ? 'மேலே உங்கள் பெட்டியில் குறைந்தது ஒரு பொருளையாவது சேர்க்கவும்.' : 'Add at least one item to your box above.'}
          </p>
        ) : (
          <div className="space-y-2">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-3 py-2.5 text-center">
              {lang === 'ta' ? (
                <>
                  தற்போது கையிருப்பில் உள்ள பொருட்களுடன் இந்த திட்டத்தை பொருத்த முடியவில்லை — இப்போதே ஒரு உண்மையான சந்தாவைத் தொடங்க மேலே உள்ள{' '}
                  <strong>உங்கள் சொந்த பெட்டியை உருவாக்குங்கள்</strong> (தனிப்பயன் திட்டம்) பயன்படுத்தவும், அல்லது உங்களுக்காக இந்த திட்டத்தை அமைக்க எங்கள் குழுவை ஆதரவு மூலம் தொடர்பு கொள்ளவும்.
                </>
              ) : (
                <>
                  We couldn't match this plan to items currently in stock — use{' '}
                  <strong>Build Your Own Box</strong> (the Custom plan above) to start a real subscription now, or reach our
                  team via Support to set this plan up for you.
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
