import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Mic,
  ShoppingBag,
  Heart,
  User,
  MapPin,
  Globe,
  ChevronDown,
  Menu,
  X,
  Bell,
  Home,
  Package,
  Percent,
  Briefcase,
  Gift,
  Truck,
  HelpCircle,
  LocateFixed,
  Info,
  Mail,
  Newspaper
} from 'lucide-react';
import { StoreService } from '../lib/storage';
import { fetchNotifications } from '../lib/api/notifications';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Language, TRANSLATIONS, LANGUAGES, LANGUAGE_LABELS, pick } from '../lib/language';
import { isPincodeServiceable, isValidPincodeFormat } from '../lib/serviceability';
import { Product } from '../types';
import { rankedProductMatches } from '../lib/search';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenAISearch: () => void;
  onOpenVoiceSearch: () => void;
  onOpenEcosystem?: () => void;
  onOpenCalculator?: () => void;
  onOpenNotifications?: () => void;
  onNavigate: (path: string) => void;
  currentPath: string;
  lang?: Language;
  onSetLang?: (lang: Language) => void;
  products?: Product[];
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCart,
  onOpenAuth,
  onOpenAISearch,
  onOpenVoiceSearch,
  onOpenEcosystem,
  onOpenCalculator,
  onOpenNotifications,
  onNavigate,
  currentPath,
  lang = 'en' as Language,
  onSetLang,
  products = []
}) => {
  const [cartCount, setCartCount] = useState(0);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileLangMenuOpen, setMobileLangMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [selectedPincode, setSelectedPincode] = useState('560038 (Indiranagar)');
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [inputPincode, setInputPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  // Tracks whether the current pincodeStatus message represents success
  // (styled green) vs. informational/error (styled neutral). Previously this
  // was inferred by checking pincodeStatus.includes('Active') on the English
  // string itself — that check silently breaks once the message is
  // translated into a language where "Active" doesn't appear verbatim, so
  // success/failure is now tracked explicitly instead of string-sniffed.
  const [pincodeStatusOk, setPincodeStatusOk] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const navSearchMatches = rankedProductMatches(navSearchQuery, products, 6);
  const [userProfile, setUserProfile] = useState(() => StoreService.getUserProfile());
  const [isLoggedIn, setIsLoggedIn] = useState(() => StoreService.isLoggedIn());

  const t = TRANSLATIONS[lang || 'en'] || TRANSLATIONS['en'];

  useEffect(() => {
    const updateCounts = () => {
      const cart = StoreService.getCart();
      const count = cart.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);

      const wishlist = StoreService.getWishlist();
      setWishlistCount(wishlist.length);

      setUserProfile(StoreService.getUserProfile());
      setIsLoggedIn(StoreService.isLoggedIn());
    };

    updateCounts();
    window.addEventListener('protein_cuts_cart_updated', updateCounts);
    window.addEventListener('protein_cuts_wishlist_updated', updateCounts);
    window.addEventListener('protein_cuts_user_updated', updateCounts);
    // The custom events above only fire within the tab that made the change
    // — they never reach a second open tab of the site. The native
    // `storage` event DOES fire on every other same-origin tab whenever
    // localStorage changes, so without it the header badge count (cart/
    // wishlist) goes stale in any tab other than the one you last acted in —
    // e.g. the wishlist heart badge still says "2" in Tab A after you
    // cleared it in Tab B, because Tab A never heard about it.
    window.addEventListener('storage', updateCounts);

    return () => {
      window.removeEventListener('protein_cuts_cart_updated', updateCounts);
      window.removeEventListener('protein_cuts_wishlist_updated', updateCounts);
      window.removeEventListener('protein_cuts_user_updated', updateCounts);
      window.removeEventListener('storage', updateCounts);
    };
  }, []);

  // Real notifications badge — reads the canonical `notifications` table
  // (order-status triggers, restock alerts) instead of the old fake local
  // SupabaseService store. Refetches on the same "just changed" custom event
  // (fired by NotificationCenterModal after marking rows read) and also
  // subscribes to realtime INSERTs so a new order-status notification bumps
  // the badge live without a page refresh.
  useEffect(() => {
    let cancelled = false;
    const refreshUnread = async () => {
      const notifs = await fetchNotifications();
      if (!cancelled) setUnreadNotifCount(notifs.filter((n) => !n.isRead).length);
    };

    refreshUnread();
    window.addEventListener('protein_cuts_notifications_updated', refreshUnread);

    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('navbar-notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, refreshUnread)
        .subscribe();
    }

    return () => {
      cancelled = true;
      window.removeEventListener('protein_cuts_notifications_updated', refreshUnread);
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  const handleVerifyPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPincodeFormat(inputPincode)) {
      setPincodeStatusOk(false);
      setPincodeStatus(
        pick(lang, {
          en: 'Please enter a valid 6-digit Pincode.',
          ta: 'சரியான 6-இலக்க பின்கோடை உள்ளிடவும்.',
          hi: 'कृपया एक मान्य 6-अंकीय पिनकोड दर्ज करें।',
          ml: 'സാധുവായ 6-അക്ക പിൻകോഡ് നൽകുക.',
          te: 'దయచేసి చెల్లుబాటు అయ్యే 6-అంకెల పిన్‌కోడ్‌ను నమోదు చేయండి.'
        })
      );
      return;
    }
    // Real check against the serviceable-pincode list (src/lib/serviceability.ts)
    // — previously any 6-digit string was accepted as deliverable.
    if (isPincodeServiceable(inputPincode)) {
      setSelectedPincode(`${inputPincode} (Express Available)`);
      setPincodeStatusOk(true);
      setPincodeStatus(
        pick(lang, {
          en: '30-90 Minute Express Cold Chain Delivery Active in your zone!',
          ta: 'உங்கள் பகுதியில் 30-90 நிமிட எக்ஸ்பிரஸ் குளிர் சங்கிலி டெலிவரி இயங்குகிறது!',
          hi: 'आपके क्षेत्र में 30-90 मिनट एक्सप्रेस कोल्ड चेन डिलीवरी सक्रिय है!',
          ml: 'നിങ്ങളുടെ പ്രദേശത്ത് 30-90 മിനിറ്റ് എക്സ്പ്രസ് കോൾഡ് ചെയിൻ ഡെലിവറി സജീവമാണ്!',
          te: 'మీ ప్రాంతంలో 30-90 నిమిషాల ఎక్స్‌ప్రెస్ కోల్డ్ చైన్ డెలివరీ యాక్టివ్‌గా ఉంది!'
        })
      );
      setTimeout(() => {
        setShowPincodeModal(false);
        setPincodeStatus(null);
      }, 1500);
    } else {
      setPincodeStatusOk(false);
      setPincodeStatus(
        pick(lang, {
          en: "Sorry, we don't deliver to this Pincode yet. We currently serve Bengaluru only.",
          ta: 'மன்னிக்கவும், நாங்கள் இந்த பின்கோடுக்கு இன்னும் டெலிவரி செய்யவில்லை. நாங்கள் தற்போது பெங்களூருக்கு மட்டுமே சேவை செய்கிறோம்.',
          hi: 'क्षमा करें, हम अभी इस पिनकोड पर डिलीवरी नहीं करते। हम फ़िलहाल केवल बेंगलुरु में सेवा देते हैं।',
          ml: 'ക്ഷമിക്കണം, ഈ പിൻകോഡിലേക്ക് ഞങ്ങൾ ഇതുവരെ ഡെലിവർ ചെയ്യുന്നില്ല. ഞങ്ങൾ നിലവിൽ ബെംഗളൂരുവിൽ മാത്രമേ സേവനം നൽകുന്നുള്ളൂ.',
          te: 'క్షమించండి, మేము ఇంకా ఈ పిన్‌కోడ్‌కు డెలివరీ చేయడం లేదు. మేము ప్రస్తుతం బెంగళూరులో మాత్రమే సేవలందిస్తున్నాము.'
        })
      );
    }
  };

  // Real browser Geolocation API — requests the device's GPS/network
  // location, then reverse-geocodes those coordinates into an actual
  // locality/pincode name via OpenStreetMap's free Nominatim API (no key
  // required, so no .env dependency). Falls back to showing the raw
  // coordinates only if the reverse-geocode call itself fails, rather than
  // ever presenting the customer with bare numbers when a name is available.
  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setPincodeStatusOk(false);
      setPincodeStatus(
        pick(lang, {
          en: "Live location isn't supported on this browser. Please enter your Pincode instead.",
          ta: 'இந்த உலாவியில் நேரடி இருப்பிடம் ஆதரிக்கப்படவில்லை. உங்கள் பின்கோடை உள்ளிடவும்.',
          hi: 'इस ब्राउज़र पर लाइव लोकेशन समर्थित नहीं है। कृपया इसके बजाय अपना पिनकोड दर्ज करें।',
          ml: 'ഈ ബ്രൗസറിൽ ലൈവ് ലൊക്കേഷൻ പിന്തുണയ്‌ക്കുന്നില്ല. പകരം നിങ്ങളുടെ പിൻകോഡ് നൽകുക.',
          te: 'ఈ బ్రౌజర్‌లో లైవ్ లొకేషన్ మద్దతు లేదు. దయచేసి బదులుగా మీ పిన్‌కోడ్‌ను నమోదు చేయండి.'
        })
      );
      return;
    }
    setIsLocating(true);
    setPincodeStatus(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
            { headers: { Accept: 'application/json' } }
          );
          if (!res.ok) throw new Error('reverse geocode failed');
          const data = await res.json();
          const addr = data?.address ?? {};
          const locality =
            addr.suburb || addr.neighbourhood || addr.locality || addr.village ||
            addr.town || addr.city_district || addr.city || 'Your Area';
          const postcode = addr.postcode;

          setSelectedPincode(postcode ? `${postcode} (${locality})` : locality);
        } catch {
          // Reverse-geocode call failed (offline/rate-limited) — fall back to
          // raw coordinates rather than leaving the field blank.
          setSelectedPincode(`Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        }

        setPincodeStatusOk(true);
        setPincodeStatus(
          pick(lang, {
            en: 'Live location detected — 30-90 Minute Express Cold Chain Delivery Active in your zone!',
            ta: 'நேரடி இருப்பிடம் கண்டறியப்பட்டது — உங்கள் பகுதியில் 30-90 நிமிட எக்ஸ்பிரஸ் குளிர் சங்கிலி டெலிவரி இயங்குகிறது!',
            hi: 'लाइव लोकेशन का पता चला — आपके क्षेत्र में 30-90 मिनट एक्सप्रेस कोल्ड चेन डिलीवरी सक्रिय है!',
            ml: 'ലൈവ് ലൊക്കേഷൻ കണ്ടെത്തി — നിങ്ങളുടെ പ്രദേശത്ത് 30-90 മിനിറ്റ് എക്സ്പ്രസ് കോൾഡ് ചെയിൻ ഡെലിവറി സജീവമാണ്!',
            te: 'లైవ్ లొకేషన్ కనుగొనబడింది — మీ ప్రాంతంలో 30-90 నిమిషాల ఎక్స్‌ప్రెస్ కోల్డ్ చైన్ డెలివరీ యాక్టివ్‌గా ఉంది!'
          })
        );
        setIsLocating(false);
        setTimeout(() => {
          setShowPincodeModal(false);
          setPincodeStatus(null);
        }, 1800);
      },
      (err) => {
        setIsLocating(false);
        // Once a browser has denied a site's location permission, no
        // website JavaScript can silently re-grant or re-prompt for it —
        // that's a browser security restriction, not something this site
        // can bypass. The most useful thing to do here is tell the
        // customer exactly which browser control re-enables it, rather
        // than a flat "denied" message with no next step.
        setPincodeStatusOk(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPincodeStatus(
            pick(lang, {
              en: 'Location access is blocked for this site. Tap the lock/info icon next to the address bar, turn Location on, then tap "Use My Current Location" again — or just enter your Pincode below.',
              ta: 'இந்த தளத்திற்கு இருப்பிட அணுகல் தடுக்கப்பட்டுள்ளது. முகவரிப் பட்டைக்கு அருகில் உள்ள லாக்/தகவல் ஐகானைத் தட்டி, இருப்பிடத்தை இயக்கி, "என் தற்போதைய இருப்பிடத்தைப் பயன்படுத்து" என்பதை மீண்டும் தட்டவும் — அல்லது கீழே உங்கள் பின்கோடை உள்ளிடவும்.',
              hi: 'इस साइट के लिए लोकेशन एक्सेस अवरुद्ध है। एड्रेस बार के पास लॉक/जानकारी आइकन टैप करें, लोकेशन चालू करें, फिर "मेरी वर्तमान लोकेशन का उपयोग करें" पर फिर टैप करें — या नीचे अपना पिनकोड दर्ज करें।',
              ml: 'ഈ സൈറ്റിനുള്ള ലൊക്കേഷൻ ആക്സസ് തടഞ്ഞിരിക്കുന്നു. അഡ്രസ് ബാറിനടുത്തുള്ള ലോക്ക്/ഇൻഫോ ഐക്കണിൽ ടാപ്പ് ചെയ്ത്, ലൊക്കേഷൻ ഓണാക്കി, "എന്റെ നിലവിലെ ലൊക്കേഷൻ ഉപയോഗിക്കുക" വീണ്ടും ടാപ്പ് ചെയ്യുക — അല്ലെങ്കിൽ താഴെ നിങ്ങളുടെ പിൻകോഡ് നൽകുക.',
              te: 'ఈ సైట్ కోసం లొకేషన్ యాక్సెస్ నిరోధించబడింది. అడ్రస్ బార్ పక్కన ఉన్న లాక్/ఇన్ఫో చిహ్నాన్ని నొక్కి, లొకేషన్‌ను ఆన్ చేసి, "నా ప్రస్తుత లొకేషన్‌ను ఉపయోగించండి" మళ్లీ నొక్కండి — లేదా దిగువన మీ పిన్‌కోడ్‌ను నమోదు చేయండి.'
            })
          );
        } else if (err.code === err.TIMEOUT) {
          // With enableHighAccuracy previously forced on, laptops/desktops
          // with no GPS chip (relying on slower WiFi-based positioning)
          // routinely blew past a 10s timeout and silently failed — this
          // read to the customer as "location isn't capturing" with no
          // explanation. Give an actionable retry message instead.
          setPincodeStatus(
            pick(lang, {
              en: 'Location is taking too long to detect. Please try again, or enter your Pincode below.',
              ta: 'இருப்பிடத்தை கண்டறிய அதிக நேரம் ஆகிறது. மீண்டும் முயற்சிக்கவும், அல்லது கீழே உங்கள் பின்கோடை உள்ளிடவும்.',
              hi: 'लोकेशन का पता लगाने में बहुत समय लग रहा है। कृपया फिर से प्रयास करें, या नीचे अपना पिनकोड दर्ज करें।',
              ml: 'ലൊക്കേഷൻ കണ്ടെത്താൻ വളരെയധികം സമയമെടുക്കുന്നു. വീണ്ടും ശ്രമിക്കുക, അല്ലെങ്കിൽ താഴെ നിങ്ങളുടെ പിൻകോഡ് നൽകുക.',
              te: 'లొకేషన్‌ను గుర్తించడానికి చాలా సమయం పడుతోంది. దయచేసి మళ్లీ ప్రయత్నించండి, లేదా దిగువన మీ పిన్‌కోడ్‌ను నమోదు చేయండి.'
            })
          );
        } else {
          setPincodeStatus(
            pick(lang, {
              en: 'Could not detect your live location. Please enter your Pincode instead.',
              ta: 'உங்கள் நேரடி இருப்பிடத்தை கண்டறிய முடியவில்லை. பதிலாக உங்கள் பின்கோடை உள்ளிடவும்.',
              hi: 'आपकी लाइव लोकेशन का पता नहीं चल सका। कृपया इसके बजाय अपना पिनकोड दर्ज करें।',
              ml: 'നിങ്ങളുടെ ലൈവ് ലൊക്കേഷൻ കണ്ടെത്താനായില്ല. പകരം നിങ്ങളുടെ പിൻകോഡ് നൽകുക.',
              te: 'మీ లైవ్ లొకేషన్‌ను గుర్తించలేకపోయాము. దయచేసి బదులుగా మీ పిన్‌కోడ్‌ను నమోదు చేయండి.'
            })
          );
        }
      },
      // High accuracy forces GPS-chip-grade positioning, which desktops and
      // many laptops don't have — they'd just time out waiting for a fix
      // that can never arrive. Network/WiFi-based positioning (accuracy
      // off) is plenty precise for a delivery-zone lookup and returns far
      // more reliably. Longer timeout + maximumAge also let a cached recent
      // fix satisfy the request instantly instead of re-polling every time.
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  };

  // Core links that stay visible at the top level of the desktop nav bar —
  // kept to the Home link only, matching the lean nav pattern used across
  // reference meat-delivery sites (Meatigo, TenderCuts, Crowdcow); a generic
  // "Discover" link isn't something any of those sites carry, and the AI
  // search bar already covers discovery, so it was removed rather than kept
  // as an unfamiliar, redundant nav item.
  const primaryLinks = [
    { name: pick(lang, { en: 'Home', ta: 'முகப்பு', hi: 'होम', ml: 'ഹോം', te: 'హోమ్' }), path: '/', icon: Home }
  ];

  // All shop-by-category links grouped under the "Categories" dropdown so the
  // header doesn't overflow into a cramped single row as more categories are added
  const categoryLinks = [
    { name: pick(lang, { en: 'Chicken', ta: 'சிக்கன்', hi: 'चिकन', ml: 'ചിക്കൻ', te: 'చికెన్' }), path: '/category/chicken' },
    { name: pick(lang, { en: 'Mutton', ta: 'மட்டன்', hi: 'मटन', ml: 'മട്ടൺ', te: 'మటన్' }), path: '/category/mutton' },
    { name: pick(lang, { en: 'Beef', ta: 'பீஃப்', hi: 'बीफ', ml: 'ബീഫ്', te: 'బీఫ్' }), path: '/category/beef' },
    { name: pick(lang, { en: 'Fish & Seafood', ta: 'மீன் & சீஃபுட்', hi: 'मछली व सीफूड', ml: 'മീനും സീഫുഡും', te: 'చేపలు & సీఫుడ్' }), path: '/category/fish' },
    { name: pick(lang, { en: 'Dry Fish', ta: 'கருவாடு', hi: 'सूखी मछली', ml: 'ഉണക്ക മീൻ', te: 'ఎండు చేపలు' }), path: '/category/dry-fish' },
    { name: pick(lang, { en: 'Eggs', ta: 'முட்டை', hi: 'अंडे', ml: 'മുട്ട', te: 'గుడ్లు' }), path: '/category/eggs' },
    { name: pick(lang, { en: 'Healthy Add-ons', ta: 'ஆரோக்கிய சேர்க்கைகள்', hi: 'हेल्दी ऐड-ऑन', ml: 'ആരോഗ്യകരമായ ആഡ്-ഓണുകൾ', te: 'ఆరోగ్యకరమైన యాడ్-ఆన్‌లు' }), path: '/category/healthy-addons' },
    { name: pick(lang, { en: 'Ready-to-Cook', ta: 'ரெடி-டு-குக்', hi: 'रेडी-टू-कुक', ml: 'റെഡി-ടു-കുക്ക്', te: 'రెడీ-టు-కుక్' }), path: '/category/ready-to-cook' },
    { name: pick(lang, { en: 'Frozen Food', ta: 'உறைந்த உணவு', hi: 'फ्रोज़न फूड', ml: 'ഫ്രോസൺ ഫുഡ്', te: 'ఫ్రోజెన్ ఫుడ్' }), path: '/category/frozen-food' },
    { name: pick(lang, { en: 'Biryani Kits', ta: 'பிரியாணி கிட்', hi: 'बिरयानी किट', ml: 'ബിരിയാണി കിറ്റുകൾ', te: 'బిర్యానీ కిట్స్' }), path: '/category/biryani' },
    { name: pick(lang, { en: 'Cold Cuts', ta: 'கோல்ட் கட்ஸ்', hi: 'कोल्ड कट्स', ml: 'കോൾഡ് കട്സ്', te: 'కోల్డ్ కట్స్' }), path: '/category/cold-cuts' },
    { name: pick(lang, { en: 'Combos', ta: 'கம்போஸ்', hi: 'कॉम्बोज़', ml: 'കോംബോകൾ', te: 'కాంబోలు' }), path: '/category/combo-packs' }
  ];

  // Ordered to match the standard professional nav pattern (browse → business
  // → brand/content → self-serve help → direct contact last as the final
  // CTA-style item): Home, Categories (primary row) → B2B → About → Blog →
  // FAQ → Contact. FAQ sits right before Contact since that's the "check
  // this before you reach out" step on most retail sites — it has no
  // standalone page, so it points at `/support`, the real "Support & FAQ"
  // page already reachable from the footer/account menu.
  const secondaryLinks = [
    // Previously the only ways to reach the Offers/Flash Sale page were a
    // handful of homepage banners and the "View Hot Offers" button buried in
    // the empty-cart state — there was no persistent nav entry, so a
    // customer who wasn't on the homepage or an empty cart had no way to
    // find it. It's a real standalone page (OffersPage.tsx), so it belongs
    // in the nav like every other section.
    { name: pick(lang, { en: 'Offers', ta: 'சலுகைகள்', hi: 'ऑफर', ml: 'ഓഫറുകൾ', te: 'ఆఫర్లు' }), path: '/offers', icon: Percent },
    // Was only reachable from a homepage rail and the checkout's "activate
    // subscription" flow — never had its own nav entry despite being a real,
    // dedicated page (SubscriptionsPage.tsx). Customer feedback flagged this
    // as a suggestion; adding a genuine nav link is the minimal way to
    // satisfy it without restructuring the page itself.
    { name: pick(lang, { en: 'Subscriptions', ta: 'சந்தா', hi: 'सब्सक्रिप्शन', ml: 'സബ്സ്ക്രിപ്ഷനുകൾ', te: 'సబ్‌స్క్రిప్షన్లు' }), path: '/subscriptions', icon: Package },
    { name: pick(lang, { en: 'B2B', ta: 'மொத்த வர்த்தகம்', hi: 'B2B', ml: 'B2B', te: 'B2B' }), path: '/b2b', icon: Briefcase },
    { name: pick(lang, { en: 'About', ta: 'எங்களை பற்றி', hi: 'हमारे बारे में', ml: 'ഞങ്ങളെക്കുറിച്ച്', te: 'మా గురించి' }), path: '/about', icon: Info },
    { name: pick(lang, { en: 'Blog', ta: 'வலைப்பதிவு', hi: 'ब्लॉग', ml: 'ബ്ലോഗ്', te: 'బ్లాగ్' }), path: '/blog', icon: Newspaper },
    { name: pick(lang, { en: 'FAQ', ta: 'கேள்விகள்', hi: 'सामान्य प्रश्न', ml: 'പതിവ് ചോദ്യങ്ങൾ', te: 'తరచుగా అడిగే ప్రశ్నలు' }), path: '/support', icon: HelpCircle },
    { name: pick(lang, { en: 'Contact', ta: 'தொடர்பு', hi: 'संपर्क करें', ml: 'ബന്ധപ്പെടുക', te: 'సంప్రదించండి' }), path: '/contact', icon: Mail }
  ];

  // Link styling for the dark sub-nav bar — plain bold text with a bottom
  // underline on the active/hover state, matching the clean text-only nav
  // bar pattern requested (no icons, no pill backgrounds).
  const navLinkClassDark = (path: string) =>
    `transition whitespace-nowrap px-4 py-2 font-bold text-sm cursor-pointer border-b-2 ${
      currentPath === path
        ? 'text-white border-white'
        : 'text-white/85 border-transparent hover:text-white hover:border-white/50'
    }`;

  const submitNavSearch = () => {
    if (!navSearchQuery.trim()) return;
    onNavigate(`/search?q=${encodeURIComponent(navSearchQuery.trim())}`);
    setNavSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-neutral-200 text-[#0A1F12] shadow-sm">
      {/* Main Header Row — logo, delivery, search, and all quick actions live
          in a single clean row (matches the lean single-row pattern used by
          modern grocery/meat delivery apps rather than a stacked utility bar) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 lg:h-24 flex items-center justify-between gap-3 sm:gap-5">
        {/* Brand Logo — placeholder mark until the real logo file is provided */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => onNavigate('/')}
            className="text-left flex items-center gap-2.5 group cursor-pointer focus:outline-none shrink-0"
          >
            {/* The logo file is a JPG with a wide white margin baked around
                the mark (JPGs can't be transparent), and the header's
                bg-white/95 + backdrop-blur wasn't flat enough for
                mix-blend-multiply to fully cancel that white out. Cropping
                it instead: the wrapper is fixed to the target visible size
                with overflow-hidden, and the image inside is scaled up 55%
                from its own center — which both zooms past most of the
                white margin AND makes the visible mark bigger, in one move,
                with no new image asset. */}
            <div className="h-12 sm:h-14 lg:h-16 xl:h-[4.5rem] overflow-hidden flex items-center shrink-0">
              <img
                src="/Images/protein-cuts-logo.jpg"
                alt="Protein Cuts Logo"
                className="h-full w-auto object-contain mix-blend-multiply scale-[1.9] group-hover:scale-[2] transition duration-300"
              />
            </div>
          </button>

          {/* Delivery Pincode Selector */}
          <button
            onClick={() => setShowPincodeModal(true)}
            className="hidden xl:flex items-center h-10 gap-2 bg-neutral-50 border border-neutral-300 hover:border-emerald-400 px-3.5 rounded-full text-xs text-neutral-600 transition cursor-pointer shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 shrink-0 max-w-[190px]"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <div className="text-left min-w-0">
              <div className="text-[10px] text-emerald-700 uppercase font-bold leading-tight">{t.deliverTo}</div>
              <div className="font-bold text-[#0A1F12] truncate max-w-[150px] leading-tight">{selectedPincode}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
          </button>
        </div>

        {/* Real search bar — same input + category dropdown + submit button
            already used in the dark secondary row below (navSearchQuery /
            submitNavSearch), now added here in the main header too, per
            request. The AI-branded click-through trigger this replaced is
            gone. Voice search stays, wasn't part of the earlier removal. */}
        <div className="relative flex-1 min-w-[130px] sm:min-w-[160px] max-w-[180px] sm:max-w-[220px] md:max-w-xs hidden sm:flex items-center justify-center shrink">
          {/* Mic now sits inside the pill as a trailing icon, matching the
              reference layout, instead of as a separate button beside it.
              Shrunk down to a compact size per request — smaller height and
              a much tighter max-width than the full-size bar it used to be. */}
          <div className="flex items-center h-11 bg-neutral-50 border border-neutral-300 hover:border-emerald-400 rounded-full overflow-hidden shadow-sm transition w-full min-w-0 focus-within:border-emerald-400">
            <Search className="w-4 h-4 text-neutral-400 ml-3.5 shrink-0" />
            <input
              type="text"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              // A short delay so a click on a dropdown row/button registers
              // before blur closes it — onMouseDown on those rows fires
              // first regardless, but this keeps keyboard/touch reliable too.
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSearchDropdown(false);
                  submitNavSearch();
                } else if (e.key === 'Escape') {
                  setShowSearchDropdown(false);
                }
              }}
              placeholder={t.searchPlaceholder}
              className="flex-1 min-w-0 bg-transparent px-2 py-2 text-xs text-[#0A1F12] placeholder-neutral-400 focus:outline-none"
            />
            {navSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setNavSearchQuery('');
                  setShowSearchDropdown(false);
                }}
                aria-label="Clear search"
                className="p-1.5 text-neutral-400 hover:text-neutral-600 transition cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onOpenVoiceSearch}
              title={pick(lang, { en: 'Voice Search', ta: 'குரல் தேடல்', hi: 'वॉइस सर्च', ml: 'വോയ്‌സ് സെർച്ച്', te: 'వాయిస్ సెర్చ్' })}
              className="p-2 text-emerald-600 hover:text-emerald-700 transition cursor-pointer shrink-0"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={submitNavSearch}
              aria-label="Search"
              className="p-2.5 mr-1 my-1 rounded-full bg-[#0F7B3A] hover:bg-emerald-500 text-white transition cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Live suggestions — relevance-ranked via rankedProductMatches
              (src/lib/search.ts) instead of a flat "contains this substring
              anywhere" match, so typing a prefix like "on" surfaces Onion
              before Watermelon/Honey/Coconut Oil just because "on" happens
              to sit inside those names too. */}
          {showSearchDropdown && navSearchQuery.trim() && (
            <div className="absolute z-40 top-full mt-2 left-0 right-0 min-w-[280px] bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden">
              {navSearchMatches.length > 0 ? (
                <>
                  <div className="max-h-80 overflow-y-auto">
                    {navSearchMatches.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={() => {
                          setShowSearchDropdown(false);
                          setNavSearchQuery('');
                          onNavigate(`/product/${p.id}`);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition cursor-pointer text-left border-b border-neutral-100 last:border-b-0"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover bg-neutral-100 border border-neutral-100 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#0A1F12] truncate">{p.name}</div>
                          <div className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wide">{p.category}</div>
                        </div>
                        <div className="text-xs font-black text-emerald-700 shrink-0">₹{p.basePrice}</div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onMouseDown={() => {
                      setShowSearchDropdown(false);
                      submitNavSearch();
                    }}
                    className="w-full text-center py-2.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 hover:bg-emerald-50 transition cursor-pointer border-t border-neutral-100"
                  >
                    {pick(lang, { en: 'View All Results', ta: 'அனைத்து முடிவுகளையும் காண்க', hi: 'सभी परिणाम देखें', ml: 'എല്ലാ ഫലങ്ങളും കാണുക', te: 'అన్ని ఫలితాలు చూడండి' })}
                  </button>
                </>
              ) : (
                <div className="px-4 py-4 text-xs text-neutral-400 text-center">
                  {pick(lang, {
                    en: `No products match "${navSearchQuery.trim()}".`,
                    ta: `"${navSearchQuery.trim()}" உடன் பொருந்தும் தயாரிப்புகள் இல்லை.`,
                    hi: `"${navSearchQuery.trim()}" से मेल खाने वाला कोई उत्पाद नहीं मिला।`,
                    ml: `"${navSearchQuery.trim()}" പൊരുത്തപ്പെടുന്ന ഉൽപ്പന്നങ്ങളൊന്നുമില്ല.`,
                    te: `"${navSearchQuery.trim()}" తో సరిపోలే ఉత్పత్తులు లేవు.`
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0">
          {/* Protein Calculator and Call quick-dial buttons removed per request. */}

          {/* Language Switcher — was a 2-way EN/Tamil toggle button; now a
              dropdown since the site supports 5 languages (English, Tamil,
              Hindi, Malayalam, Telugu) and a toggle can't express more than
              2 states. */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setLangMenuOpen((v) => !v)}
              className="flex items-center h-10 gap-1.5 px-3 rounded-full bg-neutral-50 border border-neutral-300 shadow-sm text-[11px] font-bold text-neutral-600 hover:text-emerald-700 hover:border-emerald-400 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              {LANGUAGE_LABELS[lang]}
              <ChevronDown className={`w-3 h-3 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {langMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        onSetLang?.(l);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                        lang === l ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {LANGUAGE_LABELS[l]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-neutral-50 border border-neutral-300 shadow-sm text-neutral-500 hover:text-emerald-700 hover:border-emerald-400 transition cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
            title={pick(lang, { en: 'Notifications', ta: 'அறிவிப்புகள்', hi: 'सूचनाएं', ml: 'അറിയിപ്പുകൾ', te: 'నోటిఫికేషన్లు' })}
          >
            <Bell className="w-4 h-4 text-emerald-600" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Wishlist Button — kept visible at every width (it's the only
              way to reach wishlist on phones; MobileTabBar only covers
              Home/Search/Voice/Cart/Account), just sized down to match the
              other icon buttons on small screens. */}
          <button
            onClick={() => onNavigate('/wishlist')}
            className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-neutral-50 border border-neutral-300 shadow-sm text-neutral-500 hover:text-emerald-700 hover:border-emerald-400 transition cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
            title={pick(lang, { en: 'Wishlist', ta: 'விருப்பப் பட்டியல்', hi: 'विशलिस्ट', ml: 'വിഷ്‌ലിസ്റ്റ്', te: 'విష్‌లిస్ట్' })}
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0F7B3A] text-[10px] font-bold text-white flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => onNavigate('/cart')}
            className="relative flex items-center h-9 sm:h-10 gap-1.5 sm:gap-2 bg-[#0F7B3A] hover:bg-emerald-500 text-white px-2.5 sm:px-3 xl:px-4 rounded-full text-xs font-bold shadow-md transition cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-300 shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden xl:inline">{t.cart}</span>
            <span className="bg-black/25 px-2 py-0.5 rounded-full text-[11px]">{cartCount}</span>
          </button>

          {/* Divider before the profile cluster, matching the reference layout */}
          <span className="hidden xl:block w-px h-6 bg-neutral-200 mx-1 shrink-0" aria-hidden="true" />

          {/* Account / Login / Profile — avatar circle + two-line label
              ("MY PROFILE" caption + name) + chevron, matching the reference
              layout instead of the previous single-line icon + name. */}
          <button
            onClick={() => {
              if (isLoggedIn) {
                onNavigate('/account');
              } else {
                onOpenAuth();
              }
            }}
            className="flex items-center h-9 sm:h-10 gap-2 px-1 sm:px-1.5 xl:pr-3 rounded-full bg-neutral-50 border border-neutral-300 shadow-sm text-neutral-600 hover:border-emerald-400 hover:text-emerald-700 transition cursor-pointer text-xs font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 shrink-0"
            title={isLoggedIn ? pick(lang, { en: 'Go to Profile', ta: 'சுயவிவரத்திற்குச் செல்', hi: 'प्रोफ़ाइल पर जाएं', ml: 'പ്രൊഫൈലിലേക്ക് പോകുക', te: 'ప్రొఫైల్‌కు వెళ్లండి' }) : pick(lang, { en: 'Login', ta: 'உள்நுழைய', hi: 'लॉगिन', ml: 'ലോഗിൻ', te: 'లాగిన్' })}
          >
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
              {isLoggedIn && userProfile.name ? userProfile.name.trim().charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </span>
            <span className="hidden xl:flex flex-col items-start leading-tight">
              <span className="text-[9px] uppercase tracking-wide text-neutral-400 font-bold">
                {isLoggedIn
                  ? pick(lang, { en: 'My Profile', ta: 'எனது சுயவிவரம்', hi: 'मेरी प्रोफ़ाइल', ml: 'എന്റെ പ്രൊഫൈൽ', te: 'నా ప్రొఫైల్' })
                  : pick(lang, { en: 'Welcome', ta: 'வரவேற்கிறோம்', hi: 'स्वागत है', ml: 'സ്വാഗതം', te: 'స్వాగతం' })}
              </span>
              <span className="text-[#0A1F12] font-bold">
                {isLoggedIn ? (userProfile.name ? userProfile.name.split(' ')[0] : pick(lang, { en: 'Profile', ta: 'சுயவிவரம்', hi: 'प्रोफ़ाइल', ml: 'പ്രൊഫൈൽ', te: 'ప్రొఫైల్' })) : t.account}
              </span>
            </span>
            <ChevronDown className="hidden xl:block w-3 h-3 text-neutral-400 shrink-0" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1 sm:p-2 text-neutral-500 hover:text-[#0A1F12] focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded-full"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Bar Category Links (Desktop) — dark branded bar with an
          embedded search + category selector, matching the colored-bar +
          integrated-search nav pattern used on other meat-delivery sites.
          Links are still our own real routes (Subscriptions, Gifting,
          Offers, B2B, Support all exist on this site) rather than swapped
          for pages we don't have. */}
      <nav className="hidden lg:block bg-[#0F7B3A] border-b border-white/10 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.25)] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-6 text-xs font-medium py-3">
          <div className="flex items-center gap-3 shrink-0">
            {primaryLinks.map((link) => (
              <button key={link.path} onClick={() => onNavigate(link.path)} className={navLinkClassDark(link.path)}>
                {link.name}
              </button>
            ))}

            {/* Shop by Category dropdown — keeps the header to one clean row as categories grow */}
            <div className="relative">
              <button
                onClick={() => setCategoriesMenuOpen((v) => !v)}
                className={`flex items-center gap-1 transition whitespace-nowrap px-4 py-2 font-bold text-sm cursor-pointer border-b-2 ${
                  categoriesMenuOpen || categoryLinks.some((c) => c.path === currentPath)
                    ? 'text-white border-white'
                    : 'text-white/85 border-transparent hover:text-white hover:border-white/50'
                }`}
              >
                {pick(lang, { en: 'Category', ta: 'வகைகள்', hi: 'श्रेणी', ml: 'വിഭാഗം', te: 'వర్గం' })}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCategoriesMenuOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-[440px] bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="px-5 pt-4 pb-3 border-b border-neutral-100">
                      <div className="text-sm font-black text-[#0A1F12]">
                        {pick(lang, { en: 'Shop by Category', ta: 'வகைகள் மூலம் ஷாப்பிங்', hi: 'श्रेणी अनुसार खरीदें', ml: 'വിഭാഗം അനുസരിച്ച് ഷോപ്പ് ചെയ്യുക', te: 'వర్గం వారీగా షాపింగ్' })}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {pick(lang, {
                          en: `${categoryLinks.length} categories, fresh every day`,
                          ta: `${categoryLinks.length} வகைகள், தினமும் புதியது`,
                          hi: `${categoryLinks.length} श्रेणियां, हर दिन ताज़ा`,
                          ml: `${categoryLinks.length} വിഭാഗങ്ങൾ, എല്ലാ ദിവസവും ഫ്രഷ്`,
                          te: `${categoryLinks.length} వర్గాలు, ప్రతిరోజూ ఫ్రెష్`
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-3">
                      {categoryLinks.map((link) => (
                        <button
                          key={link.path}
                          onClick={() => {
                            onNavigate(link.path);
                            setCategoriesMenuOpen(false);
                          }}
                          className={`group flex items-center justify-between gap-2 text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            currentPath === link.path
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'text-neutral-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentPath === link.path ? 'bg-emerald-600' : 'bg-neutral-300 group-hover:bg-emerald-500'} transition-colors`} />
                            {link.name}
                          </span>
                          <ChevronDown className="w-3 h-3 -rotate-90 text-neutral-300 opacity-0 group-hover:opacity-100 group-hover:text-emerald-600 transition" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <span className="w-px h-4 bg-white/15 mx-1 shrink-0" aria-hidden="true" />

            {secondaryLinks.map((link) => (
              <button key={link.name} onClick={() => onNavigate(link.path)} className={navLinkClassDark(link.path)}>
                {link.name}
              </button>
            ))}
          </div>
          {/* The search bar that used to be embedded here was a duplicate of
              the one now in the main header above — removed rather than
              kept as a second copy of the same input. This dark bar is just
              the link row now, left-aligned. */}
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => onNavigate('/search')}
              className="w-full bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-lg text-xs text-neutral-500 flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-emerald-600" />
              <span>{t.searchPlaceholder}</span>
            </button>
          </div>

          {/* Protein Calculator quick-access removed per request. */}
          <div className="relative flex items-center justify-end pb-2 border-b border-neutral-200">
            <button
              onClick={() => setMobileLangMenuOpen((v) => !v)}
              className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded font-bold"
            >
              {LANGUAGE_LABELS[lang]}
              <ChevronDown className={`w-3 h-3 transition-transform ${mobileLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileLangMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      onSetLang?.(l);
                      setMobileLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                      lang === l ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-600'
                    }`}
                  >
                    {LANGUAGE_LABELS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            {primaryLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  onNavigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left border ${
                  currentPath === link.path
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-bold'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest pt-2">
            {pick(lang, { en: 'Shop by Category', ta: 'வகைகள் மூலம் ஷாப்பிங்', hi: 'श्रेणी अनुसार खरीदें', ml: 'വിഭാഗം അനുസരിച്ച് ഷോപ്പ് ചെയ്യുക', te: 'వర్గం వారీగా షాపింగ్' })}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {categoryLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  onNavigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left border ${
                  currentPath === link.path
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-bold'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {secondaryLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  onNavigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-lg text-left border ${
                  currentPath === link.path
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 font-bold'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-center text-xs text-neutral-500">
            <span>{pick(lang, { en: 'Customer Care: 1800-446-446', ta: 'வாடிக்கையாளர் சேவை: 1800-446-446', hi: 'ग्राहक सेवा: 1800-446-446', ml: 'കസ്റ്റമർ കെയർ: 1800-446-446', te: 'కస్టమర్ కేర్: 1800-446-446' })}</span>
          </div>
        </div>
      )}

      {/* Pincode Check Modal — the REAL cause of it rendering cut off/clipped
          was found: this <header> has `backdrop-blur-xl` applied directly on
          it, and per the CSS spec, an element with a filter/backdrop-filter
          becomes the *containing block* for any `position: fixed`
          descendant — so "fixed inset-0" was being sized against the
          header's own ~90px-tall box instead of the actual browser
          viewport, no matter how the inner layout was adjusted. Rendering
          the modal through a portal straight into document.body escapes
          that containing block entirely, which is the correct fix (adjusting
          flex/margin classes could never have fixed this). */}
      {showPincodeModal && createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-6 text-[#0A1F12] relative shadow-2xl mx-auto my-10 sm:my-16">
            <button
              onClick={() => setShowPincodeModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[#0A1F12]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
              <MapPin className="w-5 h-5" /> {pick(lang, { en: 'Select Delivery Location', ta: 'டெலிவரி இடத்தைத் தேர்ந்தெடுக்கவும்', hi: 'डिलीवरी स्थान चुनें', ml: 'ഡെലിവറി സ്ഥലം തിരഞ്ഞെടുക്കുക', te: 'డెలివరీ స్థానాన్ని ఎంచుకోండి' })}
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              {pick(lang, {
                en: 'Use your live location, or search your delivery address below.',
                ta: 'உங்கள் நேரடி இருப்பிடத்தைப் பயன்படுத்தவும், அல்லது கீழே உங்கள் டெலிவரி முகவரியைத் தேடவும்.',
                hi: 'अपनी लाइव लोकेशन का उपयोग करें, या नीचे अपना डिलीवरी पता खोजें।',
                ml: 'നിങ്ങളുടെ ലൈവ് ലൊക്കേഷൻ ഉപയോഗിക്കുക, അല്ലെങ്കിൽ താഴെ നിങ്ങളുടെ ഡെലിവറി വിലാസം തിരയുക.',
                te: 'మీ లైవ్ లొకేషన్‌ను ఉపయోగించండి, లేదా దిగువన మీ డెలివరీ చిరునామాను వెతకండి.'
              })}
            </p>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-60 disabled:cursor-wait mb-4"
            >
              {isLocating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  {pick(lang, { en: 'Detecting Your Location...', ta: 'உங்கள் இருப்பிடத்தைக் கண்டறிகிறது...', hi: 'आपकी लोकेशन का पता लगाया जा रहा है...', ml: 'നിങ്ങളുടെ ലൊക്കേഷൻ കണ്ടെത്തുന്നു...', te: 'మీ లొకేషన్‌ను గుర్తిస్తోంది...' })}
                </>
              ) : (
                <>
                  <LocateFixed className="w-3.5 h-3.5" /> {pick(lang, { en: 'Use My Current Location (GPS)', ta: 'என் தற்போதைய இருப்பிடத்தைப் பயன்படுத்து (GPS)', hi: 'मेरी वर्तमान लोकेशन का उपयोग करें (GPS)', ml: 'എന്റെ നിലവിലെ ലൊക്കേഷൻ ഉപയോഗിക്കുക (GPS)', te: 'నా ప్రస్తుత లొకేషన్‌ను ఉపయోగించండి (GPS)' })}
                </>
              )}
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                {pick(lang, { en: 'Or Enter Manually', ta: 'அல்லது கைமுறையாக உள்ளிடவும்', hi: 'या मैन्युअल रूप से दर्ज करें', ml: 'അല്ലെങ്കിൽ സ്വയം നൽകുക', te: 'లేదా మాన్యువల్‌గా నమోదు చేయండి' })}
              </span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            {/* Address-search-style field (matches the reference layout) —
                kept functionally tied to Pincode since that's the one thing
                this site can actually validate; there's no geocoding/address
                autocomplete service configured, so a free-text address field
                here would just be decorative and couldn't really be
                verified. No map, per request. */}
            <form onSubmit={handleVerifyPincode} className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={pick(lang, {
                    en: 'Enter your delivery Pincode, e.g. 560038',
                    ta: 'உங்கள் டெலிவரி பின்கோடை உள்ளிடவும், உதா. 560038',
                    hi: 'अपना डिलीवरी पिनकोड दर्ज करें, उदा. 560038',
                    ml: 'നിങ്ങളുടെ ഡെലിവറി പിൻകോഡ് നൽകുക, ഉദാ. 560038',
                    te: 'మీ డెలివరీ పిన్‌కోడ్‌ను నమోదు చేయండి, ఉదా. 560038'
                  })}
                  value={inputPincode}
                  onChange={(e) => setInputPincode(e.target.value)}
                  className="w-full bg-white border border-neutral-200 focus:border-emerald-500 rounded-xl pl-10 pr-9 py-3 text-sm text-[#0A1F12] focus:outline-none"
                  maxLength={6}
                />
                {inputPincode && (
                  <button
                    type="button"
                    onClick={() => setInputPincode('')}
                    aria-label="Clear"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#0A1F12] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {pincodeStatus && (
                <div
                  className={`text-xs p-3 rounded-xl border ${
                    pincodeStatusOk
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                  }`}
                >
                  {pincodeStatus}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-3 rounded-full text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-900/20"
              >
                {pick(lang, { en: 'Confirm Location', ta: 'இருப்பிடத்தை உறுதிப்படுத்தவும்', hi: 'लोकेशन की पुष्टि करें', ml: 'ലൊക്കേഷൻ സ്ഥിരീകരിക്കുക', te: 'లొకేషన్‌ను నిర్ధారించండి' })}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
