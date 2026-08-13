import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Eye,
  CheckCircle2,
  ChefHat,
  Drumstick,
  Beef,
  Fish,
  Sun,
  Egg,
  UtensilsCrossed,
  Gift,
  Package,
  Bike,
  Crown,
  Weight,
  Leaf,
  Award,
  Waves,
  Star,
  Instagram,
  Apple,
  Play,
  Clock3,
  Snowflake,
  MapPin,
  XCircle,
  Sandwich,
  ShieldCheck,
  Truck,
  User,
  Building2,
  ShoppingCart,
  Briefcase,
  Tag,
  Dumbbell,
  Users,
  Minus,
  Plus
} from 'lucide-react';
import { Product, ProductWeightOption } from '../types';
import { StoreService } from '../lib/storage';
import { INITIAL_SUBSCRIPTION_PLANS, INITIAL_RECIPES } from '../data/mockData';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { TrustSection } from '../sections/TrustSection';
import { ComboBanner } from '../sections/ComboBanner';
import { GuidesSection } from '../sections/GuidesSection';
import { ComboCardsGrid } from '../sections/ComboCardsGrid';
import { PromoTileStrip } from '../sections/PromoTileStrip';
import { TodaysDealsBanner } from '../sections/TodaysDealsBanner';
import { OurFarmsSection } from '../sections/OurFarmsSection';
import { Reveal } from '../components/Reveal';
import { BrandPartnersSection } from '../sections/BrandPartnersSection';
import { TestimonialsSection } from '../sections/TestimonialsSection';
import { useSiteContent, renderToken } from '../lib/hooks/useSiteContent';
import { resolveIcon } from '../lib/iconMap';
import { isPincodeServiceable } from '../lib/serviceability';
import { FadeImage } from '../components/FadeImage';
import { useLang, pick } from '../lib/language';
import { translateProductName } from '../lib/productNames';

// Tamil titles for the 19 INITIAL_RECIPES entries (src/data/mockData.ts),
// keyed by recipe id rather than adding a titleTa field to the shared Recipe
// type — that type is also used by RecipesPage and ProductDetailPage, and
// this keeps the translation local to where it's actually rendered here.
const RECIPE_TITLES_TA: Record<string, string> = {
  'rec-01': 'செட்டிநாடு மிளகு கோழி',
  'rec-02': 'ராயல் மட்டன் ரோகன் ஜோஷ்',
  'rec-03': 'க்ரிஸ்பி வஞ்சிரம் தவா வறுவல்',
  'rec-04': 'கோழி கல்லீரல் மிளகு வறுவல்',
  'rec-05': 'மட்டன் கல்லீரல் மசாலா',
  'rec-06': 'கடலோர மாட்டிறைச்சி வறுவல்',
  'rec-07': 'மாட்டு கல்லீரல் வறுவல்',
  'rec-08': 'மிளகு நண்டு மசாலா',
  'rec-09': 'பூண்டு வெண்ணெய் இறால் வறுவல்',
  'rec-10': 'கோழி கீமா மசாலா',
  'rec-11': 'மட்டன் கீமா மசாலா',
  'rec-12': 'க்ரிஸ்பி வறுத்த கோழி சிறகுகள்',
  'rec-13': 'கோழி லாலிபாப் வறுவல்',
  'rec-14': 'மிளகு வறுத்த காடை',
  'rec-15': 'கிரில் செய்த மட்டன் சாப்ஸ்',
  'rec-16': 'புகைபோட்ட மட்டன் ரிப்ஸ் ரோஸ்ட்',
  'rec-17': 'மட்டன் எலும்பு சூப் (பாயா)',
  'rec-18': 'பான்-சியர் செய்த சால்மன்',
  'rec-19': 'மிளகாய் பூண்டு கணவாய் வறுவல்'
};
const DIFFICULTY_TA: Record<string, string> = {
  Easy: 'எளிது',
  Medium: 'நடுத்தரம்',
  'Chef Special': 'சமையல்காரர் சிறப்பு'
};
const RECIPE_TITLES_HI: Record<string, string> = {
  'rec-01': 'चेट्टीनाड मिर्च चिकन',
  'rec-02': 'रॉयल मटन रोगन जोश',
  'rec-03': 'क्रिस्पी सुरमई तवा फ्राई',
  'rec-04': 'चिकन लिवर पेपर फ्राई',
  'rec-05': 'मटन लिवर मसाला',
  'rec-06': 'तटीय बीफ फ्राई',
  'rec-07': 'बीफ लिवर फ्राई',
  'rec-08': 'पेपर क्रैब मसाला',
  'rec-09': 'गार्लिक बटर श्रिम्प फ्राई',
  'rec-10': 'चिकन कीमा मसाला',
  'rec-11': 'मटन कीमा मसाला',
  'rec-12': 'क्रिस्पी फ्राइड चिकन विंग्स',
  'rec-13': 'चिकन लॉलीपॉप फ्राई',
  'rec-14': 'पेपर फ्राइड क्वेल',
  'rec-15': 'ग्रिल्ड मटन चॉप्स',
  'rec-16': 'स्मोक्ड मटन रिब्स रोस्ट',
  'rec-17': 'मटन बोन सूप (पाया)',
  'rec-18': 'पैन-सियर्ड सैल्मन',
  'rec-19': 'चिली गार्लिक स्क्विड फ्राई'
};
const RECIPE_TITLES_ML: Record<string, string> = {
  'rec-01': 'ചെട്ടിനാട് പെപ്പർ ചിക്കൻ',
  'rec-02': 'റോയൽ മട്ടൺ റോഗൻ ജോഷ്',
  'rec-03': 'ക്രിസ്പി വഞ്ചിരം താവ ഫ്രൈ',
  'rec-04': 'ചിക്കൻ ലിവർ പെപ്പർ ഫ്രൈ',
  'rec-05': 'മട്ടൺ ലിവർ മസാല',
  'rec-06': 'തീരദേശ ബീഫ് ഫ്രൈ',
  'rec-07': 'ബീഫ് ലിവർ ഫ്രൈ',
  'rec-08': 'പെപ്പർ ഞണ്ട് മസാല',
  'rec-09': 'ഗാർലിക് ബട്ടർ ചെമ്മീൻ ഫ്രൈ',
  'rec-10': 'ചിക്കൻ കീമ മസാല',
  'rec-11': 'മട്ടൺ കീമ മസാല',
  'rec-12': 'ക്രിസ്പി ഫ്രൈഡ് ചിക്കൻ വിംഗ്സ്',
  'rec-13': 'ചിക്കൻ ലോലിപോപ്പ് ഫ്രൈ',
  'rec-14': 'പെപ്പർ ഫ്രൈഡ് കാട',
  'rec-15': 'ഗ്രിൽഡ് മട്ടൺ ചോപ്സ്',
  'rec-16': 'സ്മോക്ഡ് മട്ടൺ റിബ്സ് റോസ്റ്റ്',
  'rec-17': 'മട്ടൺ ബോൺ സൂപ്പ് (പായ)',
  'rec-18': 'പാൻ-സിയേർഡ് സാൽമൺ',
  'rec-19': 'ചില്ലി ഗാർലിക് കണവ ഫ്രൈ'
};
const RECIPE_TITLES_TE: Record<string, string> = {
  'rec-01': 'చెట్టినాడ్ పెప్పర్ చికెన్',
  'rec-02': 'రాయల్ మటన్ రోగన్ జోష్',
  'rec-03': 'క్రిస్పీ సురమయి తవా ఫ్రై',
  'rec-04': 'చికెన్ లివర్ పెప్పర్ ఫ్రై',
  'rec-05': 'మటన్ లివర్ మసాలా',
  'rec-06': 'తీరప్రాంత బీఫ్ ఫ్రై',
  'rec-07': 'బీఫ్ లివర్ ఫ్రై',
  'rec-08': 'పెప్పర్ క్రాబ్ మసాలా',
  'rec-09': 'గార్లిక్ బటర్ రొయ్యల ఫ్రై',
  'rec-10': 'చికెన్ కీమా మసాలా',
  'rec-11': 'మటన్ కీమా మసాలా',
  'rec-12': 'క్రిస్పీ ఫ్రైడ్ చికెన్ వింగ్స్',
  'rec-13': 'చికెన్ లాలీపాప్ ఫ్రై',
  'rec-14': 'పెప్పర్ ఫ్రైడ్ క్వెయిల్',
  'rec-15': 'గ్రిల్డ్ మటన్ చాప్స్',
  'rec-16': 'స్మోక్డ్ మటన్ రిబ్స్ రోస్ట్',
  'rec-17': 'మటన్ బోన్ సూప్ (పాయా)',
  'rec-18': 'పాన్-సియర్డ్ సాల్మన్',
  'rec-19': 'చిల్లీ గార్లిక్ స్క్విడ్ ఫ్రై'
};
const DIFFICULTY_HI: Record<string, string> = { Easy: 'आसान', Medium: 'मध्यम', 'Chef Special': 'शेफ स्पेशल' };
const DIFFICULTY_ML: Record<string, string> = { Easy: 'എളുപ്പം', Medium: 'ഇടത്തരം', 'Chef Special': 'ഷെഫ് സ്പെഷ്യൽ' };
const DIFFICULTY_TE: Record<string, string> = { Easy: 'సులభం', Medium: 'మధ్యస్థం', 'Chef Special': 'చెఫ్ స్పెషల్' };

// Tamil copy for the 4 INITIAL_SUBSCRIPTION_PLANS entries, same
// keyed-by-id/local-lookup approach as RECIPE_TITLES_TA above.
const SUBSCRIPTION_PLANS_TA: Record<string, { title: string; tagline: string; itemsIncluded: string[]; savings: string; badge?: string }> = {
  'plan-01': {
    title: 'டெய்லி ஃபிட்னஸ் புரோட்டீன் பிளான்',
    tagline: 'ஜிம் புரதம் ஒருபோதும் தீராது',
    itemsIncluded: ['500g எலும்பில்லா கோழி மார்பகம்', '6 ஆர்கானிக் முட்டைகள்', 'இலவச எக்ஸ்பிரஸ் காலை டெலிவரி'],
    savings: '₹601 / மாதம் சேமிக்கவும்',
    badge: 'அதிகம் பிரபலமானது'
  },
  'plan-02': {
    title: 'வாராந்திர குடும்ப இறைச்சி பாக்ஸ்',
    tagline: 'புதிய வார இறுதி விருந்து தானாக',
    itemsIncluded: ['1kg கறி கட் கோழி', '500g மட்டன் கட்', '500g வஞ்சிரம் மீன் ஸ்டீக்ஸ்', '30 முட்டைகள் ட்ரே'],
    savings: '₹701 / மாதம் சேமிக்கவும்'
  },
  'plan-03': {
    title: 'மாதாந்திர எலைட் மீட் பாஸ்',
    tagline: 'வரம்பற்ற இலவச எக்ஸ்பிரஸ் டெலிவரிகள் + 20% தள்ளுபடி',
    itemsIncluded: ['தனிப்பயன் இறைச்சி தேர்வாளர்', 'முன்னுரிமை 20-நிமிட எக்ஸ்பிரஸ் நேரம்', 'பிரத்யேக IGO பட்லர் சேவை', '0 டெலிவரி கட்டணம்'],
    savings: '₹1201 / மாதம் சேமிக்கவும்',
    badge: 'லக்ஷரி VIP'
  },
  'plan-04': {
    title: 'பார்பிக்யூ & கிரில் பேக்',
    tagline: 'வார இறுதி கிரில்லிங்கிற்கான அனைத்தும், வெள்ளி காலை டெலிவரி',
    itemsIncluded: ['500g கோழி லாலிபாப் கட்ஸ்', '500g தந்தூரி சிக்கன் டிக்கா (மசாலா தடவப்பட்டது)', '500g மட்டன் சீக் கபாப் (மசாலா தடவப்பட்டது)', '500g செஃப் பேரி பேரி மசாலா கோழி சிறகுகள்'],
    savings: '₹601 / மாதம் சேமிக்கவும்',
    badge: 'புதியது'
  }
};

const SUBSCRIPTION_PLANS_HI: Record<string, { title: string; tagline: string; itemsIncluded: string[]; savings: string; badge?: string }> = {
  'plan-01': {
    title: 'डेली फिटनेस प्रोटीन प्लान',
    tagline: 'जिम प्रोटीन कभी खत्म नहीं होगा',
    itemsIncluded: ['500g बोनलेस चिकन ब्रेस्ट', '6 ऑर्गेनिक अंडे', 'मुफ़्त एक्सप्रेस सुबह डिलीवरी'],
    savings: '₹601 / माह बचाएं',
    badge: 'सबसे लोकप्रिय'
  },
  'plan-02': {
    title: 'साप्ताहिक फैमिली मीट बॉक्स',
    tagline: 'ताज़ा वीकेंड दावत अपने आप',
    itemsIncluded: ['1kg करी कट चिकन', '500g मटन कट', '500g सुरमई फिश स्टेक्स', '30 अंडों की ट्रे'],
    savings: '₹701 / माह बचाएं'
  },
  'plan-03': {
    title: 'मासिक एलीट मीट पास',
    tagline: 'असीमित मुफ़्त एक्सप्रेस डिलीवरी + 20% छूट',
    itemsIncluded: ['कस्टम मीट सेलेक्टर', 'प्राथमिकता 20-मिनट एक्सप्रेस स्लॉट', 'विशेष IGO बटलर सेवा', '0 डिलीवरी शुल्क'],
    savings: '₹1201 / माह बचाएं',
    badge: 'लक्ज़री VIP'
  },
  'plan-04': {
    title: 'बारबेक्यू और ग्रिल पैक',
    tagline: 'वीकेंड ग्रिलिंग के लिए सब कुछ, शुक्रवार सुबह डिलीवरी',
    itemsIncluded: ['500g चिकन लॉलीपॉप कट्स', '500g तंदूरी चिकन टिक्का (मैरिनेटेड)', '500g मटन सीक कबाब (मैरिनेटेड)', '500g शेफ पेरी पेरी मसाला चिकन विंग्स'],
    savings: '₹601 / माह बचाएं',
    badge: 'नया'
  }
};
const SUBSCRIPTION_PLANS_ML: Record<string, { title: string; tagline: string; itemsIncluded: string[]; savings: string; badge?: string }> = {
  'plan-01': {
    title: 'ഡെയ്‌ലി ഫിറ്റ്നസ് പ്രോട്ടീൻ പ്ലാൻ',
    tagline: 'ജിം പ്രോട്ടീൻ ഒരിക്കലും തീരില്ല',
    itemsIncluded: ['500g എല്ലില്ലാ ചിക്കൻ ബ്രെസ്റ്റ്', '6 ഓർഗാനിക് മുട്ട', 'സൗജന്യ എക്സ്പ്രസ് രാവിലെ ഡെലിവറി'],
    savings: '₹601 / മാസം ലാഭിക്കൂ',
    badge: 'ഏറ്റവും ജനപ്രിയം'
  },
  'plan-02': {
    title: 'വീക്ക്‌ലി ഫാമിലി മീറ്റ് ബോക്സ്',
    tagline: 'ഫ്രഷ് വാരാന്ത്യ വിരുന്ന് സ്വയമേവ',
    itemsIncluded: ['1kg കറി കട്ട് ചിക്കൻ', '500g മട്ടൺ കട്ട്', '500g വഞ്ചിരം ഫിഷ് സ്റ്റീക്സ്', '30 മുട്ട ട്രേ'],
    savings: '₹701 / മാസം ലാഭിക്കൂ'
  },
  'plan-03': {
    title: 'മന്ത്‌ലി എലൈറ്റ് മീറ്റ് പാസ്',
    tagline: 'അൺലിമിറ്റഡ് സൗജന്യ എക്സ്പ്രസ് ഡെലിവറികൾ + 20% കിഴിവ്',
    itemsIncluded: ['കസ്റ്റം മീറ്റ് സെലക്ടർ', 'മുൻഗണനാ 20-മിനിറ്റ് എക്സ്പ്രസ് സ്ലോട്ട്', 'എക്സ്ക്ലൂസീവ് IGO ബട്ലർ സേവനം', '0 ഡെലിവറി ചാർജ്'],
    savings: '₹1201 / മാസം ലാഭിക്കൂ',
    badge: 'ലക്ഷ്വറി VIP'
  },
  'plan-04': {
    title: 'ബാർബിക്യൂ & ഗ്രിൽ പാക്ക്',
    tagline: 'വാരാന്ത്യ ഗ്രില്ലിംഗിന് വേണ്ടതെല്ലാം, വെള്ളിയാഴ്ച രാവിലെ ഡെലിവറി',
    itemsIncluded: ['500g ചിക്കൻ ലോലിപോപ്പ് കട്സ്', '500g തന്തൂരി ചിക്കൻ ടിക്ക (മറിനേറ്റഡ്)', '500g മട്ടൺ സീക് കബാബ് (മറിനേറ്റഡ്)', '500g ഷെഫ് പെരി പെരി മസാല ചിക്കൻ വിംഗ്സ്'],
    savings: '₹601 / മാസം ലാഭിക്കൂ',
    badge: 'പുതിയത്'
  }
};
const SUBSCRIPTION_PLANS_TE: Record<string, { title: string; tagline: string; itemsIncluded: string[]; savings: string; badge?: string }> = {
  'plan-01': {
    title: 'డైలీ ఫిట్‌నెస్ ప్రోటీన్ ప్లాన్',
    tagline: 'జిమ్ ప్రోటీన్ ఎప్పుడూ అయిపోదు',
    itemsIncluded: ['500g ఎముక లేని చికెన్ బ్రెస్ట్', '6 ఆర్గానిక్ గుడ్లు', 'ఉచిత ఎక్స్‌ప్రెస్ ఉదయం డెలివరీ'],
    savings: '₹601 / నెల ఆదా చేయండి',
    badge: 'అత్యంత ప్రజాదరణ పొందినది'
  },
  'plan-02': {
    title: 'వీక్లీ ఫ్యామిలీ మీట్ బాక్స్',
    tagline: 'ఫ్రెష్ వారాంతపు విందు స్వయంచాలకంగా',
    itemsIncluded: ['1kg కర్రీ కట్ చికెన్', '500g మటన్ కట్', '500g సురమయి ఫిష్ స్టీక్స్', '30 గుడ్ల ట్రే'],
    savings: '₹701 / నెల ఆదా చేయండి'
  },
  'plan-03': {
    title: 'మంత్లీ ఎలైట్ మీట్ పాస్',
    tagline: 'అపరిమిత ఉచిత ఎక్స్‌ప్రెస్ డెలివరీలు + 20% తగ్గింపు',
    itemsIncluded: ['కస్టమ్ మీట్ సెలెక్టర్', 'ప్రాధాన్యత 20-నిమిషాల ఎక్స్‌ప్రెస్ స్లాట్', 'ప్రత్యేక IGO బట్లర్ సేవ', '0 డెలివరీ ఛార్జీ'],
    savings: '₹1201 / నెల ఆదా చేయండి',
    badge: 'లగ్జరీ VIP'
  },
  'plan-04': {
    title: 'బార్బెక్యూ & గ్రిల్ ప్యాక్',
    tagline: 'వారాంతపు గ్రిల్లింగ్‌కు కావలసినదంతా, శుక్రవారం ఉదయం డెలివరీ',
    itemsIncluded: ['500g చికెన్ లాలీపాప్ కట్స్', '500g తందూరీ చికెన్ టిక్కా (మెరినేటెడ్)', '500g మటన్ సీక్ కబాబ్ (మెరినేటెడ్)', '500g చెఫ్ పెరి పెరి మసాలా చికెన్ వింగ్స్'],
    savings: '₹601 / నెల ఆదా చేయండి',
    badge: 'కొత్తది'
  }
};

// Small count-up stat used in the hero — animates from 0 to its target once
// on mount, matching the "0 -> real number" counter pattern.
const AnimatedStat: React.FC<{ target: number; suffix?: string; icon: React.ElementType; label: string }> = ({
  target,
  suffix = '',
  icon: Icon,
  label
}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-emerald-600" />
      </div>
      <div>
        <div className="font-black text-lg leading-none text-[#0A1F12]">
          {value.toLocaleString()}{suffix}
        </div>
        <div className="text-[11px] text-neutral-500 font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
};

interface HomePageProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, weight: ProductWeightOption, quantity: number) => void;
  onNavigate: (path: string) => void;
  products: Product[];
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProduct,
  onAddToCart,
  onNavigate,
  products
}) => {
  const { lang, t } = useLang();
  const [activeHeroTheme, setActiveHeroTheme] = useState(0);
  const [activeCollection, setActiveCollection] = useState<'premium' | 'organic' | 'farm-fresh' | 'seafood'>('premium');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');

  // The "Top Picks For You" rail used to always show a static "Add" button,
  // even after the item was already in the cart — unlike the Category page
  // cards, which swap to a +/- stepper. This tick just forces a re-read of
  // cart quantities from storage whenever the cart changes, so that rail can
  // show the same stepper feedback.
  const [, setCartTick] = useState(0);
  useEffect(() => {
    const sync = () => setCartTick((t) => t + 1);
    window.addEventListener('protein_cuts_cart_updated', sync);
    return () => window.removeEventListener('protein_cuts_cart_updated', sync);
  }, []);

  // Refs + helper for the arrow-button carousel navigation on the
  // horizontal product strips (Today's Fresh Stock, Top Picks, Chef
  // Recommended) — supplements native touch/drag scrolling with clickable
  // prev/next controls for a more polished, desktop-friendly feel.
  const freshStockScrollRef = useRef<HTMLDivElement>(null);
  const topPicksScrollRef = useRef<HTMLDivElement>(null);
  const subscriptionScrollRef = useRef<HTMLDivElement>(null);
  const flashDealsScrollRef = useRef<HTMLDivElement>(null);
  const scrollByAmount = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.85;
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // Auto-scrolling subscription carousel — advances one card every few
  // seconds and loops back to the start once it reaches the end. Pauses
  // while the user is hovering/touching it so it never fights a manual
  // scroll or drag in progress.
  const [isSubscriptionPaused, setIsSubscriptionPaused] = useState(false);
  useEffect(() => {
    if (isSubscriptionPaused) return;
    const el = subscriptionScrollRef.current;
    if (!el) return;
    const timer = setInterval(() => {
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: el.clientWidth * 0.85, behavior: 'smooth' });
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [isSubscriptionPaused]);

  // Hero rotates through 3 brand themes — mirrors the "Total Traceability /
  // Heritage Farms / Cold-Chain Integrity" multi-story hero pattern, kept on
  // the site's established green/white/black palette.
  // Editable from /admin → Homepage → Hero. The array below is the fallback:
  // if the content block is missing, unpublished or the backend is unreachable,
  // the hero renders exactly this. See src/lib/hooks/useSiteContent.ts.
  const heroBlock = useSiteContent('home.hero', {
    autoRotateMs: 6000,
    themes: [
      {
        label: 'IGO ECOSYSTEM • FRESH CUT ON ORDER',
        headlineTop: 'PURE FARM FRESH CUTS.',
        headlineAccent: '30-90 MIN EXPRESS',
        headlineBottom: 'COLD CHAIN.',
        description:
          "Experience India's finest antibiotic-free Chicken, pasture-fed Mutton, wild seafood, and gym protein plans. Hand-trimmed by master butchers, chilled at 0-4°C, and delivered to your kitchen in 30-90 minutes."
      },
      {
        label: 'TOTAL TRACEABILITY',
        headlineTop: 'SCAN. VERIFY.',
        headlineAccent: 'TRUST EVERY',
        headlineBottom: 'CUT YOU BUY.',
        description:
          'Every pack carries a batch ID you can trace back to the exact farm, cut date, and handler — full farm-to-table transparency, not just a promise.'
      },
      {
        label: 'HERITAGE TAMIL FARMS',
        headlineTop: 'FARM-FRESH PROTEINS,',
        headlineAccent: 'TRACED',
        headlineBottom: 'EVERY STEP.',
        description:
          'Never frozen. Always fresh. Always traced. Same-day delivery from heritage farms with 100% cold-chain integrity, hand-selected from certified partner farms.'
      }
    ]
  });

  // Tamil version of the hero copy above. useSiteContent's returned value is
  // frozen in state at mount (it only updates again when real CMS content
  // loads), so passing a language-dependent fallback into it doesn't react to
  // the language toggle while already sitting on this page — the hero would
  // silently stay in whatever language was active on first render. Selecting
  // between these two arrays directly in render, keyed off `lang`, is plain
  // render-time logic and updates instantly when the Navbar language toggle
  // is clicked, matching every other translated element on the page.
  const heroThemesTa = [
    {
      label: 'IGO சூழல்-அமைப்பு • ஆர்டர் செய்தவுடன் வெட்டப்படும்',
      headlineTop: 'தூய பண்ணை நன்னீர் கட்ஸ்.',
      headlineAccent: '30-90 நிமிட எக்ஸ்பிரஸ்',
      headlineBottom: 'குளிர் சங்கிலி.',
      description:
        'இந்தியாவின் தரமான ஆன்டிபயாடிக் இல்லாத கோழி, பண்ணை ஆட்டிறைச்சி, கடல் உணவு மற்றும் ஜிம் புரத திட்டங்களை அனுபவியுங்கள். திறமையான கசாப்புக்காரர்களால் கையால் வெட்டப்பட்டு, 0-4°C இல் குளிர்விக்கப்பட்டு, 30-90 நிமிடங்களில் உங்கள் சமையலறைக்கு வழங்கப்படுகிறது.'
    },
    {
      label: 'முழுமையான கண்காணிப்பு',
      headlineTop: 'ஸ்கேன் செய். சரிபார்.',
      headlineAccent: 'ஒவ்வொரு',
      headlineBottom: 'கட்டையும் நம்புங்கள்.',
      description:
        'ஒவ்வொரு பேக்கிலும் பேட்ச் ஐடி உள்ளது — இதன் மூலம் சரியான பண்ணை, வெட்டப்பட்ட தேதி, கையாண்டவரை கண்காணிக்கலாம் — வெறும் வாக்குறுதி அல்ல, முழுமையான பண்ணை-முதல்-மேசை வெளிப்படைத்தன்மை.'
    },
    {
      label: 'பாரம்பரிய தமிழக பண்ணைகள்',
      headlineTop: 'பண்ணை-நன்னீர் புரதங்கள்,',
      headlineAccent: 'கண்காணிக்கப்பட்டவை',
      headlineBottom: 'ஒவ்வொரு கட்டத்திலும்.',
      description:
        'ஒருபோதும் உறைய வைக்கப்படாது. எப்போதும் புதியது. எப்போதும் கண்காணிக்கப்படுகிறது. சான்றளிக்கப்பட்ட பங்குதார பண்ணைகளிலிருந்து கையால் தேர்ந்தெடுக்கப்பட்டு, 100% குளிர் சங்கிலி ஒருமைப்பாட்டுடன் அதே நாள் டெலிவரி.'
    }
  ];

  const heroThemesHi = [
    {
      label: 'IGO इकोसिस्टम • ऑर्डर करते ही काटा जाता है',
      headlineTop: 'शुद्ध फार्म-फ्रेश कट्स।',
      headlineAccent: '30-90 मिनट एक्सप्रेस',
      headlineBottom: 'कोल्ड चेन।',
      description:
        'भारत के प्रीमियम एंटीबायोटिक-मुक्त चिकन, फार्म मटन, सीफूड और जिम प्रोटीन प्लान का आनंद लें। कुशल बुचरों द्वारा हाथ से काटा गया, 0-4°C पर ठंडा रखा गया, और 30-90 मिनट में आपकी रसोई तक पहुंचाया गया।'
    },
    {
      label: 'पूर्ण ट्रेसेबिलिटी',
      headlineTop: 'स्कैन करें। सत्यापित करें।',
      headlineAccent: 'हर',
      headlineBottom: 'कट पर भरोसा करें।',
      description:
        'हर पैक में एक बैच आईडी है — जिससे सटीक फार्म, काटने की तारीख, हैंडलर का पता लगाया जा सकता है — सिर्फ एक वादा नहीं, पूरी फार्म-टू-टेबल पारदर्शिता।'
    },
    {
      label: 'पारंपरिक तमिलनाडु फार्म',
      headlineTop: 'फार्म-फ्रेश प्रोटीन,',
      headlineAccent: 'ट्रैक किया गया',
      headlineBottom: 'हर कदम पर।',
      description:
        'कभी फ्रीज़ नहीं किया गया। हमेशा ताज़ा। हमेशा ट्रैक किया गया। प्रमाणित पार्टनर फार्मों से हाथ से चुना गया, 100% कोल्ड चेन अखंडता के साथ उसी दिन डिलीवरी।'
    }
  ];
  const heroThemesMl = [
    {
      label: 'IGO ഇക്കോസിസ്റ്റം • ഓർഡർ ചെയ്യുമ്പോൾ വെട്ടുന്നു',
      headlineTop: 'ശുദ്ധമായ ഫാം-ഫ്രഷ് കട്സ്.',
      headlineAccent: '30-90 മിനിറ്റ് എക്സ്പ്രസ്',
      headlineBottom: 'കോൾഡ് ചെയിൻ.',
      description:
        'ഇന്ത്യയുടെ പ്രീമിയം ആന്റിബയോട്ടിക് രഹിത ചിക്കൻ, ഫാം മട്ടൺ, സീഫുഡ്, ജിം പ്രോട്ടീൻ പ്ലാനുകൾ ആസ്വദിക്കൂ. വിദഗ്ധരായ ബുച്ചർമാർ കൈകൊണ്ട് വെട്ടി, 0-4°C-ൽ തണുപ്പിച്ച്, 30-90 മിനിറ്റിനുള്ളിൽ നിങ്ങളുടെ അടുക്കളയിലേക്ക് എത്തിക്കുന്നു.'
    },
    {
      label: 'സമ്പൂർണ്ണ ട്രെയ്സബിലിറ്റി',
      headlineTop: 'സ്കാൻ ചെയ്യുക. സ്ഥിരീകരിക്കുക.',
      headlineAccent: 'ഓരോ',
      headlineBottom: 'കട്ടിനെയും വിശ്വസിക്കൂ.',
      description:
        'ഓരോ പാക്കിലും ഒരു ബാച്ച് ഐഡി ഉണ്ട് — കൃത്യമായ ഫാം, വെട്ടിയ തീയതി, കൈകാര്യം ചെയ്തയാൾ എന്നിവ കണ്ടെത്താൻ കഴിയും — വെറും വാഗ്ദാനമല്ല, പൂർണ്ണമായ ഫാം-ടു-ടേബിൾ സുതാര്യത.'
    },
    {
      label: 'പരമ്പരാഗത തമിഴ്നാട് ഫാമുകൾ',
      headlineTop: 'ഫാം-ഫ്രഷ് പ്രോട്ടീനുകൾ,',
      headlineAccent: 'ട്രാക്ക് ചെയ്തത്',
      headlineBottom: 'ഓരോ ഘട്ടത്തിലും.',
      description:
        'ഒരിക്കലും ഫ്രീസ് ചെയ്യില്ല. എപ്പോഴും ഫ്രഷ്. എപ്പോഴും ട്രാക്ക് ചെയ്യപ്പെടുന്നു. സാക്ഷ്യപ്പെടുത്തിയ പങ്കാളി ഫാമുകളിൽ നിന്ന് കൈകൊണ്ട് തിരഞ്ഞെടുത്ത്, 100% കോൾഡ് ചെയിൻ കൃത്യതയോടെ അതേ ദിവസം ഡെലിവറി.'
    }
  ];
  const heroThemesTe = [
    {
      label: 'IGO ఎకోసిస్టమ్ • ఆర్డర్ చేసినప్పుడు కట్ చేయబడుతుంది',
      headlineTop: 'స్వచ్ఛమైన ఫామ్-ఫ్రెష్ కట్స్.',
      headlineAccent: '30-90 నిమిషాల ఎక్స్‌ప్రెస్',
      headlineBottom: 'కోల్డ్ చైన్.',
      description:
        'భారతదేశపు ప్రీమియం యాంటీబయాటిక్-రహిత చికెన్, ఫామ్ మటన్, సీఫుడ్ మరియు జిమ్ ప్రోటీన్ ప్లాన్‌లను ఆస్వాదించండి. నైపుణ్యం గల బుచర్లు చేతితో కట్ చేసి, 0-4°C వద్ద చల్లబరచి, 30-90 నిమిషాల్లో మీ వంటగదికి డెలివరీ చేస్తారు.'
    },
    {
      label: 'పూర్తి ట్రేసబిలిటీ',
      headlineTop: 'స్కాన్ చేయండి. ధృవీకరించండి.',
      headlineAccent: 'ప్రతి',
      headlineBottom: 'కట్‌ను నమ్మండి.',
      description:
        'ప్రతి ప్యాక్‌లో ఒక బ్యాచ్ ఐడి ఉంటుంది — దీని ద్వారా ఖచ్చితమైన పొలం, కట్ చేసిన తేదీ, హ్యాండ్లర్‌ను తెలుసుకోవచ్చు — కేవలం వాగ్దానం కాదు, పూర్తి ఫామ్-టు-టేబుల్ పారదర్శకత.'
    },
    {
      label: 'సాంప్రదాయ తమిళనాడు పొలాలు',
      headlineTop: 'ఫామ్-ఫ్రెష్ ప్రోటీన్లు,',
      headlineAccent: 'ట్రాక్ చేయబడినవి',
      headlineBottom: 'ప్రతి దశలోనూ.',
      description:
        'ఎప్పుడూ ఫ్రీజ్ చేయబడదు. ఎల్లప్పుడూ ఫ్రెష్. ఎల్లప్పుడూ ట్రాక్ చేయబడుతుంది. ధృవీకరించబడిన భాగస్వామి పొలాల నుండి చేతితో ఎంపిక చేయబడి, 100% కోల్డ్ చైన్ సమగ్రతతో అదే రోజు డెలివరీ.'
    }
  ];

  const heroThemes = lang === 'ta' ? heroThemesTa : lang === 'hi' ? heroThemesHi : lang === 'ml' ? heroThemesMl : lang === 'te' ? heroThemesTe : heroBlock.themes;

  useEffect(() => {
    const themeTimer = setInterval(() => {
      setActiveHeroTheme((prev) => (prev + 1) % heroThemes.length);
    }, 6000);
    return () => clearInterval(themeTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background/visual-card photos synced to the same 3 rotating hero themes
  // above — each real photo pairs with its matching story (heritage farms,
  // cold-chain facility, traceable packaging).
  // Editable from /admin → Homepage → Hero Images.
  //
  // These used to point at igo-protien-cut.vercel.app — an old, unrelated
  // Vercel project that has since been redeployed with a completely
  // different site, so that URL now 404s and every one of these images broke
  // across the whole site (hero, About page, sign-in modal, Our Farms
  // section). The original photos were recovered from an old deployment of
  // that same project and re-hosted locally under /Images/narrative so
  // nothing here depends on an external host again.
  const heroImagesBlock = useSiteContent('home.hero_images', {
    items: [
      { src: '/Images/narrative/farm.jpg', alt: 'Heritage Tamil Farms', caption: 'High Meadows Farm', sub: 'Certified heritage pastures in the Nilgiris range.' },
      { src: '/Images/narrative/facility.jpg', alt: 'Cold-Chain Integrity', caption: 'IGO Cold-Chain Facility', sub: '0-4°C sterile processing, ISO 22000 certified.' },
      { src: '/Images/narrative/packaging.jpg', alt: 'Total Traceability', caption: 'Batch-Tracked Packaging', sub: 'Insulated cold-chain bags, sealed at the point of pack.' }
    ]
  });

  // Same reasoning as heroThemesTa above — selected at render time, not
  // baked into useSiteContent's fallback, so it reacts instantly to the
  // language toggle instead of only on the next fresh page load.
  const heroImagesTa = [
    { src: '/Images/narrative/farm.jpg', alt: 'பாரம்பரிய தமிழக பண்ணைகள்', caption: 'ஹை மெடோஸ் பண்ணை', sub: 'நீலகிரி மலைத்தொடரில் சான்றளிக்கப்பட்ட பாரம்பரிய மேய்ச்சல் நிலங்கள்.' },
    { src: '/Images/narrative/facility.jpg', alt: 'குளிர் சங்கிலி ஒருமைப்பாடு', caption: 'IGO குளிர் சங்கிலி வசதி', sub: '0-4°C கிருமி நீக்க செயலாக்கம், ISO 22000 சான்றளிக்கப்பட்டது.' },
    { src: '/Images/narrative/packaging.jpg', alt: 'முழுமையான கண்காணிப்பு', caption: 'பேட்ச் கண்காணிக்கப்பட்ட பேக்கேஜிங்', sub: 'இன்சுலேட்டட் குளிர் சங்கிலி பைகள், பேக் செய்யும் இடத்திலேயே சீல் செய்யப்பட்டவை.' }
  ];

  const heroImagesHi = [
    { src: '/Images/narrative/farm.jpg', alt: 'पारंपरिक तमिलनाडु फार्म', caption: 'हाई मीडोज़ फार्म', sub: 'नीलगिरि रेंज में प्रमाणित विरासत चरागाह।' },
    { src: '/Images/narrative/facility.jpg', alt: 'कोल्ड-चेन अखंडता', caption: 'IGO कोल्ड-चेन सुविधा', sub: '0-4°C बाँझ प्रसंस्करण, ISO 22000 प्रमाणित।' },
    { src: '/Images/narrative/packaging.jpg', alt: 'पूर्ण ट्रेसेबिलिटी', caption: 'बैच-ट्रैक पैकेजिंग', sub: 'इंसुलेटेड कोल्ड-चेन बैग, पैक के समय सील किए गए।' }
  ];
  const heroImagesMl = [
    { src: '/Images/narrative/farm.jpg', alt: 'പരമ്പരാഗത തമിഴ്നാട് ഫാമുകൾ', caption: 'ഹൈ മെഡോസ് ഫാം', sub: 'നീലഗിരി മലനിരയിലെ സാക്ഷ്യപ്പെടുത്തിയ പാരമ്പര്യ മേച്ചിൽപ്പുറങ്ങൾ.' },
    { src: '/Images/narrative/facility.jpg', alt: 'കോൾഡ്-ചെയിൻ കൃത്യത', caption: 'IGO കോൾഡ്-ചെയിൻ സൗകര്യം', sub: '0-4°C സ്റ്റെറൈൽ പ്രോസസിംഗ്, ISO 22000 സാക്ഷ്യപ്പെടുത്തിയത്.' },
    { src: '/Images/narrative/packaging.jpg', alt: 'സമ്പൂർണ്ണ ട്രെയ്സബിലിറ്റി', caption: 'ബാച്ച്-ട്രാക്ക് ചെയ്ത പാക്കേജിംഗ്', sub: 'ഇൻസുലേറ്റഡ് കോൾഡ്-ചെയിൻ ബാഗുകൾ, പാക്ക് ചെയ്യുന്ന സ്ഥലത്ത് സീൽ ചെയ്തത്.' }
  ];
  const heroImagesTe = [
    { src: '/Images/narrative/farm.jpg', alt: 'సాంప్రదాయ తమిళనాడు పొలాలు', caption: 'హై మెడోస్ ఫామ్', sub: 'నీలగిరి శ్రేణిలో ధృవీకరించబడిన వారసత్వ పచ్చిక బయళ్ళు.' },
    { src: '/Images/narrative/facility.jpg', alt: 'కోల్డ్-చైన్ సమగ్రత', caption: 'IGO కోల్డ్-చైన్ సదుపాయం', sub: '0-4°C స్టెరైల్ ప్రాసెసింగ్, ISO 22000 ధృవీకరించబడింది.' },
    { src: '/Images/narrative/packaging.jpg', alt: 'పూర్తి ట్రేసబిలిటీ', caption: 'బ్యాచ్-ట్రాక్ చేయబడిన ప్యాకేజింగ్', sub: 'ఇన్సులేటెడ్ కోల్డ్-చైన్ బ్యాగులు, ప్యాక్ చేసిన చోటే సీల్ చేయబడ్డాయి.' }
  ];

  const heroImages = lang === 'ta' ? heroImagesTa : lang === 'hi' ? heroImagesHi : lang === 'ml' ? heroImagesMl : lang === 'te' ? heroImagesTe : heroImagesBlock.items;

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    setPincodeStatus('checking');
    // Real check against the serviceable-pincode list (src/lib/serviceability.ts)
    // instead of always reporting "available" — previously this ignored the
    // entered pincode entirely and just waited 700ms before saying yes.
    setTimeout(() => {
      setPincodeStatus(isPincodeServiceable(pincode) ? 'available' : 'unavailable');
    }, 700);
  };

  // Real thumbnails pulled directly from the live @igoproteincuts Instagram
  // grid (igoproteincuts, 115 followers / 1,488 posts at time of writing) —
  // replaces the earlier placeholder that was just reusing category photos.
  // Editable from /admin → Homepage → Instagram.
  //
  // `fit: 'contain'` on an item renders it uncropped — needed for text or
  // contact-info graphics, where object-cover slices the edges off.
  const instagramBlock = useSiteContent('home.instagram', {
    handle: '@igoproteincuts',
    profileUrl: 'https://www.instagram.com/igoproteincuts/',
    items: [
      { image: '/Images/instagram/post-1-shrimp.png', alt: 'Fresh tiger prawns — @igoproteincuts Instagram post' },
      { image: '/Images/instagram/post-2-eggs-reel.png', alt: 'Farm-fresh eggs reel — @igoproteincuts Instagram post' },
      { image: '/Images/instagram/post-3-order.png', alt: 'Order info post — @igoproteincuts Instagram post', fit: 'contain' },
      { image: '/Images/instagram/post-4-eggs.png', alt: 'Farm-fresh eggs — @igoproteincuts Instagram post' },
      { image: '/Images/instagram/post-5-wings.png', alt: 'Chicken wings — @igoproteincuts Instagram post' },
      { image: '/Images/instagram/post-6-chocolate.png', alt: 'Kitchen prep reel — @igoproteincuts Instagram post' }
    ]
  });

  const instagramPosts = instagramBlock.items;

  // Editable from /admin → Homepage → Stats.
  // {{productCount}} in a value stays live from the catalog.
  const statsBlock = useSiteContent('home.stats', {
    heading: 'ONE ECOSYSTEM, FROM FARM TO FORK',
    items: [
      { value: '10,000+', label: 'HAPPY CUSTOMERS' },
      { value: '0-4°C', label: 'CONTROLLED DELIVERY' },
      { value: '{{productCount}}+', label: 'FRESH PRODUCTS' }
    ]
  });
  // Tamil versions of the fallback blocks below are all selected at render
  // time via `lang === 'ta' ? X_TA : block.field` — same reasoning as
  // heroThemesTa above — so they react instantly to the Navbar toggle.
  const statsTa = {
    heading: 'ஒரே சூழல் அமைப்பு, பண்ணையிலிருந்து உணவு மேசை வரை',
    items: [
      { value: '10,000+', label: 'மகிழ்ச்சியான வாடிக்கையாளர்கள்' },
      { value: '0-4°C', label: 'கட்டுப்படுத்தப்பட்ட டெலிவரி' },
      { value: '{{productCount}}+', label: 'புதிய பொருட்கள்' }
    ]
  };
  const statsHi = {
    heading: 'एक इकोसिस्टम, फार्म से थाली तक',
    items: [
      { value: '10,000+', label: 'खुश ग्राहक' },
      { value: '0-4°C', label: 'नियंत्रित डिलीवरी' },
      { value: '{{productCount}}+', label: 'ताज़े उत्पाद' }
    ]
  };
  const statsMl = {
    heading: 'ഒരു ഇക്കോസിസ്റ്റം, ഫാം മുതൽ പ്ലേറ്റ് വരെ',
    items: [
      { value: '10,000+', label: 'സന്തുഷ്ട ഉപഭോക്താക്കൾ' },
      { value: '0-4°C', label: 'നിയന്ത്രിത ഡെലിവറി' },
      { value: '{{productCount}}+', label: 'ഫ്രഷ് ഉൽപ്പന്നങ്ങൾ' }
    ]
  };
  const statsTe = {
    heading: 'ఒకే ఎకోసిస్టమ్, పొలం నుండి ప్లేట్ వరకు',
    items: [
      { value: '10,000+', label: 'సంతోషకరమైన కస్టమర్లు' },
      { value: '0-4°C', label: 'నియంత్రిత డెలివరీ' },
      { value: '{{productCount}}+', label: 'ఫ్రెష్ ఉత్పత్తులు' }
    ]
  };
  const statsResolved = lang === 'ta' ? statsTa : lang === 'hi' ? statsHi : lang === 'ml' ? statsMl : lang === 'te' ? statsTe : statsBlock;

  // Ambient backdrop photography for each subscription plan card — reuses
  // real product photography already shot for this site (no stock/Pinterest
  // imagery), picked to match what's actually inside that plan.
  const subscriptionPlanImages: Record<string, string> = {
    'plan-01': '/Images/banners/plan-fitness-banner.jpg',
    'plan-02': '/Images/banners/plan-family-banner.jpg',
    'plan-03': '/Images/banners/plan-elite-banner.jpg',
    'plan-04': '/Images/banners/plan-bbq-banner.jpg'
  };
  const subscriptionPlanIcons: Record<string, React.ElementType> = {
    'plan-01': Dumbbell,
    'plan-02': Users,
    'plan-03': Crown,
    'plan-04': Flame
  };

  // Seasonal spotlight banner slides — turned from one static offer into a
  // rotating carousel (arrow nav + dot pagination, matching the multi-offer
  // promo-banner pattern used across meat-delivery sites). Every slide is a
  // real, already-established fact/offer from elsewhere on this site
  // (Combo Offers "up to 20% off", Subscription "save up to ₹1,200/month",
  // and the "Free delivery above ₹499" promo tile) — nothing invented here.
  // Editable from /admin → Homepage → Promo Slides.
  const promoBlock = useSiteContent('home.promo_slides', {
    autoRotateMs: 4500,
    items: [
    {
      eyebrow: 'Seasonal Pick',
      title: 'Monsoon Special:',
      titleAccent: 'Crispy Wings',
      copy: 'Rainy-day cravings, sorted — fresh-cut chicken wings, hand-trimmed to order and delivered in 30-90 minutes.',
      badgeLine1: 'Starts From',
      badgeLine2: '₹129',
      cta: 'Order Now',
      path: '/search?q=Wings',
      image: '/Images/banners/promo-wings-banner.jpg',
      alt: 'Monsoon Special crispy chicken wings'
    },
    {
      eyebrow: 'Subscriber Perk',
      title: 'Subscribe &',
      titleAccent: 'Save ₹1,200/Month',
      copy: 'Recurring orders unlock zero delivery fees and priority morning delivery slots — set it once, stay stocked automatically.',
      badgeLine1: 'Save Up To',
      badgeLine2: '₹1,200/mo',
      cta: 'Explore Plans',
      path: '/subscriptions',
      image: '/Images/banners/promo-subscriber-banner.jpg',
      alt: 'IGO subscription — whole chicken'
    },
    {
      eyebrow: 'Free Delivery',
      title: 'On All Orders',
      titleAccent: 'Above ₹499',
      copy: 'No minimum-order stress — cross ₹499 and delivery is free, on every category, every time.',
      badgeLine1: 'Free Above',
      badgeLine2: '₹499',
      cta: 'Start Shopping',
      path: '/search',
      image: '/Images/banners/promo-free-delivery-banner.jpg',
      alt: 'Farm-fresh eggs — free delivery above ₹499'
    }
    ]
  });

  const promoSlidesTa = [
    {
      eyebrow: 'பருவகால தேர்வு',
      title: 'மழைக்கால சிறப்பு:',
      titleAccent: 'க்ரிஸ்பி விங்க்ஸ்',
      copy: 'மழை நாள் ஆசைகளுக்கு தீர்வு — புதிதாக வெட்டப்பட்ட கோழி சிறகுகள், ஆர்டருக்கு ஏற்ப கையால் வெட்டப்பட்டு 30-90 நிமிடங்களில் டெலிவரி.',
      badgeLine1: 'தொடங்குகிறது',
      badgeLine2: '₹129',
      cta: 'இப்போது ஆர்டர் செய்யுங்கள்',
      path: '/search?q=Wings',
      image: '/Images/banners/promo-wings-banner.jpg',
      alt: 'Monsoon Special crispy chicken wings'
    },
    {
      eyebrow: 'சந்தா சலுகை',
      title: 'சந்தா செய்து',
      titleAccent: 'மாதம் ₹1,200 சேமிக்கவும்',
      copy: 'தொடர் ஆர்டர்கள் பூஜ்ஜிய டெலிவரி கட்டணம் மற்றும் முன்னுரிமை காலை டெலிவரி நேரங்களைத் திறக்கும் — ஒருமுறை அமைத்து, தானாகவே நிரப்பப்படும்.',
      badgeLine1: 'இதுவரை சேமிக்கவும்',
      badgeLine2: '₹1,200/mo',
      cta: 'திட்டங்களை ஆராயுங்கள்',
      path: '/subscriptions',
      image: '/Images/banners/promo-subscriber-banner.jpg',
      alt: 'IGO subscription — whole chicken'
    },
    {
      eyebrow: 'இலவச டெலிவரி',
      title: 'அனைத்து ஆர்டர்களிலும்',
      titleAccent: '₹499 க்கு மேல்',
      copy: 'குறைந்தபட்ச ஆர்டர் கவலை இல்லை — ₹499 தாண்டினால் டெலிவரி இலவசம், எல்லா வகைகளிலும், எப்போதும்.',
      badgeLine1: 'இலவசம்',
      badgeLine2: '₹499',
      cta: 'ஷாப்பிங் தொடங்குங்கள்',
      path: '/search',
      image: '/Images/banners/promo-free-delivery-banner.jpg',
      alt: 'Farm-fresh eggs — free delivery above ₹499'
    }
  ];

  const promoSlidesHi = [
    {
      eyebrow: 'सीज़नल पिक',
      title: 'मानसून स्पेशल:',
      titleAccent: 'क्रिस्पी विंग्स',
      copy: 'बारिश के दिन की क्रेविंग सुलझी — ताज़ा कटे चिकन विंग्स, ऑर्डर पर हाथ से काटे गए और 30-90 मिनट में डिलीवर।',
      badgeLine1: 'शुरू होता है',
      badgeLine2: '₹129',
      cta: 'अभी ऑर्डर करें',
      path: '/search?q=Wings',
      image: '/Images/banners/promo-wings-banner.jpg',
      alt: 'Monsoon Special crispy chicken wings'
    },
    {
      eyebrow: 'सब्सक्राइबर लाभ',
      title: 'सब्सक्राइब करें और',
      titleAccent: '₹1,200/माह बचाएं',
      copy: 'रिकरिंग ऑर्डर से मुफ़्त डिलीवरी और प्राथमिकता सुबह डिलीवरी स्लॉट मिलते हैं — एक बार सेट करें, अपने आप स्टॉक बना रहे।',
      badgeLine1: 'इतना बचाएं',
      badgeLine2: '₹1,200/माह',
      cta: 'प्लान देखें',
      path: '/subscriptions',
      image: '/Images/banners/promo-subscriber-banner.jpg',
      alt: 'IGO subscription — whole chicken'
    },
    {
      eyebrow: 'मुफ़्त डिलीवरी',
      title: 'सभी ऑर्डर पर',
      titleAccent: '₹499 से ऊपर',
      copy: 'न्यूनतम ऑर्डर की चिंता नहीं — ₹499 पार करें और डिलीवरी मुफ़्त, हर श्रेणी पर, हर बार।',
      badgeLine1: 'मुफ़्त',
      badgeLine2: '₹499 से ऊपर',
      cta: 'शॉपिंग शुरू करें',
      path: '/search',
      image: '/Images/banners/promo-free-delivery-banner.jpg',
      alt: 'Farm-fresh eggs — free delivery above ₹499'
    }
  ];
  const promoSlidesMl = [
    {
      eyebrow: 'സീസൺ പിക്ക്',
      title: 'മൺസൂൺ സ്പെഷ്യൽ:',
      titleAccent: 'ക്രിസ്പി വിംഗ്സ്',
      copy: 'മഴക്കാല ആഗ്രഹങ്ങൾക്ക് പരിഹാരം — ഫ്രഷ് കട്ട് ചിക്കൻ വിംഗ്സ്, ഓർഡറിന് അനുസരിച്ച് കൈകൊണ്ട് വെട്ടി 30-90 മിനിറ്റിനുള്ളിൽ ഡെലിവർ.',
      badgeLine1: 'ആരംഭിക്കുന്നു',
      badgeLine2: '₹129',
      cta: 'ഇപ്പോൾ ഓർഡർ ചെയ്യുക',
      path: '/search?q=Wings',
      image: '/Images/banners/promo-wings-banner.jpg',
      alt: 'Monsoon Special crispy chicken wings'
    },
    {
      eyebrow: 'സബ്സ്ക്രൈബർ ആനുകൂല്യം',
      title: 'സബ്സ്ക്രൈബ് ചെയ്ത്',
      titleAccent: '₹1,200/മാസം ലാഭിക്കൂ',
      copy: 'ആവർത്തന ഓർഡറുകൾ സൗജന്യ ഡെലിവറിയും മുൻഗണനാ രാവിലെ ഡെലിവറി സ്ലോട്ടുകളും തുറക്കുന്നു — ഒരിക്കൽ സജ്ജമാക്കുക, സ്വയമേവ സ്റ്റോക്ക് ചെയ്യുക.',
      badgeLine1: 'ലാഭിക്കൂ',
      badgeLine2: '₹1,200/മാസം',
      cta: 'പ്ലാനുകൾ കാണുക',
      path: '/subscriptions',
      image: '/Images/banners/promo-subscriber-banner.jpg',
      alt: 'IGO subscription — whole chicken'
    },
    {
      eyebrow: 'സൗജന്യ ഡെലിവറി',
      title: 'എല്ലാ ഓർഡറുകളിലും',
      titleAccent: '₹499-ന് മുകളിൽ',
      copy: 'മിനിമം ഓർഡർ ടെൻഷൻ ഇല്ല — ₹499 കടന്നാൽ ഡെലിവറി സൗജന്യം, എല്ലാ വിഭാഗത്തിലും, എപ്പോഴും.',
      badgeLine1: 'സൗജന്യം',
      badgeLine2: '₹499-ന് മുകളിൽ',
      cta: 'ഷോപ്പിംഗ് ആരംഭിക്കൂ',
      path: '/search',
      image: '/Images/banners/promo-free-delivery-banner.jpg',
      alt: 'Farm-fresh eggs — free delivery above ₹499'
    }
  ];
  const promoSlidesTe = [
    {
      eyebrow: 'సీజనల్ పిక్',
      title: 'రుతుపవన ప్రత్యేకం:',
      titleAccent: 'క్రిస్పీ వింగ్స్',
      copy: 'వర్షాకాల కోరికలకు పరిష్కారం — ఫ్రెష్ కట్ చికెన్ వింగ్స్, ఆర్డర్‌కు అనుగుణంగా చేతితో కట్ చేసి 30-90 నిమిషాల్లో డెలివరీ.',
      badgeLine1: 'ప్రారంభం',
      badgeLine2: '₹129',
      cta: 'ఇప్పుడే ఆర్డర్ చేయండి',
      path: '/search?q=Wings',
      image: '/Images/banners/promo-wings-banner.jpg',
      alt: 'Monsoon Special crispy chicken wings'
    },
    {
      eyebrow: 'సబ్‌స్క్రైబర్ ప్రయోజనం',
      title: 'సబ్‌స్క్రైబ్ చేసి',
      titleAccent: '₹1,200/నెల ఆదా చేయండి',
      copy: 'పునరావృత ఆర్డర్లు ఉచిత డెలివరీ మరియు ప్రాధాన్యత ఉదయం డెలివరీ స్లాట్‌లను అన్‌లాక్ చేస్తాయి — ఒకసారి సెట్ చేయండి, స్వయంచాలకంగా స్టాక్ చేయబడుతుంది.',
      badgeLine1: 'ఆదా చేయండి',
      badgeLine2: '₹1,200/నెల',
      cta: 'ప్లాన్‌లను చూడండి',
      path: '/subscriptions',
      image: '/Images/banners/promo-subscriber-banner.jpg',
      alt: 'IGO subscription — whole chicken'
    },
    {
      eyebrow: 'ఉచిత డెలివరీ',
      title: 'అన్ని ఆర్డర్లపై',
      titleAccent: '₹499 పైన',
      copy: 'కనీస ఆర్డర్ ఒత్తిడి లేదు — ₹499 దాటితే డెలివరీ ఉచితం, ప్రతి వర్గంలోనూ, ప్రతిసారీ.',
      badgeLine1: 'ఉచితం',
      badgeLine2: '₹499 పైన',
      cta: 'షాపింగ్ ప్రారంభించండి',
      path: '/search',
      image: '/Images/banners/promo-free-delivery-banner.jpg',
      alt: 'Farm-fresh eggs — free delivery above ₹499'
    }
  ];

  const promoSlides = lang === 'ta' ? promoSlidesTa : lang === 'hi' ? promoSlidesHi : lang === 'ml' ? promoSlidesMl : lang === 'te' ? promoSlidesTe : promoBlock.items;

  // Editable from /admin → Homepage → Ticker strip.
  const tickerBlock = useSiteContent('home.ticker', {
    items: [
      { label: '30-Min Express Delivery' },
      { label: '100% Antibiotic-Free' },
      { label: '0-4°C Cold Chain' },
      { label: 'Free Delivery Above ₹499' }
    ]
  });
  const tickerTa = {
    items: [
      { label: '30 நிமிட எக்ஸ்பிரஸ் டெலிவரி' },
      { label: '100% ஆன்டிபயாடிக் இல்லாதது' },
      { label: '0-4°C குளிர் சங்கிலி' },
      { label: '₹499 க்கு மேல் இலவச டெலிவரி' }
    ]
  };
  const tickerHi = {
    items: [
      { label: '30-मिनट एक्सप्रेस डिलीवरी' },
      { label: '100% एंटीबायोटिक-मुक्त' },
      { label: '0-4°C कोल्ड चेन' },
      { label: '₹499 से ऊपर मुफ़्त डिलीवरी' }
    ]
  };
  const tickerMl = {
    items: [
      { label: '30-മിനിറ്റ് എക്സ്പ്രസ് ഡെലിവറി' },
      { label: '100% ആന്റിബയോട്ടിക് രഹിതം' },
      { label: '0-4°C കോൾഡ് ചെയിൻ' },
      { label: '₹499-ന് മുകളിൽ സൗജന്യ ഡെലിവറി' }
    ]
  };
  const tickerTe = {
    items: [
      { label: '30-నిమిషాల ఎక్స్‌ప్రెస్ డెలివరీ' },
      { label: '100% యాంటీబయాటిక్-రహిత' },
      { label: '0-4°C కోల్డ్ చైన్' },
      { label: '₹499 పైన ఉచిత డెలివరీ' }
    ]
  };
  const tickerResolved = lang === 'ta' ? tickerTa : lang === 'hi' ? tickerHi : lang === 'ml' ? tickerMl : lang === 'te' ? tickerTe : tickerBlock;

  // Rail + section headings — editable from /admin → Homepage.
  const categoriesHeading = useSiteContent('home.section_categories', {
    eyebrow: 'The IGO Farm Network',
    heading: 'Farm to Fork, the IGO Way',
    subheading:
      "From fresh cuts to eggs, marinades, and pantry staples — everything here is sourced straight from IGO's own farms, never through a broker.",
    badge: '30-90 Minute Express Delivery'
  });
  const categoriesHeadingTa = {
    eyebrow: 'IGO பண்ணை நெட்வொர்க்',
    heading: 'பண்ணையிலிருந்து உணவு மேசை வரை, IGO முறையில்',
    subheading:
      'புதிய கட்ஸ் முதல் முட்டைகள், மசாலா கலவைகள் மற்றும் சமையலறைப் பொருட்கள் வரை — இங்குள்ள அனைத்தும் IGO-வின் சொந்த பண்ணைகளிலிருந்து நேரடியாக பெறப்படுகிறது, தரகர் மூலம் அல்ல.',
    badge: '30-90 நிமிட எக்ஸ்பிரஸ் டெலிவரி'
  };
  const categoriesHeadingHi = {
    eyebrow: 'IGO फार्म नेटवर्क',
    heading: 'फार्म से थाली तक, IGO के तरीके से',
    subheading:
      'ताज़े कट्स से लेकर अंडे, मैरिनेड और पेंट्री स्टेपल्स तक — यहां सब कुछ सीधे IGO के अपने फार्मों से आता है, कभी किसी बिचौलिए के माध्यम से नहीं।',
    badge: '30-90 मिनट एक्सप्रेस डिलीवरी'
  };
  const categoriesHeadingMl = {
    eyebrow: 'IGO ഫാം നെറ്റ്‌വർക്ക്',
    heading: 'ഫാമിൽ നിന്ന് പ്ലേറ്റിലേക്ക്, IGO രീതിയിൽ',
    subheading:
      'ഫ്രഷ് കട്സ് മുതൽ മുട്ട, മറിനേഡുകൾ, പാൻട്രി സാധനങ്ങൾ വരെ — ഇവിടെയുള്ളതെല്ലാം IGO-യുടെ സ്വന്തം ഫാമുകളിൽ നിന്ന് നേരിട്ട് ലഭിക്കുന്നു, ഒരിക്കലും ഒരു ബ്രോക്കർ വഴിയല്ല.',
    badge: '30-90 മിനിറ്റ് എക്സ്പ്രസ് ഡെലിവറി'
  };
  const categoriesHeadingTe = {
    eyebrow: 'IGO ఫామ్ నెట్‌వర్క్',
    heading: 'పొలం నుండి ప్లేట్ వరకు, IGO పద్ధతిలో',
    subheading:
      'ఫ్రెష్ కట్స్ నుండి గుడ్లు, మెరినేడ్‌లు, పాంట్రీ వస్తువుల వరకు — ఇక్కడ ఉన్నదంతా IGO సొంత పొలాల నుండి నేరుగా వస్తుంది, ఎప్పుడూ బ్రోకర్ ద్వారా కాదు.',
    badge: '30-90 నిమిషాల ఎక్స్‌ప్రెస్ డెలివరీ'
  };
  const categoriesHeadingResolved = lang === 'ta' ? categoriesHeadingTa : lang === 'hi' ? categoriesHeadingHi : lang === 'ml' ? categoriesHeadingMl : lang === 'te' ? categoriesHeadingTe : categoriesHeading;

  const topPicksHeading = useSiteContent('home.rail_top_picks', {
    eyebrow: 'MOST POPULAR CUTS',
    heading: 'Top Picks For You',
    viewAllLabel: 'View All',
    viewAllPath: '/search'
  });
  const topPicksHeadingTa = {
    eyebrow: 'மிகவும் பிரபலமான கட்ஸ்',
    heading: 'உங்களுக்கான சிறந்த தேர்வுகள்',
    viewAllLabel: 'அனைத்தையும் காண்க',
    viewAllPath: '/search'
  };
  const topPicksHeadingHi = { eyebrow: 'सबसे लोकप्रिय कट्स', heading: 'आपके लिए टॉप पिक्स', viewAllLabel: 'सभी देखें', viewAllPath: '/search' };
  const topPicksHeadingMl = { eyebrow: 'ഏറ്റവും ജനപ്രിയമായ കട്സ്', heading: 'നിങ്ങൾക്കായുള്ള ടോപ് പിക്സ്', viewAllLabel: 'എല്ലാം കാണുക', viewAllPath: '/search' };
  const topPicksHeadingTe = { eyebrow: 'అత్యంత ప్రజాదరణ పొందిన కట్స్', heading: 'మీ కోసం టాప్ పిక్స్', viewAllLabel: 'అన్నీ చూడండి', viewAllPath: '/search' };
  const topPicksHeadingResolved = lang === 'ta' ? topPicksHeadingTa : lang === 'hi' ? topPicksHeadingHi : lang === 'ml' ? topPicksHeadingMl : lang === 'te' ? topPicksHeadingTe : topPicksHeading;

  const freshStockHeading = useSiteContent('home.rail_fresh_stock', {
    eyebrow: 'CUT FRESH THIS MORNING',
    heading: "Today's Fresh Stock",
    viewAllLabel: 'View All',
    viewAllPath: '/search'
  });
  const freshStockHeadingTa = {
    eyebrow: 'இன்று காலை புதிதாக வெட்டப்பட்டது',
    heading: 'இன்றைய புதிய கையிருப்பு',
    viewAllLabel: 'அனைத்தையும் காண்க',
    viewAllPath: '/search'
  };
  const freshStockHeadingHi = { eyebrow: 'आज सुबह ताज़ा काटा गया', heading: 'आज का ताज़ा स्टॉक', viewAllLabel: 'सभी देखें', viewAllPath: '/search' };
  const freshStockHeadingMl = { eyebrow: 'ഇന്ന് രാവിലെ ഫ്രഷ് ആയി വെട്ടിയത്', heading: 'ഇന്നത്തെ ഫ്രഷ് സ്റ്റോക്ക്', viewAllLabel: 'എല്ലാം കാണുക', viewAllPath: '/search' };
  const freshStockHeadingTe = { eyebrow: 'ఈరోజు ఉదయం ఫ్రెష్‌గా కట్ చేయబడింది', heading: 'నేటి ఫ్రెష్ స్టాక్', viewAllLabel: 'అన్నీ చూడండి', viewAllPath: '/search' };
  const freshStockHeadingResolved = lang === 'ta' ? freshStockHeadingTa : lang === 'hi' ? freshStockHeadingHi : lang === 'ml' ? freshStockHeadingMl : lang === 'te' ? freshStockHeadingTe : freshStockHeading;

  const valuePropsBlock = useSiteContent('home.value_props', {
    items: [
      { icon: 'Truck', title: 'Fast Delivery', text: 'Reliable cold-chain delivery in 30-90 minutes.' },
      { icon: 'Award', title: 'Premium Quality', text: 'ISO 22000 & HACCP-certified standard.' },
      { icon: 'Tag', title: 'Best Prices', text: 'Real bulk-order and subscription savings.' },
      { icon: 'Leaf', title: 'Sustainable', text: "Sourced through IGO's own farm network." }
    ]
  });
  const valuePropsTa = {
    items: [
      { icon: 'Truck', title: 'விரைவு டெலிவரி', text: 'நம்பகமான குளிர் சங்கிலி டெலிவரி 30-90 நிமிடங்களில்.' },
      { icon: 'Award', title: 'உயர்தர தரம்', text: 'ISO 22000 & HACCP சான்றளிக்கப்பட்ட தரநிலை.' },
      { icon: 'Tag', title: 'சிறந்த விலைகள்', text: 'உண்மையான மொத்த ஆர்டர் மற்றும் சந்தா சேமிப்பு.' },
      { icon: 'Leaf', title: 'நிலைத்தன்மை', text: 'IGO-வின் சொந்த பண்ணை நெட்வொர்க் மூலம் பெறப்படுகிறது.' }
    ]
  };
  const valuePropsHi = {
    items: [
      { icon: 'Truck', title: 'तेज़ डिलीवरी', text: '30-90 मिनट में विश्वसनीय कोल्ड-चेन डिलीवरी।' },
      { icon: 'Award', title: 'प्रीमियम गुणवत्ता', text: 'ISO 22000 और HACCP-प्रमाणित मानक।' },
      { icon: 'Tag', title: 'बेहतरीन कीमतें', text: 'असली बल्क-ऑर्डर और सब्सक्रिप्शन बचत।' },
      { icon: 'Leaf', title: 'टिकाऊ', text: 'IGO के अपने फार्म नेटवर्क के माध्यम से प्राप्त।' }
    ]
  };
  const valuePropsMl = {
    items: [
      { icon: 'Truck', title: 'വേഗത്തിലുള്ള ഡെലിവറി', text: '30-90 മിനിറ്റിനുള്ളിൽ വിശ്വസനീയമായ കോൾഡ്-ചെയിൻ ഡെലിവറി.' },
      { icon: 'Award', title: 'പ്രീമിയം ഗുണനിലവാരം', text: 'ISO 22000 & HACCP-സാക്ഷ്യപ്പെടുത്തിയ നിലവാരം.' },
      { icon: 'Tag', title: 'മികച്ച വിലകൾ', text: 'യഥാർത്ഥ ബൾക്ക്-ഓർഡർ, സബ്സ്ക്രിപ്ഷൻ ലാഭം.' },
      { icon: 'Leaf', title: 'സുസ്ഥിരം', text: 'IGO-യുടെ സ്വന്തം ഫാം നെറ്റ്‌വർക്ക് വഴി ലഭിക്കുന്നത്.' }
    ]
  };
  const valuePropsTe = {
    items: [
      { icon: 'Truck', title: 'వేగవంతమైన డెలివరీ', text: '30-90 నిమిషాల్లో నమ్మకమైన కోల్డ్-చైన్ డెలివరీ.' },
      { icon: 'Award', title: 'ప్రీమియం నాణ్యత', text: 'ISO 22000 & HACCP-ధృవీకరించబడిన ప్రమాణం.' },
      { icon: 'Tag', title: 'ఉత్తమ ధరలు', text: 'నిజమైన బల్క్-ఆర్డర్ మరియు సబ్‌స్క్రిప్షన్ పొదుపులు.' },
      { icon: 'Leaf', title: 'సుస్థిరమైనది', text: 'IGO సొంత ఫామ్ నెట్‌వర్క్ ద్వారా సేకరించబడింది.' }
    ]
  };
  const valuePropsResolved = lang === 'ta' ? valuePropsTa : lang === 'hi' ? valuePropsHi : lang === 'ml' ? valuePropsMl : lang === 'te' ? valuePropsTe : valuePropsBlock;

  const chefHeading = useSiteContent('home.rail_chef_picks', {
    eyebrow: 'HAND-PICKED BY OUR BUTCHERS',
    heading: 'Chef Recommended Cuts',
    viewAllLabel: 'View All',
    viewAllPath: '/recipes'
  });
  const chefHeadingTa = {
    eyebrow: 'எங்கள் கசாப்புக்காரர்களால் தேர்ந்தெடுக்கப்பட்டது',
    heading: 'சமையல்காரர் பரிந்துரைக்கும் கட்ஸ்',
    viewAllLabel: 'அனைத்தையும் காண்க',
    viewAllPath: '/recipes'
  };
  const chefHeadingHi = { eyebrow: 'हमारे बुचरों द्वारा हाथ से चुना गया', heading: 'शेफ अनुशंसित कट्स', viewAllLabel: 'सभी देखें', viewAllPath: '/recipes' };
  const chefHeadingMl = { eyebrow: 'ഞങ്ങളുടെ ബുച്ചർമാർ കൈകൊണ്ട് തിരഞ്ഞെടുത്തത്', heading: 'ഷെഫ് ശുപാർശ ചെയ്യുന്ന കട്സ്', viewAllLabel: 'എല്ലാം കാണുക', viewAllPath: '/recipes' };
  const chefHeadingTe = { eyebrow: 'మా బుచర్లు చేతితో ఎంపిక చేసినవి', heading: 'చెఫ్ సిఫార్సు చేసిన కట్స్', viewAllLabel: 'అన్నీ చూడండి', viewAllPath: '/recipes' };
  const chefHeadingResolved = lang === 'ta' ? chefHeadingTa : lang === 'hi' ? chefHeadingHi : lang === 'ml' ? chefHeadingMl : lang === 'te' ? chefHeadingTe : chefHeading;

  const [activePromoSlide, setActivePromoSlide] = useState(0);
  const [isPromoPaused, setIsPromoPaused] = useState(false);
  useEffect(() => {
    if (isPromoPaused) return;
    const timer = setInterval(() => {
      setActivePromoSlide((prev) => (prev + 1) % promoSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPromoPaused, promoSlides.length]);

  // Curated down to genuine PRODUCT categories only — Subscriptions, Gift
  // Boxes, Offers & Deals and Recipes are site features/pages (already
  // reachable via Navbar/Footer), not product categories, so they were
  // pulled out of this grid. Also fixed two image mismatches while here:
  // Ready to Cook was pointing at an unverified Unsplash stock photo, and
  // Combo Packs was accidentally showing the Country Chicken product photo.
  // Editable from /admin → Homepage → Categories.
  //
  // Icons are stored as NAMES in the content block (jsonb can't hold a React
  // component) and resolved through src/lib/iconMap.ts. Two counts used to be
  // computed from the live catalog; they're now editable text, with
  // {{marinatedCount}} / {{premiumCount}} available if you want them dynamic.
  const categoriesBlock = useSiteContent('home.categories', {
    items: [
      { title: 'Fresh Chicken', path: '/category/chicken', icon: 'Drumstick', count: '16 Cuts', image: '/Images/chicken-whole.png', badge: 'Bestseller' },
      { title: 'Goat Mutton', path: '/category/mutton', icon: 'Beef', count: '12 Cuts', image: '/Images/Meat Images/Mutton/Mutton curry.jpg' },
      { title: 'Premium Beef', path: '/category/beef', icon: 'Beef', count: '9 Cuts', image: '/Images/Meat Images/Beef/Ribeye Steak.jpg' },
      { title: 'Fish', path: '/category/fish', icon: 'Fish', count: '16 Varieties', image: '/Images/seer-fish.png' },
      { title: 'Sun-Dried Fish', path: '/category/dry-fish', icon: 'Sun', count: 'Karuvadu Picks', image: '/Images/Meat Images/Fish/Anchovy.jpg' },
      { title: 'Farm Eggs', path: '/category/eggs', icon: 'Egg', count: '6 Varieties', image: '/Images/eggs.png' },
      { title: 'Ready to Cook', path: '/category/ready-to-cook', icon: 'UtensilsCrossed', count: '5 Specials', image: '/Images/Meat Images/Chicken/Chicken Wings.jpg' },
      { title: 'Marinated Items', path: '/search?q=Marinated', icon: 'Flame', count: '{{marinatedCount}} Marinated Picks', image: '/Images/Meat Images/Chicken/Chicken Wings.jpg' },
      { title: 'Premium Cuts', path: '/search?q=Premium', icon: 'Award', count: '{{premiumCount}}+ Premium Picks', image: '/Images/Meat Images/Beef/Ribeye Steak.jpg' },
      { title: 'Frozen Food', path: '/category/frozen-food', icon: 'Snowflake', count: '4 Freezer Picks', image: '/Images/Meat Images/Fish/Salmon Fillet.jpg' },
      { title: 'Biryani Kits', path: '/category/biryani', icon: 'ChefHat', count: '3 Kits', image: '/Images/mutton-curry.png', badge: 'NEW' },
      { title: 'Cold Cuts', path: '/category/cold-cuts', icon: 'Sandwich', count: '4 Deli Picks', image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg' },
      { title: 'Combo Packs', path: '/category/combo-packs', icon: 'Gift', count: '20% Off', image: '/Images/chicken-breast.png', badge: 'NEW' }
    ]
  });
  const categoriesBlockTa = {
    items: [
      { title: 'புதிய கோழி', path: '/category/chicken', icon: 'Drumstick', count: '16 வகைகள்', image: '/Images/chicken-whole.png', badge: 'அதிகம் விற்பனையானது' },
      { title: 'ஆட்டு இறைச்சி', path: '/category/mutton', icon: 'Beef', count: '12 வகைகள்', image: '/Images/Meat Images/Mutton/Mutton curry.jpg' },
      { title: 'பிரீமியம் மாட்டிறைச்சி', path: '/category/beef', icon: 'Beef', count: '9 வகைகள்', image: '/Images/Meat Images/Beef/Ribeye Steak.jpg' },
      { title: 'மீன்', path: '/category/fish', icon: 'Fish', count: '16 வகைகள்', image: '/Images/seer-fish.png' },
      { title: 'கருவாடு', path: '/category/dry-fish', icon: 'Sun', count: 'கருவாடு தேர்வுகள்', image: '/Images/Meat Images/Fish/Anchovy.jpg' },
      { title: 'பண்ணை முட்டைகள்', path: '/category/eggs', icon: 'Egg', count: '6 வகைகள்', image: '/Images/eggs.png' },
      { title: 'ரெடி டு குக்', path: '/category/ready-to-cook', icon: 'UtensilsCrossed', count: '5 சிறப்புகள்', image: '/Images/Meat Images/Chicken/Chicken Wings.jpg' },
      { title: 'மசாலா தடவப்பட்டவை', path: '/search?q=Marinated', icon: 'Flame', count: '{{marinatedCount}} மசாலா தேர்வுகள்', image: '/Images/Meat Images/Chicken/Chicken Wings.jpg' },
      { title: 'பிரீமியம் கட்ஸ்', path: '/search?q=Premium', icon: 'Award', count: '{{premiumCount}}+ பிரீமியம் தேர்வுகள்', image: '/Images/Meat Images/Beef/Ribeye Steak.jpg' },
      { title: 'உறைந்த உணவு', path: '/category/frozen-food', icon: 'Snowflake', count: '4 ஃப்ரீசர் தேர்வுகள்', image: '/Images/Meat Images/Fish/Salmon Fillet.jpg' },
      { title: 'பிரியாணி கிட்ஸ்', path: '/category/biryani', icon: 'ChefHat', count: '3 கிட்ஸ்', image: '/Images/mutton-curry.png', badge: 'புதியது' },
      { title: 'கோல்ட் கட்ஸ்', path: '/category/cold-cuts', icon: 'Sandwich', count: '4 டெலி தேர்வுகள்', image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg' },
      { title: 'காம்போ பேக்குகள்', path: '/category/combo-packs', icon: 'Gift', count: '20% தள்ளுபடி', image: '/Images/chicken-breast.png', badge: 'புதியது' }
    ]
  };

  const categoriesBlockHi = {
    items: [
      { title: 'ताज़ा चिकन', path: '/category/chicken', icon: 'Drumstick', count: '16 कट्स', image: '/Images/chicken-whole.png', badge: 'बेस्टसेलर' },
      { title: 'बकरी का मटन', path: '/category/mutton', icon: 'Beef', count: '12 कट्स', image: '/Images/Meat Images/Mutton/Mutton curry.jpg' },
      { title: 'प्रीमियम बीफ', path: '/category/beef', icon: 'Beef', count: '9 कट्स', image: '/Images/Meat Images/Beef/Ribeye Steak.jpg' },
      { title: 'मछली', path: '/category/fish', icon: 'Fish', count: '16 किस्में', image: '/Images/seer-fish.png' },
      { title: 'सूखी मछली', path: '/category/dry-fish', icon: 'Sun', count: 'करुवाडु पिक्स', image: '/Images/Meat Images/Fish/Anchovy.jpg' },
      { title: 'फार्म अंडे', path: '/category/eggs', icon: 'Egg', count: '6 किस्में', image: '/Images/eggs.png' },
      { title: 'रेडी टू कुक', path: '/category/ready-to-cook', icon: 'UtensilsCrossed', count: '5 स्पेशल', image: '/Images/Meat Images/Chicken/Chicken Wings.jpg' },
      { title: 'मैरिनेटेड आइटम', path: '/search?q=Marinated', icon: 'Flame', count: '{{marinatedCount}} मैरिनेटेड पिक्स', image: '/Images/Meat Images/Chicken/Chicken Wings.jpg' },
      { title: 'प्रीमियम कट्स', path: '/search?q=Premium', icon: 'Award', count: '{{premiumCount}}+ प्रीमियम पिक्स', image: '/Images/Meat Images/Beef/Ribeye Steak.jpg' },
      { title: 'फ्रोज़न फूड', path: '/category/frozen-food', icon: 'Snowflake', count: '4 फ्रीज़र पिक्स', image: '/Images/Meat Images/Fish/Salmon Fillet.jpg' },
      { title: 'बिरयानी किट', path: '/category/biryani', icon: 'ChefHat', count: '3 किट', image: '/Images/mutton-curry.png', badge: 'नया' },
      { title: 'कोल्ड कट्स', path: '/category/cold-cuts', icon: 'Sandwich', count: '4 डेली पिक्स', image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg' },
      { title: 'कॉम्बो पैक', path: '/category/combo-packs', icon: 'Gift', count: '20% छूट', image: '/Images/chicken-breast.png', badge: 'नया' }
    ]
  };
  const categoriesBlockMl = {
    items: [
      { title: 'ഫ്രഷ് ചിക്കൻ', path: '/category/chicken', icon: 'Drumstick', count: '16 കട്സ്', image: '/Images/chicken-whole.png', badge: 'ബെസ്റ്റ്സെല്ലർ' },
      { title: 'ആട് മട്ടൺ', path: '/category/mutton', icon: 'Beef', count: '12 കട്സ്', image: '/Images/Meat Images/Mutton/Mutton curry.jpg' },
      { title: 'പ്രീമിയം ബീഫ്', path: '/category/beef', icon: 'Beef', count: '9 കട്സ്', image: '/Images/Meat Images/Beef/Ribeye Steak.jpg' },
      { title: 'മീൻ', path: '/category/fish', icon: 'Fish', count: '16 ഇനങ്ങൾ', image: '/Images/seer-fish.png' },
      { title: 'ഉണക്ക മീൻ', path: '/category/dry-fish', icon: 'Sun', count: 'കരുവാടു പിക്സ്', image: '/Images/Meat Images/Fish/Anchovy.jpg' },
      { title: 'ഫാം മുട്ട', path: '/category/eggs', icon: 'Egg', count: '6 ഇനങ്ങൾ', image: '/Images/eggs.png' },
      { title: 'റെഡി ടു കുക്ക്', path: '/category/ready-to-cook', icon: 'UtensilsCrossed', count: '5 സ്പെഷ്യൽസ്', image: '/Images/Meat Images/Chicken/Chicken Wings.jpg' },
      { title: 'മറിനേറ്റഡ് ഇനങ്ങൾ', path: '/search?q=Marinated', icon: 'Flame', count: '{{marinatedCount}} മറിനേറ്റഡ് പിക്സ്', image: '/Images/Meat Images/Chicken/Chicken Wings.jpg' },
      { title: 'പ്രീമിയം കട്സ്', path: '/search?q=Premium', icon: 'Award', count: '{{premiumCount}}+ പ്രീമിയം പിക്സ്', image: '/Images/Meat Images/Beef/Ribeye Steak.jpg' },
      { title: 'ഫ്രോസൺ ഫുഡ്', path: '/category/frozen-food', icon: 'Snowflake', count: '4 ഫ്രീസർ പിക്സ്', image: '/Images/Meat Images/Fish/Salmon Fillet.jpg' },
      { title: 'ബിരിയാണി കിറ്റുകൾ', path: '/category/biryani', icon: 'ChefHat', count: '3 കിറ്റുകൾ', image: '/Images/mutton-curry.png', badge: 'പുതിയത്' },
      { title: 'കോൾഡ് കട്സ്', path: '/category/cold-cuts', icon: 'Sandwich', count: '4 ഡെലി പിക്സ്', image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg' },
      { title: 'കോംബോ പാക്കുകൾ', path: '/category/combo-packs', icon: 'Gift', count: '20% കിഴിവ്', image: '/Images/chicken-breast.png', badge: 'പുതിയത്' }
    ]
  };
  const categoriesBlockTe = {
    items: [
      { title: 'ఫ్రెష్ చికెన్', path: '/category/chicken', icon: 'Drumstick', count: '16 కట్స్', image: '/Images/chicken-whole.png', badge: 'బెస్ట్‌సెల్లర్' },
      { title: 'మేక మటన్', path: '/category/mutton', icon: 'Beef', count: '12 కట్స్', image: '/Images/Meat Images/Mutton/Mutton curry.jpg' },
      { title: 'ప్రీమియం బీఫ్', path: '/category/beef', icon: 'Beef', count: '9 కట్స్', image: '/Images/Meat Images/Beef/Ribeye Steak.jpg' },
      { title: 'చేప', path: '/category/fish', icon: 'Fish', count: '16 రకాలు', image: '/Images/seer-fish.png' },
      { title: 'ఎండు చేపలు', path: '/category/dry-fish', icon: 'Sun', count: 'కరువాడు పిక్స్', image: '/Images/Meat Images/Fish/Anchovy.jpg' },
      { title: 'ఫామ్ గుడ్లు', path: '/category/eggs', icon: 'Egg', count: '6 రకాలు', image: '/Images/eggs.png' },
      { title: 'రెడీ టు కుక్', path: '/category/ready-to-cook', icon: 'UtensilsCrossed', count: '5 స్పెషల్స్', image: '/Images/Meat Images/Chicken/Chicken Wings.jpg' },
      { title: 'మెరినేటెడ్ ఐటమ్స్', path: '/search?q=Marinated', icon: 'Flame', count: '{{marinatedCount}} మెరినేటెడ్ పిక్స్', image: '/Images/Meat Images/Chicken/Chicken Wings.jpg' },
      { title: 'ప్రీమియం కట్స్', path: '/search?q=Premium', icon: 'Award', count: '{{premiumCount}}+ ప్రీమియం పిక్స్', image: '/Images/Meat Images/Beef/Ribeye Steak.jpg' },
      { title: 'ఫ్రోజెన్ ఫుడ్', path: '/category/frozen-food', icon: 'Snowflake', count: '4 ఫ్రీజర్ పిక్స్', image: '/Images/Meat Images/Fish/Salmon Fillet.jpg' },
      { title: 'బిర్యానీ కిట్స్', path: '/category/biryani', icon: 'ChefHat', count: '3 కిట్స్', image: '/Images/mutton-curry.png', badge: 'కొత్తది' },
      { title: 'కోల్డ్ కట్స్', path: '/category/cold-cuts', icon: 'Sandwich', count: '4 డెలి పిక్స్', image: '/Images/Meat Images/Chicken/Chicken Breast Boneless.jpg' },
      { title: 'కాంబో ప్యాక్‌లు', path: '/category/combo-packs', icon: 'Gift', count: '20% తగ్గింపు', image: '/Images/chicken-breast.png', badge: 'కొత్తది' }
    ]
  };

  const categoryTokens = {
    productCount: products.length,
    marinatedCount: products.filter((p) => /marinated/i.test(p.name)).length,
    premiumCount: products.filter(
      (p) => /premium/i.test(p.name) || /premium/i.test(p.description)
    ).length
  };

  const resolvedCategoriesBlock =
    lang === 'ta' ? categoriesBlockTa : lang === 'hi' ? categoriesBlockHi : lang === 'ml' ? categoriesBlockMl : lang === 'te' ? categoriesBlockTe : categoriesBlock;
  const categoryCards = resolvedCategoriesBlock.items.map((item) => ({
    ...item,
    icon: resolveIcon(item.icon),
    count: renderToken(item.count ?? '', categoryTokens)
  }));

  const bestSellers = products.filter((p) => p.isBestSeller);
  const flashDeals = products.filter((p) => p.isFlashOffer || p.discountPercentage >= 14);

  // Today's Fresh Stock — cut fresh this morning
  const todaysFreshStock = products.filter((p) => p.isTodayFresh).slice(0, 10);

  // Curated Collections — Premium / Organic / Farm Fresh / Seafood
  const collectionTabs: { id: 'premium' | 'organic' | 'farm-fresh' | 'seafood'; label: string; icon: React.ElementType }[] =
    lang === 'ta'
      ? [
          { id: 'premium', label: 'பிரீமியம் தொகுப்பு', icon: Crown },
          { id: 'organic', label: 'ஆர்கானிக் தொகுப்பு', icon: Leaf },
          { id: 'farm-fresh', label: 'இன்றைய பண்ணை நன்னீர்', icon: Sun },
          { id: 'seafood', label: 'கடல் உணவு தொகுப்பு', icon: Waves }
        ]
      : lang === 'hi'
      ? [
          { id: 'premium', label: 'प्रीमियम संग्रह', icon: Crown },
          { id: 'organic', label: 'ऑर्गेनिक संग्रह', icon: Leaf },
          { id: 'farm-fresh', label: 'आज का फार्म फ्रेश', icon: Sun },
          { id: 'seafood', label: 'सीफूड संग्रह', icon: Waves }
        ]
      : lang === 'ml'
      ? [
          { id: 'premium', label: 'പ്രീമിയം ശേഖരം', icon: Crown },
          { id: 'organic', label: 'ഓർഗാനിക് ശേഖരം', icon: Leaf },
          { id: 'farm-fresh', label: 'ഇന്നത്തെ ഫാം ഫ്രഷ്', icon: Sun },
          { id: 'seafood', label: 'സീഫുഡ് ശേഖരം', icon: Waves }
        ]
      : lang === 'te'
      ? [
          { id: 'premium', label: 'ప్రీమియం సేకరణ', icon: Crown },
          { id: 'organic', label: 'ఆర్గానిక్ సేకరణ', icon: Leaf },
          { id: 'farm-fresh', label: 'ఈరోజు ఫార్మ్ ఫ్రెష్', icon: Sun },
          { id: 'seafood', label: 'సీఫుడ్ సేకరణ', icon: Waves }
        ]
      : [
          { id: 'premium', label: 'Premium Collection', icon: Crown },
          { id: 'organic', label: 'Organic Collection', icon: Leaf },
          { id: 'farm-fresh', label: 'Farm Fresh Today', icon: Sun },
          { id: 'seafood', label: 'Seafood Collection', icon: Waves }
        ];
  const collectionsMap: Record<string, Product[]> = {
    premium: products.filter((p) => p.rating >= 4.9 || p.category === 'beef').slice(0, 8),
    organic: products.filter((p) => p.freshnessGrade === 'Organic Farm' || p.freshnessGrade === '100% Antibiotic-Free').slice(0, 8),
    'farm-fresh': products.filter((p) => p.isTodayFresh).slice(0, 8),
    seafood: products.filter((p) => p.category === 'fish' || p.category === 'dry-fish').slice(0, 8)
  };
  const activeCollectionProducts = collectionsMap[activeCollection] || [];

  // Chef Recommended — products with a curated recipe pairing
  const chefRecommended = products.filter((p) => !!p.recipePairing).slice(0, 4);

  // ---------------------------------------------------------------------
  // Section order below is deliberately alternating: one "About IGO / Trust"
  // section, then one "Product" section, repeated down the page — never a
  // whole batch of IGO content followed by a whole batch of product content.
  // Combo Packs & Offers gets its own dedicated product-type section
  // (separate from the general category/collection grids), per request.
  // ---------------------------------------------------------------------
  return (
    <div className="space-y-16 pb-16">
      {/* ============ 1. HERO BANNER ============ */}
      {/* Hero — full-bleed crossfading farm photography behind a white
          gradient, matching the IGO Protein Cuts flagship hero. */}
      <section className="relative min-h-screen flex items-center pt-8 pb-16 overflow-hidden bg-white border-b border-neutral-200">
        {/* Crossfading Background Photo Carousel */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, idx) => (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === activeHeroTheme ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover object-center ${idx === activeHeroTheme ? 'animate-kenburns' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/10 lg:from-white/98 lg:via-white/80 lg:to-white/10" />
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Text Column — `min-w-0` is required here: grid/flex items
              default to `min-width: auto`, which lets an unbreakable-looking
              content width (the big bold headline) force this column wider
              than the viewport instead of wrapping, and the section's own
              `overflow-hidden` then clips it instead of letting it wrap —
              exactly the "text cut off on mobile" symptom. */}
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 bg-[#0F7B3A]/10 border border-[#0F7B3A]/20 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#0F7B3A] animate-pulse" />
                <span className="text-[10px] sm:text-xs font-bold text-[#0F7B3A] uppercase tracking-wider">
                  Delivering in 30-90 mins · Free above ₹499
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-1.5 rounded-full shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-[10px] sm:text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  FSSAI Certified · Antibiotic-Free
                </span>
              </div>
            </div>

            <div key={activeHeroTheme} className="animate-fadeIn">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-8 bg-[#D4AF37]" />
                <span className="text-[#D4AF37] font-bold text-[10px] uppercase tracking-[0.2em]">
                  {heroThemes[activeHeroTheme].label}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#0A1F12] leading-[1.05] mb-4 tracking-tighter">
                {heroThemes[activeHeroTheme].headlineTop}
                <br />
                <span className="text-[#0F7B3A]">{heroThemes[activeHeroTheme].headlineAccent}</span>{' '}
                {heroThemes[activeHeroTheme].headlineBottom}
              </h1>

              <p className="text-neutral-600 text-sm sm:text-base max-w-lg mb-5 leading-relaxed font-medium">
                {heroThemes[activeHeroTheme].description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className="w-4 h-4 fill-[#0F7B3A] text-[#0F7B3A]" />
                ))}
              </div>
              <span className="font-bold text-[#0A1F12] text-sm">4.9</span>
              <span className="text-neutral-400 text-xs">
                {pick(lang, { en: 'from 12,000+ verified reviews', ta: '12,000+ சான்றளிக்கப்பட்ட மதிப்புரைகளிலிருந்து', hi: '12,000+ सत्यापित समीक्षाओं से', ml: '12,000+ സ്ഥിരീകരിച്ച അവലോകനങ്ങളിൽ നിന്ന്', te: '12,000+ ధృవీకరించిన సమీక్షల నుండి' })}
              </span>
            </div>

            {/* Pincode Checker */}
            <form onSubmit={handleCheckPincode} className="mb-6">
              <div className="flex gap-2 max-w-xs">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder={pick(lang, { en: 'Enter pincode', ta: 'பின்கோடு உள்ளிடவும்', hi: 'पिनकोड दर्ज करें', ml: 'പിൻകോഡ് നൽകുക', te: 'పిన్‌కోడ్ నమోదు చేయండి' })}
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value);
                      setPincodeStatus('idle');
                    }}
                    className="w-full pl-9 pr-4 py-2.5 border-2 border-neutral-200 rounded-xl text-sm font-medium focus:border-[#0F7B3A] focus:outline-none transition-colors bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!pincode.trim()}
                  className="px-4 py-2.5 bg-[#0F7B3A] text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {pincodeStatus === 'checking'
                    ? pick(lang, { en: 'Checking…', ta: 'சரிபார்க்கிறது…', hi: 'जांच रहे हैं…', ml: 'പരിശോധിക്കുന്നു…', te: 'తనిఖీ చేస్తోంది…' })
                    : pick(lang, { en: 'Check', ta: 'சரிபார்', hi: 'जांचें', ml: 'പരിശോധിക്കുക', te: 'తనిఖీ చేయండి' })}
                </button>
              </div>
              {pincodeStatus === 'available' && (
                <p className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {pick(lang, {
                    en: `Great news — we deliver to ${pincode}!`,
                    ta: `நல்ல செய்தி — நாங்கள் ${pincode} க்கு டெலிவரி செய்கிறோம்!`,
                    hi: `अच्छी खबर — हम ${pincode} पर डिलीवर करते हैं!`,
                    ml: `സന്തോഷവാർത്ത — ഞങ്ങൾ ${pincode}-ലേക്ക് ഡെലിവർ ചെയ്യുന്നു!`,
                    te: `శుభవార్త — మేము ${pincode}కు డెలివరీ చేస్తాము!`
                  })}
                </p>
              )}
              {pincodeStatus === 'unavailable' && (
                <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  {pick(lang, {
                    en: `Sorry, we don't deliver to ${pincode} yet. We currently serve Bengaluru only.`,
                    ta: `மன்னிக்கவும், நாங்கள் இன்னும் ${pincode} க்கு டெலிவரி செய்யவில்லை. தற்போது பெங்களூரு மட்டும் சேவை செய்கிறோம்.`,
                    hi: `क्षमा करें, हम अभी ${pincode} पर डिलीवर नहीं करते। हम फ़िलहाल केवल बेंगलुरु में सेवा देते हैं।`,
                    ml: `ക്ഷമിക്കണം, ഞങ്ങൾ ഇതുവരെ ${pincode}-ലേക്ക് ഡെലിവർ ചെയ്യുന്നില്ല. ഞങ്ങൾ നിലവിൽ ബെംഗളൂരുവിൽ മാത്രമേ സേവനം നൽകുന്നുള്ളൂ.`,
                    te: `క్షమించండి, మేము ఇంకా ${pincode}కు డెలివరీ చేయడం లేదు. మేము ప్రస్తుతం బెంగళూరులో మాత్రమే సేవలందిస్తున్నాము.`
                  })}
                </p>
              )}
            </form>

            {/* Live Stat Counters */}
            <div className="grid grid-cols-3 gap-4 mb-7 max-w-md">
              <AnimatedStat target={10000} suffix="+" icon={Sparkles} label={pick(lang, { en: 'Happy Customers', ta: 'மகிழ்ச்சியான வாடிக்கையாளர்கள்', hi: 'खुश ग्राहक', ml: 'സന്തുഷ്ട ഉപഭോക്താക്കൾ', te: 'సంతోషకరమైన కస్టమర్లు' })} />
              <AnimatedStat target={products.length} suffix="+" icon={Package} label={pick(lang, { en: 'Fresh Cuts Available', ta: 'கிடைக்கும் புதிய கட்ஸ்', hi: 'उपलब्ध फ्रेश कट्स', ml: 'ലഭ്യമായ ഫ്രഷ് കട്സ്', te: 'అందుబాటులో ఉన్న ఫ్రెష్ కట్స్' })} />
              <AnimatedStat target={100} suffix="%" icon={ShieldCheck} label={pick(lang, { en: 'Cold Chain', ta: 'குளிர் சங்கிலி', hi: 'कोल्ड चेन', ml: 'കോൾഡ് ചെയിൻ', te: 'కోల్డ్ చైన్' })} />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('/search')}
                className="group bg-[#0F7B3A] text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-900/20 active:scale-95 text-sm cursor-pointer"
              >
                {pick(lang, { en: 'Shop Fresh Now', ta: 'இப்போது ஷாப் செய்யுங்கள்', hi: 'अभी शॉप करें', ml: 'ഇപ്പോൾ ഷോപ്പ് ചെയ്യൂ', te: 'ఇప్పుడే షాప్ చేయండి' })} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('/b2b')}
                className="bg-white/80 backdrop-blur-sm text-[#0A1F12] border-2 border-neutral-200 px-6 py-3.5 rounded-2xl font-bold hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all active:scale-95 text-sm cursor-pointer"
              >
                {pick(lang, { en: 'B2B Bulk Orders', ta: 'மொத்த வர்த்தக ஆர்டர்கள்', hi: 'B2B बल्क ऑर्डर', ml: 'B2B ബൾക്ക് ഓർഡറുകൾ', te: 'B2B బల్క్ ఆర్డర్లు' })}
              </button>
            </div>

            {/* Highlight Icons */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-xs font-semibold text-neutral-500">
              {(lang === 'ta'
                ? [
                    { icon: Clock3, label: 'தினமும் புதியது' },
                    { icon: CheckCircle2, label: 'ஹலால் சான்றளிக்கப்பட்டது' },
                    { icon: Package, label: 'சுகாதாரமாக பேக் செய்யப்பட்டது' },
                    { icon: Truck, label: 'விரைவு டெலிவரி' }
                  ]
                : lang === 'hi'
                ? [
                    { icon: Clock3, label: 'रोज़ाना ताज़ा' },
                    { icon: CheckCircle2, label: 'हलाल प्रमाणित' },
                    { icon: Package, label: 'स्वच्छता से पैक' },
                    { icon: Truck, label: 'तेज़ डिलीवरी' }
                  ]
                : lang === 'ml'
                ? [
                    { icon: Clock3, label: 'ദിവസവും ഫ്രഷ്' },
                    { icon: CheckCircle2, label: 'ഹലാൽ സാക്ഷ്യപ്പെടുത്തിയത്' },
                    { icon: Package, label: 'ശുചിത്വത്തോടെ പാക്ക് ചെയ്തത്' },
                    { icon: Truck, label: 'വേഗത്തിലുള്ള ഡെലിവറി' }
                  ]
                : lang === 'te'
                ? [
                    { icon: Clock3, label: 'ప్రతిరోజూ ఫ్రెష్' },
                    { icon: CheckCircle2, label: 'హలాల్ ధృవీకరించబడింది' },
                    { icon: Package, label: 'పరిశుభ్రంగా ప్యాక్ చేయబడింది' },
                    { icon: Truck, label: 'వేగవంతమైన డెలివరీ' }
                  ]
                : [
                    { icon: Clock3, label: 'Fresh Daily' },
                    { icon: CheckCircle2, label: 'Halal Certified' },
                    { icon: Package, label: 'Hygienically Packed' },
                    { icon: Truck, label: 'Fast Delivery' }
                  ]
              ).map((item) => (
                <span key={item.label} className="flex items-center gap-1.5">
                  <item.icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right Visual Card — desktop only, rotates with the same 3 photos */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-[520px]">
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-4/3">
                {heroImages.map((img, idx) => (
                  <div
                    key={img.src}
                    className={`absolute inset-0 transition-opacity duration-700 ${idx === activeHeroTheme ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <FadeImage src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {/* pl-44 keeps this clear of the "Delivery Time" badge
                        floating over the bottom-left corner below — without
                        it, the badge sat on top of this caption text and
                        customers couldn't read it (e.g. "IGO Cold-Chain
                        Facility" was hidden behind the green badge). */}
                    <div className="absolute bottom-5 left-5 right-5 pl-44">
                      <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{img.alt}</span>
                      <p className="text-white font-black text-lg mt-0.5 leading-tight">{img.caption}</p>
                    </div>
                  </div>
                ))}

                {/* Prev/Next arrows — previously only the dot indicators
                    below could change the photo; there was no explicit
                    forward/back control. */}
                <button
                  onClick={() => setActiveHeroTheme((activeHeroTheme - 1 + heroImages.length) % heroImages.length)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-[#0A1F12] shadow-md transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveHeroTheme((activeHeroTheme + 1) % heroImages.length)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-[#0A1F12] shadow-md transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Verified Origin Badge — previously placed *inside* the
                  overflow-hidden image card above with a negative offset
                  meant to make it "float" outside the card's corner. The
                  overflow-hidden on the parent clipped it instead, cutting
                  the badge off and running it into the caption text
                  underneath on narrower widths. Moving it here, as a sibling
                  of the image card rather than a child, keeps the same
                  floating-corner look without being clipped. */}
              <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/60 max-w-[200px] z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 bg-[#0F7B3A]/10 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-[#0F7B3A]" />
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-widest text-neutral-400">Verified Origin</span>
                </div>
                <p className="text-xs font-bold text-[#0A1F12] leading-tight">{heroImages[activeHeroTheme].caption}</p>
                <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">{heroImages[activeHeroTheme].sub}</p>
              </div>

              {/* Delivery Time Badge — same fix as Verified Origin above. */}
              <div className="absolute -bottom-4 -left-4 bg-[#0F7B3A] text-white px-4 py-3 rounded-2xl shadow-lg shadow-emerald-900/30 flex items-center gap-2.5 z-10">
                <Truck className="w-5 h-5" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Delivery Time</p>
                  <p className="font-black text-sm">30-90 Minutes</p>
                </div>
              </div>

              {/* Dot Indicators */}
              <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex gap-1.5">
                {heroImages.map((img, idx) => (
                  <button
                    key={img.src}
                    onClick={() => setActiveHeroTheme(idx)}
                    aria-label={`Show ${img.alt}`}
                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                      idx === activeHeroTheme ? 'w-6 bg-[#0F7B3A]' : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ============ 2. CATEGORIES ============ */}
      {/* Categories grid, directly below the hero */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{categoriesHeadingResolved.eyebrow}</div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{categoriesHeadingResolved.heading}</h2>
            <p className="text-xs text-neutral-500 mt-1">{categoriesHeadingResolved.subheading}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-full shrink-0">
              <Bike className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">{categoriesHeadingResolved.badge}</span>
            </div>
            <button
              onClick={() => onNavigate('/category/chicken')}
              className="text-xs font-bold text-neutral-500 hover:text-emerald-600 flex items-center gap-1 transition cursor-pointer shrink-0"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-8">
          {categoryCards.map((cat) => (
            <button
              key={cat.title}
              onClick={() => onNavigate(cat.path)}
              className="group flex flex-col items-center gap-2.5 cursor-pointer transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-neutral-100 border-2 border-white ring-1 ring-neutral-200 group-hover:ring-emerald-400 shadow-sm group-hover:shadow-md transition duration-300">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                {cat.badge && (
                  <span
                    className={`absolute -top-1 -right-1 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm border border-white ${
                      cat.badge === 'NEW'
                        ? 'bg-[#0F7B3A] text-white'
                        : cat.badge === 'HOT'
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-emerald-700'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#0A1F12] group-hover:text-emerald-600 transition text-center line-clamp-1">
                {cat.title}
              </h3>
            </button>
          ))}
        </div>
      </section>
      </Reveal>
      {/* ============ 3. WHY CHOOSE US ============ */}
      {/* "Why IGO?" banner — stat badges and the four value pillars unified
          into one green section, all in the same round-badge visual
          language, instead of a separate dark card grid underneath. Stats
          and claims are the same ones we already stand behind elsewhere on
          the site — no invented claims. */}
      <Reveal>
      <section className="bg-[#0F7B3A] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-10">
          <div>
            <h2 className="text-white font-black text-2xl sm:text-3xl tracking-tight leading-none">
              {pick(lang, { en: 'Why IGO?', ta: 'ஏன் IGO?', hi: 'IGO क्यों?', ml: 'എന്തുകൊണ്ട് IGO?', te: 'ఎందుకు IGO?' })}
            </h2>
            <p className="text-white/70 text-xs font-bold mt-2 uppercase tracking-widest">{statsResolved.heading}</p>
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-10">
            {statsResolved.items.map((badge) => (
              <div key={badge.label} className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-4 border-white/25 flex flex-col items-center justify-center text-center shadow-md shrink-0">
                  <span className="text-[#0A1F12] font-black text-sm sm:text-base leading-none">
                    {renderToken(badge.value, { productCount: products.length })}
                  </span>
                </div>
                <span className="text-white/85 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-tight text-center w-20 sm:w-24">{badge.label}</span>
              </div>
            ))}
          </div>

          <div className="w-16 h-px bg-white/25" />

          <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-8 sm:gap-x-10">
            {valuePropsResolved.items
              .map((item, idx) => ({
                icon: resolveIcon(item.icon),
                title: item.title,
                body: item.text,
                // The first card carries the gold ring on the live page.
                highlight: idx === 0
              }))
              .map((pillar) => (
              <div key={pillar.title} className="flex flex-col items-center gap-2.5 w-32 sm:w-36 shrink-0">
                <div
                  className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md shrink-0 ${
                    pillar.highlight ? 'ring-4 ring-[#D4AF37]' : 'ring-4 ring-white/25'
                  }`}
                >
                  <pillar.icon className={pillar.highlight ? 'w-6 h-6 text-[#D4AF37]' : 'w-6 h-6 text-[#0F7B3A]'} />
                </div>
                <h3 className="text-white font-black text-xs uppercase tracking-wider text-center leading-tight">{pillar.title}</h3>
                <p className="text-white/70 text-[11px] leading-snug text-center">{pillar.body}</p>
              </div>
              ))}
          </div>
        </div>
      </section>
      </Reveal>
      {/* IGO #2 — Why Choose IGO (comparison table, trust pillars,
          certifications, live batch trace tool — all in one section). */}
      {/* ============ 4. BEST SELLERS ============ */}
      {/* Top Picks For You */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
              <Flame className="w-4 h-4 fill-emerald-600" /> {topPicksHeadingResolved.eyebrow}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{topPicksHeadingResolved.heading}</h2>
          </div>
          <button
            onClick={() => onNavigate(topPicksHeadingResolved.viewAllPath || '/search')}
            className="text-xs font-bold text-neutral-500 hover:text-emerald-600 flex items-center gap-1 transition cursor-pointer shrink-0"
          >
            {topPicksHeadingResolved.viewAllLabel} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative group/carousel">
          <div ref={topPicksScrollRef} className="flex items-stretch gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1 scroll-smooth">
            {bestSellers.map((product) => {
              const weight = product.weightOptions[0];
              // Previously this rail's "Add" button skipped the stock check
              // that ProductCard.tsx/BrowseProductCard.tsx already enforce,
              // so a Sold Out product could still be added from here.
              const isOutOfStock = product.stockStatus === 'Out of Stock';
              const cartQty = StoreService.getCartQuantity(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group/card relative shrink-0 w-40 sm:w-48 bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
                >
                  <div className="relative aspect-square bg-neutral-100 overflow-hidden">
                    <img src={product.image} alt={translateProductName(product.id, product.name, lang)} referrerPolicy="no-referrer" className={`w-full h-full object-cover group-hover/card:scale-110 transition duration-500 ${isOutOfStock ? 'grayscale opacity-70' : ''}`} />
                    {isOutOfStock ? (
                      <span className="absolute top-2 left-2 bg-[#0A1F12] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {pick(lang, { en: 'Out of Stock', ta: 'கையிருப்பில் இல்லை', hi: 'स्टॉक खत्म', ml: 'സ്റ്റോക്ക് ഇല്ല', te: 'స్టాక్ లేదు' })}
                      </span>
                    ) : product.discountPercentage > 0 && (
                      <span className="absolute top-2 left-2 bg-[#0F7B3A] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {product.discountPercentage}% {pick(lang, { en: 'OFF', ta: 'தள்ளுபடி', hi: 'छूट', ml: 'കിഴിവ്', te: 'తగ్గింపు' })}
                      </span>
                    )}
                    {/* Quick Shop hover overlay — desktop only */}
                    <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover/card:bg-black/30 transition items-end justify-center opacity-0 group-hover/card:opacity-100 pb-3">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        className="bg-white text-[#0A1F12] text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg translate-y-2 group-hover/card:translate-y-0 transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> {pick(lang, { en: 'QUICK VIEW', ta: 'விரைவு பார்வை', hi: 'क्विक व्यू', ml: 'ക്വിക്ക് വ്യൂ', te: 'క్విక్ వ్యూ' })}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3 className="text-xs font-bold text-[#0A1F12] line-clamp-2 leading-snug">{translateProductName(product.id, product.name, lang)}</h3>
                      <p className="text-[10px] text-neutral-500 mt-1">{weight?.pieces || product.subcategory}</p>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-500 mt-0.5">
                        <Weight className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{weight?.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 gap-1">
                      <div className="min-w-0">
                        <span className="text-sm font-black text-[#0A1F12]">₹{weight?.price ?? product.basePrice}</span>
                        {weight && weight.originalPrice > weight.price && (
                          <span className="text-[10px] text-neutral-400 line-through ml-1">₹{weight.originalPrice}</span>
                        )}
                      </div>
                      {!isOutOfStock && cartQty > 0 ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-full overflow-hidden shrink-0"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              StoreService.adjustCartQuantity(product.id, weight.label, -1);
                            }}
                            aria-label="Decrease quantity"
                            className="w-6 h-6 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] font-black text-[#0A1F12] px-1">{cartQty}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              StoreService.adjustCartQuantity(product.id, weight.label, 1);
                            }}
                            aria-label="Increase quantity"
                            className="w-6 h-6 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isOutOfStock) return;
                            onAddToCart(product, weight, 1);
                          }}
                          disabled={isOutOfStock}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition shrink-0 ${
                            isOutOfStock
                              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                              : 'bg-[#0F7B3A] hover:bg-emerald-500 text-white cursor-pointer'
                          }`}
                        >
                          {isOutOfStock ? t('soldOut') : t('addToCart')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Arrow navigation — desktop only, fades in on hover of the carousel */}
          <button
            onClick={() => scrollByAmount(topPicksScrollRef, 'left')}
            aria-label="Scroll left"
            className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/carousel:opacity-100 transition cursor-pointer z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollByAmount(topPicksScrollRef, 'right')}
            aria-label="Scroll right"
            className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/carousel:opacity-100 transition cursor-pointer z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
      </Reveal>
      <Reveal><TrustSection /></Reveal>
      {/* ============ 5. TODAY'S FRESH STOCK ============ */}
      {/* Sits directly below the certifications strip inside TrustSection, per request */}
      {todaysFreshStock.length > 0 && (
        <Reveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                <Clock3 className="w-3.5 h-3.5" /> CUT THIS MORNING
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{freshStockHeadingResolved.heading}</h2>
            </div>
            <button
              onClick={() => onNavigate('/search')}
              className="text-xs font-bold text-neutral-500 hover:text-emerald-600 flex items-center gap-1 transition cursor-pointer shrink-0"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative group/carousel">
            <div ref={freshStockScrollRef} className="flex items-stretch gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1 scroll-smooth">
              {todaysFreshStock.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group/card relative shrink-0 w-36 sm:w-40 bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
                >
                  <div className="relative aspect-square bg-neutral-100 overflow-hidden">
                    <img src={product.image} alt={translateProductName(product.id, product.name, lang)} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-white/95 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> FRESH TODAY
                    </span>
                    {/* Quick Shop hover overlay — desktop only */}
                    <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover/card:bg-black/30 transition items-end justify-center opacity-0 group-hover/card:opacity-100 pb-3">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        className="bg-white text-[#0A1F12] text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg translate-y-2 group-hover/card:translate-y-0 transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> QUICK VIEW
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-[11px] font-bold text-[#0A1F12] line-clamp-2 leading-snug">{translateProductName(product.id, product.name, lang)}</h3>
                    <div className="text-xs font-black text-emerald-700 mt-1">₹{product.basePrice}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Arrow navigation — desktop only, fades in on hover of the carousel */}
            <button
              onClick={() => scrollByAmount(freshStockScrollRef, 'left')}
              aria-label="Scroll left"
              className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/carousel:opacity-100 transition cursor-pointer z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollByAmount(freshStockScrollRef, 'right')}
              aria-label="Scroll right"
              className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/carousel:opacity-100 transition cursor-pointer z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
        </Reveal>
      )}
      {/* Featured combo carousel — pulled up next to Best Sellers per request;
          the rest of the Combo Offers section (grid + flash deals) still
          lives further down under its own "7. COMBO OFFERS" heading. */}
      <Reveal><ComboBanner products={products} onSelectProduct={onSelectProduct} /></Reveal>
      {/* IGO #6 — Farm & Supply Partners (sourcing trust network) */}
      <Reveal><BrandPartnersSection /></Reveal>
      {/* IGO #3 — B2C vs B2B banner (how IGO serves home cooks vs businesses),
          styled as photo-backed premium banner cards. */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Cooks & Families */}
          <div className="group relative overflow-hidden rounded-3xl min-h-[420px] flex flex-col justify-between p-8 sm:p-9 shadow-xl shadow-emerald-950/20">
            <img
              src="/Images/banners/b2c-delivery-banner.jpg"
              alt="Fresh packed cuts delivered to your kitchen"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover animate-kenburns group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F7B3A]/92 via-[#0F7B3A]/55 to-[#0F7B3A]/20" />

            <div className="relative z-10 space-y-5">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-sm">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest">
                  {pick(lang, { en: 'For Home Cooks & Families', ta: 'வீட்டு சமையல்காரர்கள் & குடும்பங்களுக்கு', hi: 'घरेलू रसोइयों और परिवारों के लिए', ml: 'വീട്ടിലെ പാചകക്കാർക്കും കുടുംബങ്ങൾക്കും', te: 'ఇంటి వంటవారికి & కుటుంబాలకు' })}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 leading-tight">
                  {pick(lang, { en: 'Everyday Fresh, Delivered.', ta: 'தினமும் புதியது, டெலிவரி செய்யப்படுகிறது.', hi: 'रोज़ ताज़ा, डिलीवर किया गया।', ml: 'ദിവസവും ഫ്രഷ്, ഡെലിവർ ചെയ്യുന്നു.', te: 'ప్రతిరోజూ ఫ్రెష్, డెలివరీ చేయబడింది.' })}
                </h3>
              </div>
              <ul className="space-y-2.5 text-sm text-emerald-50">
                {(lang === 'ta'
                  ? ['அதே நாள் 30-90 நிமிட எக்ஸ்பிரஸ் டெலிவரி', 'பணம் திரும்ப தரும் புத்துணர்ச்சி உத்தரவாதம்', 'சந்தா செய்து முன்கூட்டிய அணுகல் பெறுங்கள்']
                  : lang === 'hi'
                  ? ['उसी दिन 30-90 मिनट एक्सप्रेस डिलीवरी', 'मनी-बैक फ्रेशनेस गारंटी', 'सब्सक्राइब करें और अर्ली एक्सेस पाएं']
                  : lang === 'ml'
                  ? ['അതേ ദിവസം 30-90 മിനിറ്റ് എക്സ്പ്രസ് ഡെലിവറി', 'മണി-ബാക്ക് ഫ്രഷ്‌നെസ് ഗ്യാരണ്ടി', 'സബ്സ്ക്രൈബ് ചെയ്ത് നേരത്തെ ആക്സസ് നേടൂ']
                  : lang === 'te'
                  ? ['అదే రోజు 30-90 నిమిషాల ఎక్స్‌ప్రెస్ డెలివరీ', 'మనీ-బ్యాక్ ఫ్రెష్‌నెస్ గ్యారంటీ', 'సబ్‌స్క్రైబ్ చేసి ముందస్తు యాక్సెస్ పొందండి']
                  : ['Same-day 30-90 min express delivery', 'Money-back freshness guarantee', 'Subscribe & Save early access']
                ).map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-white/90 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onNavigate('/category/chicken')}
              className="relative z-10 mt-6 w-fit bg-white hover:bg-emerald-50 text-[#0F7B3A] font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center gap-2"
            >
              {pick(lang, { en: 'Shop Fresh Now', ta: 'இப்போது ஷாப் செய்யுங்கள்', hi: 'अभी शॉप करें', ml: 'ഇപ്പോൾ ഷോപ്പ് ചെയ്യൂ', te: 'ఇప్పుడే షాప్ చేయండి' })} <ShoppingCart className="w-4 h-4" />
            </button>
          </div>

          {/* Restaurants & Businesses */}
          <div className="group relative overflow-hidden rounded-3xl min-h-[420px] flex flex-col justify-between p-8 sm:p-9 shadow-xl shadow-black/30">
            <img
              src="/Images/banners/b2b-facility-banner.jpg"
              alt="IGO cold-chain processing facility for bulk supply"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover animate-kenburns group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F12]/94 via-[#0A1F12]/65 to-[#0A1F12]/25" />

            <div className="relative z-10 space-y-5">
              <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">
                  {pick(lang, { en: 'For Restaurants & Businesses', ta: 'உணவகங்கள் & வணிகங்களுக்கு', hi: 'रेस्टोरेंट और व्यवसायों के लिए', ml: 'റെസ്റ്റോറന്റുകൾക്കും ബിസിനസുകൾക്കും', te: 'రెస్టారెంట్లు & వ్యాపారాలకు' })}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 leading-tight">
                  {pick(lang, { en: 'Bulk Supply, Simplified.', ta: 'மொத்த சப்ளை, எளிமையாக்கப்பட்டது.', hi: 'थोक आपूर्ति, सरल बनाई गई।', ml: 'ബൾക്ക് സപ്ലൈ, ലളിതമാക്കി.', te: 'బల్క్ సప్లై, సరళీకృతం.' })}
                </h3>
              </div>
              <ul className="space-y-2.5 text-sm text-neutral-300">
                {(lang === 'ta'
                  ? ['மொத்த விலை & அடுக்கு தள்ளுபடிகள்', 'தனிப்பயன் லேபிளிங் & GST இன்வாய்சிங்', 'சமையலறைகளுக்கான பிரத்யேக டெலிவரி நேரங்கள்']
                  : lang === 'hi'
                  ? ['थोक मूल्य निर्धारण और स्तरीय छूट', 'कस्टम लेबलिंग और GST इनवॉइसिंग', 'किचन के लिए समर्पित डिलीवरी स्लॉट']
                  : lang === 'ml'
                  ? ['മൊത്ത വിലയും തട്ടുതട്ടായുള്ള കിഴിവുകളും', 'കസ്റ്റം ലേബലിംഗും GST ഇൻവോയ്സിംഗും', 'അടുക്കളകൾക്കായുള്ള സമർപ്പിത ഡെലിവറി സ്ലോട്ടുകൾ']
                  : lang === 'te'
                  ? ['హోల్‌సేల్ ధర & అంచెల తగ్గింపులు', 'కస్టమ్ లేబులింగ్ & GST ఇన్వాయిసింగ్', 'కిచెన్‌ల కోసం ప్రత్యేక డెలివరీ స్లాట్‌లు']
                  : ['Wholesale pricing & tiered discounts', 'Custom labeling & GST invoicing', 'Dedicated delivery slots for kitchens']
                ).map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onNavigate('/b2b')}
              className="relative z-10 mt-6 w-fit bg-[#D4AF37] hover:bg-[#c4a12e] text-[#0A1F12] font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center gap-2"
            >
              {pick(lang, { en: 'Request Wholesale Quote', ta: 'மொத்த விலை மேற்கோள் கோருங்கள்', hi: 'थोक कोट का अनुरोध करें', ml: 'മൊത്ത വില ക്വോട്ട് അഭ്യർത്ഥിക്കുക', te: 'హోల్‌సేల్ కోట్‌ను అభ్యర్థించండి' })} <Briefcase className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
      </Reveal>
      {/* (Supplementary) Curated Collections — not in the spec's numbered
          list, kept as a bonus product showcase; moved to sit right after
          Farm & Supply Partners / B2C-B2B per request. */}
      {/* Our Collections */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            {pick(lang, { en: 'Curated For You', ta: 'உங்களுக்காக தேர்ந்தெடுக்கப்பட்டது', hi: 'आपके लिए चुना गया', ml: 'നിങ്ങൾക്കായി തിരഞ്ഞെടുത്തത്', te: 'మీ కోసం ఎంపిక చేయబడింది' })}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">
            {pick(lang, { en: 'Our Collections', ta: 'எங்கள் தொகுப்புகள்', hi: 'हमारे संग्रह', ml: 'ഞങ്ങളുടെ ശേഖരങ്ങൾ', te: 'మా సేకరణలు' })}
          </h2>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {collectionTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCollection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCollection(tab.id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0F7B3A] border-emerald-500 text-white shadow'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-emerald-400 hover:text-[#0A1F12]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {activeCollectionProducts.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-xs text-neutral-500">
            {pick(lang, { en: 'No items in this collection yet — check back soon.', ta: 'இந்த தொகுப்பில் இன்னும் பொருட்கள் இல்லை — விரைவில் மீண்டும் பாருங்கள்.', hi: 'इस संग्रह में अभी तक कोई आइटम नहीं है — जल्द ही फिर देखें।', ml: 'ഈ ശേഖരത്തിൽ ഇതുവരെ ഇനങ്ങളൊന്നുമില്ല — ഉടൻ വീണ്ടും പരിശോധിക്കുക.', te: 'ఈ సేకరణలో ఇంకా అంశాలు లేవు — త్వరలో మళ్లీ చూడండి.' })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {activeCollectionProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
                <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
                  <img src={product.image} alt={translateProductName(product.id, product.name, lang)} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  {product.discountPercentage > 0 && (
                    <span className="absolute top-2 left-2 bg-[#0F7B3A] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {product.discountPercentage}% {pick(lang, { en: 'OFF', ta: 'தள்ளுபடி', hi: 'छूट', ml: 'കിഴിവ്', te: 'తగ్గింపు' })}
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="text-xs font-bold text-[#0A1F12] line-clamp-1">{translateProductName(product.id, product.name, lang)}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                    <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" /> {product.rating} ({product.reviewCount})
                  </div>
                  <div className="text-sm font-black text-emerald-700">₹{product.basePrice}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      </Reveal>
      {/* ============ 6. TODAY'S DEALS ============ */}
      <Reveal><TodaysDealsBanner products={products} onNavigate={onNavigate} /></Reveal>
      {/* Colored promo tile strip — free delivery, newly added category,
          real top bestseller, and Subscribe & Save, each linking to a real
          route. */}
      <Reveal><PromoTileStrip products={products} onNavigate={onNavigate} /></Reveal>
      {/* How It Works — moved up next to Today's Deals so first-time
          visitors see "how ordering works" earlier in the scroll, right
          alongside the deals that would prompt them to actually order. */}
      <Reveal><HowItWorksSection /></Reveal>
      {/* PRODUCT #7 — Seasonal spotlight banner: full-bleed photo carousel
          (dark scrim, bold overlaid headline, angled price-tag badge,
          Order Now CTA, arrow nav + dot pagination) — rebuilt to match the
          full-width banner-carousel style used across meat-delivery sites,
          crossfading between slides instead of an instant cut. Every slide
          is still a real, already-established IGO offer (Monsoon Wings /
          Subscription Savings / Free Delivery); no third-party photos, copy,
          or branding — this is IGO's own photography and pricing throughout.
          The "Combo Savings" slide that used to live here was removed — it
          duplicated the dedicated Bundle & Save banner section above
          word-for-word, so the same offer was appearing twice on the page. */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative bg-[#0A1F12] rounded-3xl overflow-hidden shadow-xl shadow-black/20"
          onMouseEnter={() => setIsPromoPaused(true)}
          onMouseLeave={() => setIsPromoPaused(false)}
        >
          {/* Scrolling ticker — editable from /admin → Homepage → Ticker strip.
              Duplicated twice so the marquee loops seamlessly. */}
          <div className="relative z-20 bg-[#0A1F12] border-b border-white/10 overflow-hidden py-1.5">
            <div className="flex w-max whitespace-nowrap animate-marquee">
              {[0, 1].map((dupIdx) => (
                <div key={dupIdx} className="flex items-center shrink-0">
                  {tickerResolved.items.map((item, idx) => (
                    <span key={idx} className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-6 flex items-center gap-6 shrink-0">
                      {item.label} <span className="text-white/30">•</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[340px] sm:min-h-[400px]">
            {promoSlides.map((slide, idx) => (
              <div
                key={slide.eyebrow}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${idx === activePromoSlide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}
              >
                <img
                  src={slide.image}
                  alt={slide.alt}
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 w-full h-full object-cover ${idx === activePromoSlide ? 'animate-kenburns' : ''}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F12]/95 via-[#0A1F12]/75 to-[#0A1F12]/15" />

                <div className="relative z-10 h-full flex flex-col justify-center gap-3 p-8 py-12 sm:pl-16 sm:pr-12 max-w-xl">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{slide.eyebrow}</span>
                  <h2 className="text-3xl sm:text-5xl font-black text-white leading-[0.95] tracking-tight">
                    {slide.title} <span className="text-[#D4AF37]">{slide.titleAccent}</span>
                  </h2>
                  <p className="text-white/75 text-sm sm:text-base font-medium max-w-sm">{slide.copy}</p>
                  <button
                    onClick={() => onNavigate(slide.path)}
                    className="w-fit bg-white hover:bg-emerald-50 text-[#0A1F12] font-black px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer mt-3 shadow-lg flex items-center gap-2"
                  >
                    {slide.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Angled price/offer tag — same visual language as the Combo Banner */}
                <div className="hidden sm:block absolute top-8 right-10 z-10 bg-[#E0632B] text-white font-black px-4 py-2.5 rounded-lg shadow-lg rotate-3">
                  <span className="block text-[9px] uppercase tracking-widest font-bold opacity-90">{slide.badgeLine1}</span>
                  <span className="text-xl leading-tight">{slide.badgeLine2}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Arrow navigation */}
          <button
            onClick={() => setActivePromoSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length)}
            aria-label="Previous offer"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white transition cursor-pointer z-20"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActivePromoSlide((prev) => (prev + 1) % promoSlides.length)}
            aria-label="Next offer"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white transition cursor-pointer z-20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dot pagination */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {promoSlides.map((slide, idx) => (
              <button
                key={slide.eyebrow}
                onClick={() => setActivePromoSlide(idx)}
                aria-label={`Go to offer ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === activePromoSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
      </Reveal>
      {/* ============ 7. SUBSCRIPTION ============ */}
      {/* Subscription Plans (an IGO service/offering) — horizontally
          scrollable so a 4th/5th plan never orphans onto its own row the
          way a fixed 3-column grid did. Deep-forest-green background
          (instead of flat near-black) to read as its own distinct section
          rather than a repeat of the charcoal "Why IGO" pillar grid. */}
      <Reveal>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A1F12] to-[#0A1F12] py-16">
        {/* Ambient texture — same subtle dot-grid used on the Freshness
            Promise section elsewhere in this codebase, swapped in after the
            colored glow blobs (emerald/gold blur circles) read as an odd
            color patch rather than depth. Neutral and much more subtle. */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              {pick(lang, { en: 'AUTOMATED GYM & FAMILY SUPPLIES', ta: 'தானியங்கி ஜிம் & குடும்ப சப்ளை', hi: 'ऑटोमेटेड जिम और फैमिली सप्लाई', ml: 'ഓട്ടോമേറ്റഡ് ജിം & കുടുംബ വിതരണം', te: 'ఆటోమేటెడ్ జిమ్ & ఫ్యామిలీ సప్లైస్' })}
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">{t('subscriptionsTitle')}</h2>
            <p className="text-xs text-neutral-300">
              {pick(lang, {
                en: 'Save up to ₹1,200/month with zero delivery fees and priority morning slots.',
                ta: 'பூஜ்ஜிய டெலிவரி கட்டணம் மற்றும் முன்னுரிமை காலை நேரங்களுடன் மாதம் ₹1,200 வரை சேமிக்கவும்.',
                hi: 'शून्य डिलीवरी शुल्क और प्राथमिकता वाले सुबह के स्लॉट के साथ हर महीने ₹1,200 तक बचाएं।',
                ml: 'പൂജ്യം ഡെലിവറി ചാർജും മുൻഗണനാ രാവിലെ സ്ലോട്ടുകളും ഉപയോഗിച്ച് പ്രതിമാസം ₹1,200 വരെ ലാഭിക്കുക.',
                te: 'జీరో డెలివరీ ఛార్జీలు మరియు ప్రాధాన్యత ఉదయం స్లాట్‌లతో నెలకు ₹1,200 వరకు ఆదా చేయండి.',
              })}
            </p>
          </div>

          <div
            className="relative group/carousel"
            onMouseEnter={() => setIsSubscriptionPaused(true)}
            onMouseLeave={() => setIsSubscriptionPaused(false)}
            onTouchStart={() => setIsSubscriptionPaused(true)}
            onTouchEnd={() => setIsSubscriptionPaused(false)}
          >
            <div
              ref={subscriptionScrollRef}
              className="flex items-stretch gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
            >
              {INITIAL_SUBSCRIPTION_PLANS.map((plan) => {
                const PlanIcon = subscriptionPlanIcons[plan.id] || Package;
                const subPlansByLang =
                  lang === 'ta' ? SUBSCRIPTION_PLANS_TA : lang === 'hi' ? SUBSCRIPTION_PLANS_HI : lang === 'ml' ? SUBSCRIPTION_PLANS_ML : lang === 'te' ? SUBSCRIPTION_PLANS_TE : null;
                const planTranslated = subPlansByLang?.[plan.id];
                const displayPlan = planTranslated
                  ? { ...plan, title: planTranslated.title, tagline: planTranslated.tagline, itemsIncluded: planTranslated.itemsIncluded, savings: planTranslated.savings, badge: planTranslated.badge }
                  : plan;
                return (
                <div
                  key={plan.id}
                  className="group snap-start shrink-0 w-72 sm:w-80 bg-[#0A1F12] border border-white/10 hover:border-emerald-500/70 rounded-3xl flex flex-col overflow-hidden relative transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-emerald-950/50"
                >
                  {/* Photo header band — real IGO photography, fully visible
                      (previous version buried it at 14% opacity behind a near
                      opaque scrim, which read as "no image" — now it's the
                      clear top visual with the content panel solid below it). */}
                  <div className="relative h-44 w-full overflow-hidden shrink-0">
                    <img
                      src={subscriptionPlanImages[plan.id]}
                      alt={displayPlan.title}
                      className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    {/* Single soft bottom-only fade so the photo reads clearly
                        instead of being darkened top and bottom at once —
                        just enough to blend into the panel below. */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F12] via-[#0A1F12]/5 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent h-1/3" />

                    <div className="absolute top-3.5 left-3.5 w-9 h-9 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center">
                      <PlanIcon className="w-4.5 h-4.5 text-white" />
                    </div>
                    {displayPlan.badge && (
                      <span className="absolute top-3.5 right-3.5 bg-[#0F7B3A] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                        {displayPlan.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col justify-between grow p-6 pt-5 space-y-5">
                    <div>
                      <h3 className="text-lg font-bold text-white leading-snug">{displayPlan.title}</h3>
                      <p className="text-xs text-neutral-400 mt-1">{displayPlan.tagline}</p>

                      <div className="my-4 pt-4 border-t border-white/10">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-2xl font-black text-white">₹{plan.pricePerMonth}</span>
                          {plan.originalPrice > plan.pricePerMonth && (
                            <span className="text-xs text-neutral-500 line-through">₹{plan.originalPrice}</span>
                          )}
                          <span className="text-xs text-neutral-500 font-normal">{pick(lang, { en: '/ month', ta: '/ மாதம்', hi: '/ महीना', ml: '/ മാസം', te: '/ నెల' })}</span>
                        </div>
                        <div className="text-xs text-emerald-400 font-bold mt-0.5">{displayPlan.savings}</div>
                      </div>

                      <ul className="space-y-2 text-xs text-neutral-300">
                        {displayPlan.itemsIncluded.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => onNavigate('/subscriptions')}
                      className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/30"
                    >
                      {t('activateSub')} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Edge fades — signal there's more to scroll instead of an abrupt card cut */}
            <div className="hidden sm:block absolute top-0 bottom-2 left-0 w-10 bg-gradient-to-r from-[#0A1F12] to-transparent pointer-events-none" />
            <div className="hidden sm:block absolute top-0 bottom-2 right-0 w-16 bg-gradient-to-l from-[#0A1F12] to-transparent pointer-events-none" />

            {/* Arrow navigation — desktop only, fades in on hover of the carousel */}
            <button
              onClick={() => scrollByAmount(subscriptionScrollRef, 'left')}
              aria-label="Scroll left"
              className="hidden lg:flex absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/carousel:opacity-100 transition cursor-pointer z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollByAmount(subscriptionScrollRef, 'right')}
              aria-label="Scroll right"
              className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center text-neutral-600 hover:text-emerald-600 hover:border-emerald-400 opacity-0 group-hover/carousel:opacity-100 transition cursor-pointer z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
      </Reveal>
      {/* ============ 8. CHEF RECOMMENDED CUTS ============ */}
      {/* Moved directly below the IGO Advantage Elite banner per request */}
      {chefRecommended.length > 0 && (
        <Reveal>
        <section className="bg-emerald-50/60 border-y border-emerald-100 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {chefHeadingResolved.eyebrow}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{chefHeadingResolved.heading}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {chefRecommended.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group bg-white border border-emerald-100 hover:border-emerald-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
                >
                  <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
                    <img src={product.image} alt={translateProductName(product.id, product.name, lang)} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <span className="absolute top-2 left-2 bg-[#0A1F12] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                      <ChefHat className="w-3 h-3" /> {pick(lang, { en: "Chef's Pick", ta: 'சமையல்காரர் தேர்வு', hi: 'शेफ की पसंद', ml: 'ഷെഫിന്റെ തിരഞ്ഞെടുപ്പ്', te: 'చెఫ్ పిక్' })}
                    </span>
                  </div>
                  <div className="p-3 space-y-1 flex-1">
                    <h3 className="text-xs font-bold text-[#0A1F12] line-clamp-1">{translateProductName(product.id, product.name, lang)}</h3>
                    <p className="text-[10px] text-neutral-500 line-clamp-1">
                      {pick(lang, { en: 'Best for: ', ta: 'இதற்கு சிறந்தது: ', hi: 'इसके लिए बेहतरीन: ', ml: 'ഏറ്റവും അനുയോജ്യം: ', te: 'దీనికి ఉత్తమం: ' })}
                      {product.recipePairing}
                    </p>
                    <div className="text-sm font-black text-emerald-700 pt-1">₹{product.basePrice}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        </Reveal>
      )}
      {/* ============ 9. COMBO OFFERS ============ */}
      {/* Combo Packs & Offers, its own dedicated section
          (separate from the general category/collection grids above). */}
      <Reveal><ComboCardsGrid products={products} onSelectProduct={onSelectProduct} /></Reveal>

      {/* ============ 10. SIGNATURE MEAT RECIPES ============ */}
      {/* Moved directly below the Combo Offers grid per request */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
              <ChefHat className="w-4 h-4" /> {pick(lang, { en: 'CHEF INSPIRATIONS', ta: 'சமையல் உத்வேகங்கள்', hi: 'शेफ प्रेरणाएं', ml: 'ഷെഫ് ഇൻസ്പിരേഷനുകൾ', te: 'చెఫ్ ఇన్స్పిరేషన్స్' })}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0A1F12] tracking-tight">{t('signatureRecipes')}</h2>
          </div>
          <button
            onClick={() => onNavigate('/recipes')}
            className="text-xs font-bold text-neutral-500 hover:text-emerald-600 flex items-center gap-1 transition cursor-pointer"
          >
            {t('exploreRecipes')} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_RECIPES.map((rec) => {
            const recipeTitlesByLang =
              lang === 'ta' ? RECIPE_TITLES_TA : lang === 'hi' ? RECIPE_TITLES_HI : lang === 'ml' ? RECIPE_TITLES_ML : lang === 'te' ? RECIPE_TITLES_TE : null;
            const difficultyByLang =
              lang === 'ta' ? DIFFICULTY_TA : lang === 'hi' ? DIFFICULTY_HI : lang === 'ml' ? DIFFICULTY_ML : lang === 'te' ? DIFFICULTY_TE : null;
            const displayTitle = recipeTitlesByLang?.[rec.id] ?? rec.title;
            const displayDifficulty = difficultyByLang?.[rec.difficulty] ?? rec.difficulty;
            return (
            <div
              key={rec.id}
              onClick={() => onNavigate('/recipes')}
              className="relative aspect-4/5 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={rec.image}
                alt={displayTitle}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute top-3 left-3 bg-[#0F7B3A] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                {displayDifficulty}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1.5">
                <h3 className="font-black text-white text-base leading-tight group-hover:text-emerald-300 transition">
                  {displayTitle}
                </h3>
                <div className="flex items-center gap-3 text-[11px] text-white/80 font-semibold">
                  <span>{pick(lang, { en: 'Prep: ', ta: 'தயாரிப்பு: ', hi: 'तैयारी: ', ml: 'തയ്യാറാക്കൽ: ', te: 'తయారీ: ' })}{rec.prepTime}</span>
                  <span>{pick(lang, { en: 'Protein: ', ta: 'புரதம்: ', hi: 'प्रोटीन: ', ml: 'പ്രോട്ടീൻ: ', te: 'ప్రోటీన్: ' })}<strong className="text-emerald-400">{rec.protein}</strong></span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </section>
      </Reveal>

      {flashDeals.length > 0 && (
        <Reveal>
        <section className="bg-[#0F7B3A] py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 shrink-0 md:w-72">
                <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-white font-black animate-pulse shrink-0">
                  <Flame className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider leading-tight">{t('flashDeals')}</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    {lang === 'ta'
                      ? 'குறைந்த அளவு காலை புதிய கட்ஸ் உடனடி கூடுதல் தள்ளுபடியுடன்'
                      : 'Limited quantity morning fresh cuts with instant extra discount'}
                  </p>
                </div>
              </div>

              <div className="relative group/flash flex-1 min-w-0">
                <div
                  ref={flashDealsScrollRef}
                  className="flex items-center gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
                >
                  {flashDeals.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => onSelectProduct(prod)}
                      className="bg-white/95 border border-white hover:border-black/20 p-2.5 rounded-xl flex items-center gap-3 shrink-0 snap-start cursor-pointer transition shadow-sm"
                    >
                      <img src={prod.image} alt={translateProductName(prod.id, prod.name, lang)} referrerPolicy="no-referrer" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs font-bold text-[#0A1F12] line-clamp-1">{translateProductName(prod.id, prod.name, lang)}</div>
                        <div className="text-xs text-emerald-700 font-black">₹{prod.basePrice} <span className="text-[10px] text-neutral-400 line-through">₹{prod.originalPrice}</span></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edge fade + arrow nav — same scroll affordance used on the
                    other horizontal strips, so the last tile signals "more to
                    scroll" instead of just clipping at the container edge. */}
                <div className="hidden sm:block absolute top-0 bottom-0 right-0 w-10 bg-gradient-to-l from-[#0F7B3A] to-transparent pointer-events-none" />
                <button
                  onClick={() => scrollByAmount(flashDealsScrollRef, 'right')}
                  aria-label="Scroll deals right"
                  className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-white shadow-md items-center justify-center text-[#0F7B3A] opacity-0 group-hover/flash:opacity-100 transition cursor-pointer z-10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollByAmount(flashDealsScrollRef, 'left')}
                  aria-label="Scroll deals left"
                  className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-white shadow-md items-center justify-center text-[#0F7B3A] opacity-0 group-hover/flash:opacity-100 transition cursor-pointer z-10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-white">
                <Gift className="w-4 h-4" />
                <span className="text-xs font-bold">
                  {pick(lang, {
                    en: 'Bundle & save more with our curated Combo Packs — up to 20% off.',
                    ta: 'எங்கள் தேர்ந்தெடுக்கப்பட்ட காம்போ பேக்குகளுடன் மேலும் சேமிக்கவும் — 20% வரை தள்ளுபடி.',
                    hi: 'हमारे चुनिंदा कॉम्बो पैक के साथ बंडल करें और अधिक बचाएं — 20% तक की छूट।',
                    ml: 'ഞങ്ങളുടെ ക്യൂറേറ്റഡ് കോംബോ പാക്കുകൾ ഉപയോഗിച്ച് ബണ്ടിൽ ചെയ്ത് കൂടുതൽ ലാഭിക്കുക — 20% വരെ കിഴിവ്.',
                    te: 'మా క్యూరేటెడ్ కాంబో ప్యాక్‌లతో బండిల్ చేసి మరింత ఆదా చేయండి — 20% వరకు తగ్గింపు.',
                  })}
                </span>
              </div>
              <button
                onClick={() => onNavigate('/category/combo-packs')}
                className="bg-white hover:bg-emerald-50 text-[#0F7B3A] font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shrink-0 flex items-center gap-2"
              >
                {pick(lang, { en: 'Shop Combo Packs', ta: 'காம்போ பேக்குகளை வாங்குங்கள்', hi: 'कॉम्बो पैक खरीदें', ml: 'കോംബോ പാക്കുകൾ വാങ്ങുക', te: 'కాంబో ప్యాక్‌లను షాప్ చేయండి' })} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
        </Reveal>
      )}
      {/* ============ 11. CUSTOMER REVIEWS ============ */}
      {/* Kitchen Guides — swapped with Testimonials per request */}
      <Reveal><GuidesSection /></Reveal>
      {/* ============ 12. DOWNLOAD APP ============ */}
      {/* Scan to Shop — full-width banner (photo / bold copy / QR / store
          badges), styled after the premium "Scan Me" app banners on other
          meat-delivery sites. The QR honestly opens our own live site —
          reordering/tracking are real features already on the site, so the
          copy stays accurate rather than promising a separate native app. */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0A1F12] rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-[0.9fr_1.3fr_0.8fr] items-stretch relative">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Real product photo */}
          <div className="relative overflow-hidden aspect-4/3 lg:aspect-auto bg-neutral-900 min-h-[220px]">
            <img
              src="/Images/Meat Images/Chicken/Chicken Drumsticks.jpg"
              alt="Fresh chicken drumsticks"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90 animate-kenburns"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A1F12]/60 lg:to-[#0A1F12]" />
          </div>

          {/* Bold stacked copy — punchier multi-line treatment (matches the
              reference banner's energy) while staying honest: the app is
              real but not yet live on the stores, so this says "coming
              soon" instead of "download now". */}
          <div className="relative z-10 p-8 sm:p-10 flex flex-col justify-center gap-2.5">
            <span className="text-[#D4AF37] font-black text-xs uppercase tracking-[0.25em]">
              {pick(lang, { en: 'Scan Me', ta: 'ஸ்கேன் செய்யுங்கள்', hi: 'स्कैन करें', ml: 'സ്കാൻ ചെയ്യുക', te: 'స్కాన్ చేయండి' })}
            </span>
            <h2 className="text-white text-2xl sm:text-3xl font-black leading-[1.05] uppercase tracking-tight">
              {lang === 'ta' ? (
                <>உங்கள் ஃபோனில்<br />வேகமாக ஷாப் செய்யுங்கள்</>
              ) : lang === 'hi' ? (
                <>अपने फोन पर<br />तेज़ी से शॉप करें</>
              ) : lang === 'ml' ? (
                <>നിങ്ങളുടെ ഫോണിൽ<br />വേഗത്തിൽ ഷോപ്പ് ചെയ്യുക</>
              ) : lang === 'te' ? (
                <>మీ ఫోన్‌లో<br />వేగంగా షాప్ చేయండి</>
              ) : (
                <>Shop Faster<br />on Your Phone</>
              )}
            </h2>
            <p className="text-[#D4AF37] font-black text-sm sm:text-base uppercase tracking-wide flex items-center gap-1.5">
              <Clock3 className="w-4 h-4 shrink-0" /> {pick(lang, { en: 'Our New App — Coming Soon', ta: 'எங்கள் புதிய ஆப் — விரைவில் வருகிறது', hi: 'हमारा नया ऐप — जल्द आ रहा है', ml: 'ഞങ്ങളുടെ പുതിയ ആപ്പ് — ഉടൻ വരുന്നു', te: 'మా కొత్త యాప్ — త్వరలో వస్తుంది' })}
            </p>
            <p className="text-neutral-300 text-sm max-w-sm">
              {pick(lang, {
                en: "Reorder in seconds and track your delivery live — right from your phone's browser, no install required.",
                ta: 'சில நொடிகளில் மீண்டும் ஆர்டர் செய்து உங்கள் டெலிவரியை நேரலையில் கண்காணிக்கவும் — உங்கள் ஃபோன் பிரவுசரிலிருந்தே, இன்ஸ்டால் தேவையில்லை.',
                hi: 'सेकंडों में फिर से ऑर्डर करें और अपनी डिलीवरी को लाइव ट्रैक करें — सीधे अपने फोन के ब्राउज़र से, इंस्टॉल की जरूरत नहीं।',
                ml: 'സെക്കൻഡുകൾക്കുള്ളിൽ വീണ്ടും ഓർഡർ ചെയ്യുകയും നിങ്ങളുടെ ഡെലിവറി തത്സമയം ട്രാക്ക് ചെയ്യുകയും ചെയ്യുക — നിങ്ങളുടെ ഫോൺ ബ്രൗസറിൽ നിന്ന് തന്നെ, ഇൻസ്റ്റാൾ ആവശ്യമില്ല.',
                te: 'సెకన్లలో మళ్లీ ఆర్డర్ చేయండి మరియు మీ డెలివరీని ప్రత్యక్షంగా ట్రాక్ చేయండి — మీ ఫోన్ బ్రౌజర్ నుండి నేరుగా, ఇన్‌స్టాల్ అవసరం లేదు.',
              })}
            </p>
            <div className="mt-1 inline-flex items-center gap-2 bg-[#0F7B3A]/15 border border-[#0F7B3A]/30 px-3.5 py-1.5 rounded-full w-fit">
              <span className="text-emerald-400 font-black text-xs">FIRSTCUT</span>
              <span className="text-neutral-300 text-xs">
                {pick(lang, { en: '— Flat ₹75 off your first order', ta: '— உங்கள் முதல் ஆர்டரில் ₹75 தள்ளுபடி', hi: '— आपके पहले ऑर्डर पर फ्लैट ₹75 की छूट', ml: '— നിങ്ങളുടെ ആദ്യ ഓർഡറിൽ ₹75 ഫ്ലാറ്റ് കിഴിവ്', te: '— మీ మొదటి ఆర్డర్‌పై ఫ్లాట్ ₹75 తగ్గింపు' })}
              </span>
            </div>
          </div>

          {/* QR + store badges */}
          <div className="relative z-10 p-8 flex flex-row lg:flex-col items-center justify-center gap-4 border-t lg:border-t-0 lg:border-l border-white/10">
            <div className="bg-white p-2.5 rounded-2xl shadow-lg shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&bgcolor=ffffff&color=08120B&data=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.origin : 'https://igoproteincuts.com'
                )}`}
                alt="Scan to open IGO Protein Cuts on your phone"
                className="w-24 h-24 sm:w-28 sm:h-28 block"
              />
              <p className="text-[9px] font-black text-[#0A1F12] text-center mt-1 uppercase tracking-wider">
                {pick(lang, { en: 'Scan Me', ta: 'ஸ்கேன் செய்யுங்கள்', hi: 'स्कैन करें', ml: 'സ്കാൻ ചെയ്യുക', te: 'స్కాన్ చేయండి' })}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {/* Greyed-out, clearly-labeled "coming soon" state — not
                  functional buttons, since the app isn't published to
                  either store yet. Avoids implying it's downloadable now. */}
              <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 px-3.5 py-2 rounded-xl overflow-hidden">
                <Apple className="w-4 h-4 shrink-0" />
                <div className="leading-tight">
                  <div className="text-[8px] text-neutral-500">{pick(lang, { en: 'Coming soon to the', ta: 'விரைவில்', hi: 'जल्द आ रहा है', ml: 'ഉടൻ വരുന്നു', te: 'త్వరలో వస్తుంది' })}</div>
                  <div className="text-[11px] font-bold">App Store</div>
                </div>
              </div>
              <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 px-3.5 py-2 rounded-xl overflow-hidden">
                <Play className="w-4 h-4 shrink-0 fill-white/50" />
                <div className="leading-tight">
                  <div className="text-[8px] text-neutral-500">{pick(lang, { en: 'Coming soon on', ta: 'விரைவில்', hi: 'जल्द आ रहा है', ml: 'ഉടൻ വരുന്നു', te: 'త్వరలో వస్తుంది' })}</div>
                  <div className="text-[11px] font-bold">Google Play</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </Reveal>
      {/* Instagram Feed Strip — swapped with Scan to Shop banner per request */}
      <Reveal>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-black text-[#0A1F12] tracking-tight">
              {pick(lang, { en: 'Follow @igoproteincuts', ta: '@igoproteincuts ஐ பின்தொடருங்கள்', hi: '@igoproteincuts को फॉलो करें', ml: '@igoproteincuts പിന്തുടരുക', te: '@igoproteincuts ని ఫాలో అవ్వండి' })}
            </h2>
          </div>
          <a
            href="https://www.instagram.com/igoproteincuts"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-neutral-500 hover:text-emerald-600 flex items-center gap-1 transition"
          >
            {t('followUs')} <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {instagramPosts.map((post) => (
            <a
              key={post.image}
              href="https://www.instagram.com/igoproteincuts"
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative aspect-square rounded-xl overflow-hidden ${post.fit === 'contain' ? 'bg-white' : 'bg-neutral-100'}`}
            >
              <img
                src={post.image}
                alt={post.alt}
                referrerPolicy="no-referrer"
                className={`w-full h-full group-hover:scale-110 transition duration-500 ${post.fit === 'contain' ? 'object-contain p-2' : 'object-cover'}`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                <Instagram className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" />
              </div>
            </a>
          ))}
        </div>
      </section>
      </Reveal>
      {/* Customer Testimonials — swapped with Kitchen Guides per request */}
      <Reveal><TestimonialsSection /></Reveal>
      {/* ============ 13. OUR FARMS ============ */}
      <Reveal><OurFarmsSection /></Reveal>

      {/* Section 14 (homepage newsletter banner) removed — it duplicated the
          footer's newsletter form, which already renders on every page
          including this one, so a customer saw two separate "subscribe"
          forms in the same view. Customer feedback flagged this as
          unnecessary; the footer form is now the single newsletter entry
          point site-wide. */}

    </div>
  );
};
