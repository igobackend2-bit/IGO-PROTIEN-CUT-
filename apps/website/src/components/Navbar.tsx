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
import { Language, TRANSLATIONS } from '../lib/language';

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
  onToggleLang?: () => void;
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
  lang = 'en',
  onToggleLang
}) => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [selectedPincode, setSelectedPincode] = useState('560038 (Indiranagar)');
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [inputPincode, setInputPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
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
    if (inputPincode.trim().length === 6) {
      setSelectedPincode(`${inputPincode} (Express Available)`);
      setPincodeStatus('30-Minute Express Cold Chain Delivery Active in your zone!');
      setTimeout(() => {
        setShowPincodeModal(false);
        setPincodeStatus(null);
      }, 1500);
    } else {
      setPincodeStatus('Please enter a valid 6-digit Pincode.');
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
      setPincodeStatus('Live location isn\'t supported on this browser. Please enter your Pincode instead.');
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

        setPincodeStatus('Live location detected — 30-Minute Express Cold Chain Delivery Active in your zone!');
        setIsLocating(false);
        setTimeout(() => {
          setShowPincodeModal(false);
          setPincodeStatus(null);
        }, 1800);
      },
      (err) => {
        setIsLocating(false);
        setPincodeStatus(
          err.code === err.PERMISSION_DENIED
            ? 'Location access was denied. Please allow location access or enter your Pincode manually.'
            : 'Could not detect your live location. Please enter your Pincode instead.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Core links that stay visible at the top level of the desktop nav bar —
  // kept to the Home link only, matching the lean nav pattern used across
  // reference meat-delivery sites (Meatigo, TenderCuts, Crowdcow); a generic
  // "Discover" link isn't something any of those sites carry, and the AI
  // search bar already covers discovery, so it was removed rather than kept
  // as an unfamiliar, redundant nav item.
  const primaryLinks = [
    { name: lang === 'ta' ? 'முகப்பு' : 'Home', path: '/', icon: Home }
  ];

  // All shop-by-category links grouped under the "Categories" dropdown so the
  // header doesn't overflow into a cramped single row as more categories are added
  const categoryLinks = [
    { name: lang === 'ta' ? 'சிக்கன்' : 'Chicken', path: '/category/chicken' },
    { name: lang === 'ta' ? 'மட்டன்' : 'Mutton', path: '/category/mutton' },
    { name: lang === 'ta' ? 'பீஃப்' : 'Beef', path: '/category/beef' },
    { name: lang === 'ta' ? 'மீன் & சீஃபுட்' : 'Fish & Seafood', path: '/category/fish' },
    { name: lang === 'ta' ? 'கருவாடு' : 'Dry Fish', path: '/category/dry-fish' },
    { name: lang === 'ta' ? 'முட்டை' : 'Eggs', path: '/category/eggs' },
    { name: lang === 'ta' ? 'ஆரோக்கிய சேர்க்கைகள்' : 'Healthy Add-ons', path: '/category/healthy-addons' },
    { name: lang === 'ta' ? 'ரெடி-டு-குக்' : 'Ready-to-Cook', path: '/category/ready-to-cook' },
    { name: lang === 'ta' ? 'உறைந்த உணவு' : 'Frozen Food', path: '/category/frozen-food' },
    { name: lang === 'ta' ? 'பிரியாணி கிட்' : 'Biryani Kits', path: '/category/biryani' },
    { name: lang === 'ta' ? 'கோல்ட் கட்ஸ்' : 'Cold Cuts', path: '/category/cold-cuts' },
    { name: lang === 'ta' ? 'கம்போஸ்' : 'Combos', path: '/category/combo-packs' }
  ];

  // Ordered to match the standard professional nav pattern (browse → business
  // → brand/content → self-serve help → direct contact last as the final
  // CTA-style item): Home, Categories (primary row) → B2B → About → Blog →
  // FAQ → Contact. FAQ sits right before Contact since that's the "check
  // this before you reach out" step on most retail sites — it has no
  // standalone page, so it points at `/support`, the real "Support & FAQ"
  // page already reachable from the footer/account menu.
  const secondaryLinks = [
    { name: lang === 'ta' ? 'மொத்த வர்த்தகம்' : 'B2B', path: '/b2b', icon: Briefcase },
    { name: lang === 'ta' ? 'எங்களை பற்றி' : 'About', path: '/about', icon: Info },
    { name: lang === 'ta' ? 'வலைப்பதிவு' : 'Blog', path: '/blog', icon: Newspaper },
    { name: lang === 'ta' ? 'கேள்விகள்' : 'FAQ', path: '/support', icon: HelpCircle },
    { name: lang === 'ta' ? 'தொடர்பு' : 'Contact', path: '/contact', icon: Mail }
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
        <div className="flex-1 min-w-[130px] sm:min-w-[160px] max-w-[180px] sm:max-w-[220px] md:max-w-xs hidden sm:flex items-center justify-center shrink">
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitNavSearch();
              }}
              placeholder={t.searchPlaceholder}
              className="flex-1 min-w-0 bg-transparent px-2 py-2 text-xs text-[#0A1F12] placeholder-neutral-400 focus:outline-none"
            />
            <button
              onClick={onOpenVoiceSearch}
              title="Voice Search"
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
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0">
          {/* Protein Calculator and Call quick-dial buttons removed per request. */}

          {/* Language Toggle — globe icon added to match the reference layout */}
          <button
            onClick={onToggleLang}
            className="hidden md:flex items-center h-10 gap-1.5 px-3 rounded-full bg-neutral-50 border border-neutral-300 shadow-sm text-[11px] font-bold text-neutral-600 hover:text-emerald-700 hover:border-emerald-400 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === 'en' ? 'தமிழ்' : 'EN'}
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-neutral-50 border border-neutral-300 shadow-sm text-neutral-500 hover:text-emerald-700 hover:border-emerald-400 transition cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
            title="Notifications"
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
            title="Wishlist"
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
            title={isLoggedIn ? 'Go to Profile' : 'Login'}
          >
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
              {isLoggedIn && userProfile.name ? userProfile.name.trim().charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </span>
            <span className="hidden xl:flex flex-col items-start leading-tight">
              <span className="text-[9px] uppercase tracking-wide text-neutral-400 font-bold">
                {isLoggedIn ? 'My Profile' : 'Welcome'}
              </span>
              <span className="text-[#0A1F12] font-bold">
                {isLoggedIn ? (userProfile.name ? userProfile.name.split(' ')[0] : 'Profile') : t.account}
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
                {lang === 'ta' ? 'வகைகள்' : 'Category'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCategoriesMenuOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-[440px] bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="px-5 pt-4 pb-3 border-b border-neutral-100">
                      <div className="text-sm font-black text-[#0A1F12]">Shop by Category</div>
                      <div className="text-[11px] text-neutral-400">{categoryLinks.length} categories, fresh every day</div>
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
          <div className="flex items-center justify-end pb-2 border-b border-neutral-200">
            <button
              onClick={onToggleLang}
              className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded font-bold"
            >
              {lang === 'en' ? 'தமிழ்' : 'English'}
            </button>
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
            {lang === 'ta' ? 'வகைகள் மூலம் ஷாப்பிங்' : 'Shop by Category'}
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
            <span>Customer Care: 1800-446-446</span>
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
              <MapPin className="w-5 h-5" /> Select Delivery Location
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Use your live location, or search your delivery address below.
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
                  Detecting Your Location...
                </>
              ) : (
                <>
                  <LocateFixed className="w-3.5 h-3.5" /> Use My Current Location (GPS)
                </>
              )}
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Or Enter Manually</span>
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
                  placeholder="Enter your delivery Pincode, e.g. 560038"
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
                    pincodeStatus.includes('Active')
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
                Confirm Location
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
