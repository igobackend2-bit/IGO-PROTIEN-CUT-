import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Sparkles, ArrowRight, Dumbbell, Users, Settings2, Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import { INITIAL_SUBSCRIPTION_PLANS } from '../data/mockData';
import { Product, SubscriptionPlan } from '../types';
import { StoreService } from '../lib/storage';
import { createSubscription } from '../lib/api/subscriptions';
import { useSiteContent } from '../lib/hooks/useSiteContent';
import { useLang, pick } from '../lib/language';

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

const SEGMENT_META_HI: Record<string, { label: string }> = {
  Fitness: { label: 'रोज़ाना खरीदार और जिम यूज़र्स' },
  Family: { label: 'परिवार' },
  Custom: { label: 'उच्च मात्रा और कस्टम' }
};

const SEGMENT_META_ML: Record<string, { label: string }> = {
  Fitness: { label: 'ദിവസേന വാങ്ങുന്നവരും ജിം ഉപയോക്താക്കളും' },
  Family: { label: 'കുടുംബങ്ങൾ' },
  Custom: { label: 'ഉയർന്ന അളവും കസ്റ്റവും' }
};

const SEGMENT_META_TE: Record<string, { label: string }> = {
  Fitness: { label: 'రోజువారీ కొనుగోలుదారులు & జిమ్ యూజర్లు' },
  Family: { label: 'కుటుంబాలు' },
  Custom: { label: 'అధిక పరిమాణం & కస్టమ్' }
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

const SUBSCRIPTION_PLANS_HI: Record<
  string,
  { title: string; tagline: string; badge?: string; savings: string; itemsIncluded: string[]; recommendedFor: string }
> = {
  'plan-01': {
    title: 'डेली फिटनेस प्रोटीन प्लान',
    tagline: 'जिम प्रोटीन कभी खत्म नहीं होगा',
    itemsIncluded: ['500g बोनलेस चिकन ब्रेस्ट', '6 ऑर्गेनिक अंडे', 'मुफ़्त एक्सप्रेस सुबह डिलीवरी'],
    savings: '₹601 / माह बचाएं',
    badge: 'सबसे लोकप्रिय',
    recommendedFor: 'एथलीट्स, जिम जाने वाले और मैक्रो ट्रैकर्स'
  },
  'plan-02': {
    title: 'साप्ताहिक फैमिली मीट बॉक्स',
    tagline: 'ताज़ा वीकेंड दावत अपने आप',
    itemsIncluded: ['1kg करी कट चिकन', '500g मटन कट', '500g सुरमई फिश स्टेक्स', '30 अंडों की ट्रे'],
    savings: '₹701 / माह बचाएं',
    recommendedFor: '3 से 5 सदस्यों वाले परिवार'
  },
  'plan-03': {
    title: 'मासिक एलीट मीट पास',
    tagline: 'असीमित मुफ़्त एक्सप्रेस डिलीवरी + 20% छूट',
    itemsIncluded: ['कस्टम मीट सेलेक्टर', 'प्राथमिकता 20-मिनट एक्सप्रेस स्लॉट', 'विशेष IGO बटलर सेवा', '0 डिलीवरी शुल्क'],
    savings: '₹1201 / माह बचाएं',
    badge: 'लक्ज़री VIP',
    recommendedFor: 'गॉर्मेट मीट पारखी और उच्च मात्रा में खरीदार'
  },
  'plan-04': {
    title: 'बारबेक्यू और ग्रिल पैक',
    tagline: 'वीकेंड ग्रिलिंग के लिए सब कुछ, शुक्रवार सुबह डिलीवरी',
    itemsIncluded: ['500g चिकन लॉलीपॉप कट्स', '500g तंदूरी चिकन टिक्का (मैरिनेटेड)', '500g मटन सीक कबाब (मैरिनेटेड)', '500g शेफ पेरी पेरी मसाला चिकन विंग्स'],
    savings: '₹601 / माह बचाएं',
    badge: 'नया',
    recommendedFor: 'वीकेंड ग्रिलर्स और बीबीक्यू होस्ट्स'
  }
};

const SUBSCRIPTION_PLANS_ML: Record<
  string,
  { title: string; tagline: string; badge?: string; savings: string; itemsIncluded: string[]; recommendedFor: string }
> = {
  'plan-01': {
    title: 'ഡെയ്‌ലി ഫിറ്റ്നസ് പ്രോട്ടീൻ പ്ലാൻ',
    tagline: 'ജിം പ്രോട്ടീൻ ഒരിക്കലും തീരില്ല',
    itemsIncluded: ['500g എല്ലില്ലാ ചിക്കൻ ബ്രെസ്റ്റ്', '6 ഓർഗാനിക് മുട്ട', 'സൗജന്യ എക്സ്പ്രസ് രാവിലെ ഡെലിവറി'],
    savings: '₹601 / മാസം ലാഭിക്കൂ',
    badge: 'ഏറ്റവും ജനപ്രിയം',
    recommendedFor: 'അത്‌ലറ്റുകൾ, ജിം ഉപയോക്താക്കൾ & മാക്രോ ട്രാക്കർമാർ'
  },
  'plan-02': {
    title: 'വീക്ക്‌ലി ഫാമിലി മീറ്റ് ബോക്സ്',
    tagline: 'ഫ്രഷ് വാരാന്ത്യ വിരുന്ന് സ്വയമേവ',
    itemsIncluded: ['1kg കറി കട്ട് ചിക്കൻ', '500g മട്ടൺ കട്ട്', '500g വഞ്ചിരം ഫിഷ് സ്റ്റീക്സ്', '30 മുട്ട ട്രേ'],
    savings: '₹701 / മാസം ലാഭിക്കൂ',
    recommendedFor: '3 മുതൽ 5 അംഗങ്ങൾ വരെയുള്ള കുടുംബങ്ങൾ'
  },
  'plan-03': {
    title: 'മന്ത്‌ലി എലൈറ്റ് മീറ്റ് പാസ്',
    tagline: 'അൺലിമിറ്റഡ് സൗജന്യ എക്സ്പ്രസ് ഡെലിവറികൾ + 20% കിഴിവ്',
    itemsIncluded: ['കസ്റ്റം മീറ്റ് സെലക്ടർ', 'മുൻഗണനാ 20-മിനിറ്റ് എക്സ്പ്രസ് സ്ലോട്ട്', 'എക്സ്ക്ലൂസീവ് IGO ബട്ലർ സേവനം', '0 ഡെലിവറി ചാർജ്'],
    savings: '₹1201 / മാസം ലാഭിക്കൂ',
    badge: 'ലക്ഷ്വറി VIP',
    recommendedFor: 'ഗോർമെറ്റ് മീറ്റ് പ്രിയരും ഉയർന്ന അളവിൽ വാങ്ങുന്നവരും'
  },
  'plan-04': {
    title: 'ബാർബിക്യൂ & ഗ്രിൽ പാക്ക്',
    tagline: 'വാരാന്ത്യ ഗ്രില്ലിംഗിന് വേണ്ടതെല്ലാം, വെള്ളിയാഴ്ച രാവിലെ ഡെലിവറി',
    itemsIncluded: ['500g ചിക്കൻ ലോലിപോപ്പ് കട്സ്', '500g തന്തൂരി ചിക്കൻ ടിക്ക (മറിനേറ്റഡ്)', '500g മട്ടൺ സീക് കബാബ് (മറിനേറ്റഡ്)', '500g ഷെഫ് പെരി പെരി മസാല ചിക്കൻ വിംഗ്സ്'],
    savings: '₹601 / മാസം ലാഭിക്കൂ',
    badge: 'പുതിയത്',
    recommendedFor: 'വാരാന്ത്യ ഗ്രില്ലർമാരും ബിബിക്യൂ ഹോസ്റ്റുകളും'
  }
};

const SUBSCRIPTION_PLANS_TE: Record<
  string,
  { title: string; tagline: string; badge?: string; savings: string; itemsIncluded: string[]; recommendedFor: string }
> = {
  'plan-01': {
    title: 'డైలీ ఫిట్‌నెస్ ప్రోటీన్ ప్లాన్',
    tagline: 'జిమ్ ప్రోటీన్ ఎప్పుడూ అయిపోదు',
    itemsIncluded: ['500g ఎముక లేని చికెన్ బ్రెస్ట్', '6 ఆర్గానిక్ గుడ్లు', 'ఉచిత ఎక్స్‌ప్రెస్ ఉదయం డెలివరీ'],
    savings: '₹601 / నెల ఆదా చేయండి',
    badge: 'అత్యంత ప్రజాదరణ పొందినది',
    recommendedFor: 'అథ్లెట్లు, జిమ్ వెళ్లేవారు & మాక్రో ట్రాకర్లు'
  },
  'plan-02': {
    title: 'వీక్లీ ఫ్యామిలీ మీట్ బాక్స్',
    tagline: 'ఫ్రెష్ వారాంతపు విందు స్వయంచాలకంగా',
    itemsIncluded: ['1kg కర్రీ కట్ చికెన్', '500g మటన్ కట్', '500g సురమయి ఫిష్ స్టీక్స్', '30 గుడ్ల ట్రే'],
    savings: '₹701 / నెల ఆదా చేయండి',
    recommendedFor: '3 నుండి 5 మంది సభ్యులున్న కుటుంబాలు'
  },
  'plan-03': {
    title: 'మంత్లీ ఎలైట్ మీట్ పాస్',
    tagline: 'అపరిమిత ఉచిత ఎక్స్‌ప్రెస్ డెలివరీలు + 20% తగ్గింపు',
    itemsIncluded: ['కస్టమ్ మీట్ సెలెక్టర్', 'ప్రాధాన్యత 20-నిమిషాల ఎక్స్‌ప్రెస్ స్లాట్', 'ప్రత్యేక IGO బట్లర్ సేవ', '0 డెలివరీ ఛార్జీ'],
    savings: '₹1201 / నెల ఆదా చేయండి',
    badge: 'లగ్జరీ VIP',
    recommendedFor: 'గోర్మెట్ మీట్ ప్రియులు & అధిక పరిమాణంలో కొనుగోలుదారులు'
  },
  'plan-04': {
    title: 'బార్బెక్యూ & గ్రిల్ ప్యాక్',
    tagline: 'వారాంతపు గ్రిల్లింగ్‌కు కావలసినదంతా, శుక్రవారం ఉదయం డెలివరీ',
    itemsIncluded: ['500g చికెన్ లాలీపాప్ కట్స్', '500g తందూరీ చికెన్ టిక్కా (మెరినేటెడ్)', '500g మటన్ సీక్ కబాబ్ (మెరినేటెడ్)', '500g చెఫ్ పెరి పెరి మసాలా చికెన్ వింగ్స్'],
    savings: '₹601 / నెల ఆదా చేయండి',
    badge: 'కొత్తది',
    recommendedFor: 'వారాంతపు గ్రిల్లర్లు & బీబీక్యూ హోస్ట్‌లు'
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

const DAY_LABELS_HI: Record<string, string> = {
  Mon: 'सोमवार',
  Tue: 'मंगलवार',
  Wed: 'बुधवार',
  Thu: 'गुरुवार',
  Fri: 'शुक्रवार',
  Sat: 'शनिवार',
  Sun: 'रविवार'
};

const DAY_LABELS_ML: Record<string, string> = {
  Mon: 'തിങ്കൾ',
  Tue: 'ചൊവ്വ',
  Wed: 'ബുധൻ',
  Thu: 'വ്യാഴം',
  Fri: 'വെള്ളി',
  Sat: 'ശനി',
  Sun: 'ഞായർ'
};

const DAY_LABELS_TE: Record<string, string> = {
  Mon: 'సోమవారం',
  Tue: 'మంగళవారం',
  Wed: 'బుధవారం',
  Thu: 'గురువారం',
  Fri: 'శుక్రవారం',
  Sat: 'శనివారం',
  Sun: 'ఆదివారం'
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
      : lang === 'hi'
      ? { eyebrow: 'रिकरिंग फ्रेश मीट पास', heading: 'प्रोटीन कट्स सब्सक्रिप्शन' }
      : lang === 'ml'
      ? { eyebrow: 'ആവർത്തിക്കുന്ന ഫ്രഷ് മീറ്റ് പാസ്', heading: 'പ്രോട്ടീൻ കട്സ് സബ്സ്ക്രിപ്ഷനുകൾ' }
      : lang === 'te'
      ? { eyebrow: 'రికరింగ్ ఫ్రెష్ మీట్ పాస్', heading: 'ప్రోటీన్ కట్స్ సబ్‌స్క్రిప్షన్లు' }
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
      setSubmitError(pick(lang, { en: 'Please sign in to start a subscription.', ta: 'சந்தாவைத் தொடங்க உள்நுழையவும்.', hi: 'सब्सक्रिप्शन शुरू करने के लिए साइन इन करें।', ml: 'സബ്സ്ക്രിപ്ഷൻ ആരംഭിക്കാൻ സൈൻ ഇൻ ചെയ്യുക.', te: 'సబ్‌స్క్రిప్షన్ ప్రారంభించడానికి సైన్ ఇన్ చేయండి.' }));
      onNavigate?.('/login');
      return;
    }
    if (!defaultAddress) {
      setSubmitError(pick(lang, { en: 'Add a delivery address in My Account first.', ta: 'முதலில் என் கணக்கில் ஒரு டெலிவரி முகவரியைச் சேர்க்கவும்.', hi: 'पहले माय अकाउंट में एक डिलीवरी पता जोड़ें।', ml: 'ആദ്യം എന്റെ അക്കൗണ്ടിൽ ഒരു ഡെലിവറി വിലാസം ചേർക്കുക.', te: 'ముందుగా మై అకౌంట్‌లో డెలివరీ చిరునామాను జోడించండి.' }));
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
        setSubmitError(failed.error ?? pick(lang, { en: 'Some items could not be subscribed. Please try again.', ta: 'சில பொருட்களுக்கு சந்தா செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', hi: 'कुछ आइटम्स के लिए सब्सक्राइब नहीं किया जा सका। कृपया फिर से कोशिश करें।', ml: 'ചില ഇനങ്ങൾ സബ്സ്ക്രൈബ് ചെയ്യാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.', te: 'కొన్ని వస్తువులను సబ్‌స్క్రైబ్ చేయలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.' }));
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
          {pick(lang, {
            en: 'Automate your high-protein diet or weekly family meat supply. Enjoy guaranteed morning 6 AM slots, zero delivery fees, and up to 20% discount.',
            ta: 'உங்கள் அதிக புரத உணவு அல்லது வாராந்திர குடும்ப இறைச்சி விநியோகத்தை தானியங்குபடுத்துங்கள். உத்தரவாதமான காலை 6 மணி நேரங்கள், பூஜ்ஜிய டெலிவரி கட்டணங்கள் மற்றும் 20% வரை தள்ளுபடி பெறுங்கள்.',
            hi: 'अपने हाई-प्रोटीन डाइट या साप्ताहिक फैमिली मीट सप्लाई को ऑटोमेट करें। गारंटीड सुबह 6 बजे के स्लॉट, शून्य डिलीवरी शुल्क और 20% तक की छूट पाएं।',
            ml: 'നിങ്ങളുടെ ഉയർന്ന പ്രോട്ടീൻ ഡയറ്റോ പ്രതിവാര ഫാമിലി മീറ്റ് സപ്ലൈയോ ഓട്ടോമേറ്റ് ചെയ്യൂ. ഗ്യാരണ്ടീഡ് രാവിലെ 6 മണി സ്ലോട്ടുകൾ, പൂജ്യം ഡെലിവറി ചാർജുകൾ, 20% വരെ കിഴിവ് എന്നിവ ആസ്വദിക്കൂ.',
            te: 'మీ హై-ప్రోటీన్ డైట్ లేదా వారాంతపు ఫ్యామిలీ మీట్ సరఫరాను ఆటోమేట్ చేయండి. హామీ ఇచ్చిన ఉదయం 6 గంటల స్లాట్‌లు, సున్నా డెలివరీ ఛార్జీలు మరియు 20% వరకు తగ్గింపు పొందండి.'
          })}
        </p>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const subPlansByLang =
            lang === 'ta' ? SUBSCRIPTION_PLANS_TA : lang === 'hi' ? SUBSCRIPTION_PLANS_HI : lang === 'ml' ? SUBSCRIPTION_PLANS_ML : lang === 'te' ? SUBSCRIPTION_PLANS_TE : null;
          const planTranslated = subPlansByLang?.[plan.id];
          const displayPlan = planTranslated ? { ...plan, ...planTranslated } : plan;
          const segmentMetaByLang =
            lang === 'ta' ? SEGMENT_META_TA : lang === 'hi' ? SEGMENT_META_HI : lang === 'ml' ? SEGMENT_META_ML : lang === 'te' ? SEGMENT_META_TE : null;
          const segmentMeta = segmentMetaByLang?.[plan.category];
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
                  ₹{plan.pricePerMonth} <span className="text-xs text-neutral-500 font-normal">{pick(lang, { en: '/ month', ta: '/ மாதம்', hi: '/ माह', ml: '/ മാസം', te: '/ నెల' })}</span>
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
              {pick(lang, { en: 'Target:', ta: 'இலக்கு:', hi: 'लक्ष्य:', ml: 'ലക്ഷ്യം:', te: 'లక్ష్యం:' })} <strong className="text-[#0A1F12]">{displayPlan.recommendedFor}</strong>
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
              <Settings2 className="w-5 h-5 text-emerald-600" /> {pick(lang, { en: 'Build Your Own Box', ta: 'உங்கள் சொந்த பெட்டியை உருவாக்குங்கள்', hi: 'अपना खुद का बॉक्स बनाएं', ml: 'നിങ്ങളുടെ സ്വന്തം ബോക്സ് നിർമ്മിക്കൂ', te: 'మీ సొంత బాక్స్‌ను తయారు చేసుకోండి' })}
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
                  {pick(lang, {
                    en: f,
                    ta: f === 'Weekly' ? 'வாராந்திரம்' : 'மாதாந்திரம்',
                    hi: f === 'Weekly' ? 'साप्ताहिक' : 'मासिक',
                    ml: f === 'Weekly' ? 'പ്രതിവാരം' : 'പ്രതിമാസം',
                    te: f === 'Weekly' ? 'వారానికి' : 'నెలవారీ'
                  })}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            {pick(lang, {
              en: 'Pick exactly what you want in your recurring box. Custom boxes get an automatic 15% discount vs. buying items individually.',
              ta: 'உங்கள் தொடர் பெட்டியில் என்ன வேண்டும் என்பதை சரியாகத் தேர்ந்தெடுக்கவும். தனிப்பயன் பெட்டிகளுக்கு தனித்தனியாக பொருட்களை வாங்குவதை விட தானாக 15% தள்ளுபடி கிடைக்கும்.',
              hi: 'अपने रिकरिंग बॉक्स में बिल्कुल वही चुनें जो आप चाहते हैं। कस्टम बॉक्स पर आइटम अलग-अलग खरीदने की तुलना में स्वचालित 15% छूट मिलती है।',
              ml: 'നിങ്ങളുടെ ആവർത്തിക്കുന്ന ബോക്സിൽ വേണ്ടത് കൃത്യമായി തിരഞ്ഞെടുക്കൂ. കസ്റ്റം ബോക്സുകൾക്ക് ഇനങ്ങൾ വെവ്വേറെ വാങ്ങുന്നതിനെക്കാൾ ഓട്ടോമാറ്റിക് 15% കിഴിവ് ലഭിക്കും.',
              te: 'మీ రికరింగ్ బాక్స్‌లో ఖచ్చితంగా మీకు కావలసినది ఎంచుకోండి. కస్టమ్ బాక్స్‌లకు వస్తువులను విడివిడిగా కొనడం కంటే ఆటోమేటిక్‌గా 15% తగ్గింపు లభిస్తుంది.'
            })}
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
                      {pick(lang, { en: '+ Add to Box', ta: '+ பெட்டியில் சேர்', hi: '+ बॉक्स में जोड़ें', ml: '+ ബോക്സിലേക്ക് ചേർക്കൂ', te: '+ బాక్స్‌కు జోడించండి' })}
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
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {pick(lang, { en: 'This Plan Includes', ta: 'இந்த திட்டத்தில் அடங்கும்', hi: 'इस प्लान में शामिल है', ml: 'ഈ പ്ലാനിൽ ഉൾപ്പെടുന്നത്', te: 'ఈ ప్లాన్‌లో ఉన్నవి' })}
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
            {pick(lang, {
              en: `${isCustomBuilder ? 'Your Box' : 'Plan Total'} (${boxLines.reduce((a, l) => a + l.quantity, 0)} items)`,
              ta: `${isCustomBuilder ? 'உங்கள் பெட்டி' : 'திட்ட மொத்தம்'} (${boxLines.reduce((a, l) => a + l.quantity, 0)} பொருட்கள்)`,
              hi: `${isCustomBuilder ? 'आपका बॉक्स' : 'प्लान टोटल'} (${boxLines.reduce((a, l) => a + l.quantity, 0)} आइटम)`,
              ml: `${isCustomBuilder ? 'നിങ്ങളുടെ ബോക്സ്' : 'പ്ലാൻ ആകെ'} (${boxLines.reduce((a, l) => a + l.quantity, 0)} ഇനങ്ങൾ)`,
              te: `${isCustomBuilder ? 'మీ బాక్స్' : 'ప్లాన్ మొత్తం'} (${boxLines.reduce((a, l) => a + l.quantity, 0)} వస్తువులు)`
            })}
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
              {isCustomBuilder
                ? pick(lang, {
                    en: `Box Total (${boxFrequency}, 15% off)`,
                    ta: `பெட்டி மொத்தம் (${boxFrequency === 'Weekly' ? 'வாராந்திரம்' : 'மாதாந்திரம்'}, 15% தள்ளுபடி)`,
                    hi: `बॉक्स टोटल (${boxFrequency === 'Weekly' ? 'साप्ताहिक' : 'मासिक'}, 15% छूट)`,
                    ml: `ബോക്സ് ആകെ (${boxFrequency === 'Weekly' ? 'പ്രതിവാരം' : 'പ്രതിമാസം'}, 15% കിഴിവ്)`,
                    te: `బాక్స్ మొత్తం (${boxFrequency === 'Weekly' ? 'వారానికి' : 'నెలవారీ'}, 15% తగ్గింపు)`
                  })
                : pick(lang, {
                    en: 'Per-Delivery Total',
                    ta: 'டெலிவரிக்கு மொத்தம்',
                    hi: 'प्रति डिलीवरी टोटल',
                    ml: 'ഓരോ ഡെലിവറിക്കും ആകെ',
                    te: 'ప్రతి డెలివరీకి మొత్తం'
                  })}
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
          <Calendar className="w-5 h-5 text-emerald-600" /> {pick(lang, {
            en: 'Choose Preferred Weekly Delivery Days',
            ta: 'விருப்பமான வாராந்திர டெலிவரி நாட்களைத் தேர்ந்தெடுக்கவும்',
            hi: 'पसंदीदा साप्ताहिक डिलीवरी दिन चुनें',
            ml: 'ഇഷ്ടപ്പെട്ട പ്രതിവാര ഡെലിവറി ദിവസങ്ങൾ തിരഞ്ഞെടുക്കൂ',
            te: 'ఇష్టమైన వారపు డెలివరీ రోజులను ఎంచుకోండి'
          })}
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
                {lang === 'ta' ? DAY_LABELS_TA[day] : lang === 'hi' ? DAY_LABELS_HI[day] : lang === 'ml' ? DAY_LABELS_ML[day] : lang === 'te' ? DAY_LABELS_TE[day] : day}
              </button>
            );
          })}
        </div>

        {subscribed ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center text-xs text-emerald-700 font-bold space-y-1">
            {pick(lang, {
              en: 'Subscription Activated Successfully!',
              ta: 'சந்தா வெற்றிகரமாக செயல்படுத்தப்பட்டது!',
              hi: 'सब्सक्रिप्शन सफलतापूर्वक चालू हो गया!',
              ml: 'സബ്സ്ക്രിപ്ഷൻ വിജയകരമായി സജീവമാക്കി!',
              te: 'సబ్‌స్క్రిప్షన్ విజయవంతంగా యాక్టివేట్ చేయబడింది!'
            })}
            <div className="text-[11px] text-neutral-600 font-normal">
              {lang === 'ta' ? (
                <>
                  அதை நிர்வகிக்க என் கணக்கு → சந்தாக்கள் பார்க்கவும். உங்கள் முதல் டெலிவரி{' '}
                  {new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} அன்று திட்டமிடப்பட்டுள்ளது.
                </>
              ) : lang === 'hi' ? (
                <>
                  इसे मैनेज करने के लिए माय अकाउंट → सब्सक्रिप्शन देखें। आपकी पहली डिलीवरी{' '}
                  {new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} के लिए तय है।
                </>
              ) : lang === 'ml' ? (
                <>
                  ഇത് മാനേജ് ചെയ്യാൻ എന്റെ അക്കൗണ്ട് → സബ്സ്ക്രിപ്ഷനുകൾ കാണുക. നിങ്ങളുടെ ആദ്യ ഡെലിവറി{' '}
                  {new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} തീയതിക്ക് ഷെഡ്യൂൾ ചെയ്തിരിക്കുന്നു.
                </>
              ) : lang === 'te' ? (
                <>
                  దీన్ని మేనేజ్ చేయడానికి మై అకౌంట్ → సబ్‌స్క్రిప్షన్‌లు చూడండి. మీ మొదటి డెలివరీ{' '}
                  {new Date(Date.now() + 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} నాటికి షెడ్యూల్ చేయబడింది.
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
                  <Loader2 className="w-4 h-4 animate-spin" /> {pick(lang, { en: 'Starting Subscription…', ta: 'சந்தா தொடங்குகிறது…', hi: 'सब्सक्रिप्शन शुरू हो रहा है…', ml: 'സബ്സ്ക്രിപ്ഷൻ ആരംഭിക്കുന്നു…', te: 'సబ్‌స్క్రిప్షన్ ప్రారంభమవుతోంది…' })}
                </>
              ) : (
                <>
                  {isCustomBuilder
                    ? pick(lang, {
                        en: 'Confirm & Start Subscription',
                        ta: 'உறுதிசெய்து சந்தாவைத் தொடங்கவும்',
                        hi: 'पुष्टि करें और सब्सक्रिप्शन शुरू करें',
                        ml: 'സ്ഥിരീകരിച്ച് സബ്സ്ക്രിപ്ഷൻ ആരംഭിക്കൂ',
                        te: 'నిర్ధారించి సబ్‌స్క్రిప్షన్ ప్రారంభించండి'
                      })
                    : pick(lang, {
                        en: 'Activate Plan & Start Subscription',
                        ta: 'திட்டத்தை செயல்படுத்தி சந்தாவைத் தொடங்கவும்',
                        hi: 'प्लान चालू करें और सब्सक्रिप्शन शुरू करें',
                        ml: 'പ്ലാൻ സജീവമാക്കി സബ്സ്ക്രിപ്ഷൻ ആരംഭിക്കൂ',
                        te: 'ప్లాన్‌ను యాక్టివేట్ చేసి సబ్‌స్క్రిప్షన్ ప్రారంభించండి'
                      })} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        ) : isCustomBuilder ? (
          <p className="text-[11px] text-neutral-400 text-center">
            {pick(lang, {
              en: 'Add at least one item to your box above.',
              ta: 'மேலே உங்கள் பெட்டியில் குறைந்தது ஒரு பொருளையாவது சேர்க்கவும்.',
              hi: 'ऊपर अपने बॉक्स में कम से कम एक आइटम जोड़ें।',
              ml: 'മുകളിലുള്ള നിങ്ങളുടെ ബോക്സിൽ കുറഞ്ഞത് ഒരു ഇനമെങ്കിലും ചേർക്കൂ.',
              te: 'పైన మీ బాక్స్‌లో కనీసం ఒక వస్తువును జోడించండి.'
            })}
          </p>
        ) : (
          <div className="space-y-2">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-3 py-2.5 text-center">
              {lang === 'ta' ? (
                <>
                  தற்போது கையிருப்பில் உள்ள பொருட்களுடன் இந்த திட்டத்தை பொருத்த முடியவில்லை — இப்போதே ஒரு உண்மையான சந்தாவைத் தொடங்க மேலே உள்ள{' '}
                  <strong>உங்கள் சொந்த பெட்டியை உருவாக்குங்கள்</strong> (தனிப்பயன் திட்டம்) பயன்படுத்தவும், அல்லது உங்களுக்காக இந்த திட்டத்தை அமைக்க எங்கள் குழுவை ஆதரவு மூலம் தொடர்பு கொள்ளவும்.
                </>
              ) : lang === 'hi' ? (
                <>
                  हम इस प्लान को वर्तमान में स्टॉक में मौजूद आइटम्स से मैच नहीं कर सके — अभी एक वास्तविक सब्सक्रिप्शन शुरू करने के लिए ऊपर दिए गए{' '}
                  <strong>अपना खुद का बॉक्स बनाएं</strong> (कस्टम प्लान) का उपयोग करें, या आपके लिए यह प्लान सेट करने के लिए सपोर्ट के ज़रिए हमारी टीम से संपर्क करें।
                </>
              ) : lang === 'ml' ? (
                <>
                  നിലവിൽ സ്റ്റോക്കിലുള്ള ഇനങ്ങളുമായി ഈ പ്ലാൻ പൊരുത്തപ്പെടുത്താൻ ഞങ്ങൾക്ക് കഴിഞ്ഞില്ല — ഇപ്പോൾ തന്നെ ഒരു യഥാർത്ഥ സബ്സ്ക്രിപ്ഷൻ ആരംഭിക്കാൻ മുകളിലുള്ള{' '}
                  <strong>നിങ്ങളുടെ സ്വന്തം ബോക്സ് നിർമ്മിക്കൂ</strong> (കസ്റ്റം പ്ലാൻ) ഉപയോഗിക്കൂ, അല്ലെങ്കിൽ ഈ പ്ലാൻ നിങ്ങൾക്കായി സജ്ജീകരിക്കാൻ സപ്പോർട്ട് വഴി ഞങ്ങളുടെ ടീമിനെ ബന്ധപ്പെടൂ.
                </>
              ) : lang === 'te' ? (
                <>
                  ప్రస్తుతం స్టాక్‌లో ఉన్న వస్తువులతో ఈ ప్లాన్‌ను మేము సరిపోల్చలేకపోయాము — ఇప్పుడే ఒక నిజమైన సబ్‌స్క్రిప్షన్ ప్రారంభించడానికి పైన ఉన్న{' '}
                  <strong>మీ సొంత బాక్స్‌ను తయారు చేసుకోండి</strong> (కస్టమ్ ప్లాన్) ఉపయోగించండి, లేదా మీ కోసం ఈ ప్లాన్‌ను సెటప్ చేయడానికి సపోర్ట్ ద్వారా మా టీమ్‌ను సంప్రదించండి.
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
