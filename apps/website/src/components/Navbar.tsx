import React, { useState, useEffect } from 'react';
import {
  Search,
  Mic,
  ShoppingBag,
  Heart,
  User,
  MapPin,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Bell,
  Home,
  LayoutGrid,
  Package,
  Percent,
  Briefcase,
  Gift,
  Calculator,
  PhoneCall,
  Truck,
  HelpCircle
} from 'lucide-react';
import { StoreService } from '../lib/storage';
import { SupabaseService } from '../lib/supabaseClient';
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

      const notifs = SupabaseService.getNotifications();
      const unread = notifs.filter((n) => !n.isRead).length;
      setUnreadNotifCount(unread);

      setUserProfile(StoreService.getUserProfile());
      setIsLoggedIn(StoreService.isLoggedIn());
    };

    updateCounts();
    window.addEventListener('protein_cuts_cart_updated', updateCounts);
    window.addEventListener('protein_cuts_wishlist_updated', updateCounts);
    window.addEventListener('protein_cuts_notifications_updated', updateCounts);
    window.addEventListener('protein_cuts_user_updated', updateCounts);

    return () => {
      window.removeEventListener('protein_cuts_cart_updated', updateCounts);
      window.removeEventListener('protein_cuts_wishlist_updated', updateCounts);
      window.removeEventListener('protein_cuts_notifications_updated', updateCounts);
      window.removeEventListener('protein_cuts_user_updated', updateCounts);
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

  // "FAQ" used to be a separate item here pointing at the exact same
  // '/support' route as "Support" (SupportPage's first tab is literally the
  // FAQ/knowledge base) — a genuine duplicate nav entry that just crowded
  // the row for no reason. Merged into one "Support & FAQ" link.
  const secondaryLinks = [
    { name: lang === 'ta' ? 'ஆர்டர் ட்ராக்' : 'Track Order', path: '/account', icon: Truck },
    { name: lang === 'ta' ? 'சந்தா' : 'Subscriptions', path: '/subscriptions', icon: Package },
    { name: lang === 'ta' ? 'பரிசுகள்' : 'Gifting', path: '/gifts', icon: Gift },
    { name: lang === 'ta' ? 'ஆஃபர்கள்' : 'Offers & Deals', path: '/offers', icon: Percent },
    { name: lang === 'ta' ? 'மொத்த வர்த்தகம்' : 'B2B / Bulk', path: '/b2b', icon: Briefcase },
    { name: lang === 'ta' ? 'உதவி & கேள்விகள்' : 'Support & FAQ', path: '/support', icon: HelpCircle }
  ];

  // Link styling for the dark sub-nav bar — a filled rounded-pill highlight
  // for the active/hover state instead of the old bottom-border underline,
  // matching the cleaner pill-nav pattern used by modern app headers.
  const navLinkClassDark = (path: string) =>
    `flex items-center gap-1.5 transition whitespace-nowrap px-3 py-1.5 rounded-full font-semibold cursor-pointer ${
      currentPath === path
        ? 'bg-white/12 text-white font-bold'
        : 'text-white/60 hover:text-white hover:bg-white/5'
    }`;

  const submitNavSearch = () => {
    if (!navSearchQuery.trim()) return;
    onNavigate(`/search?q=${encodeURIComponent(navSearchQuery.trim())}`);
    setNavSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-neutral-200 text-[#08120B] shadow-sm">
      {/* Main Header Row — logo, delivery, search, and all quick actions live
          in a single clean row (matches the lean single-row pattern used by
          modern grocery/meat delivery apps rather than a stacked utility bar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo — placeholder mark until the real logo file is provided */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => onNavigate('/')}
            className="text-left flex items-center gap-2.5 group cursor-pointer focus:outline-none shrink-0"
          >
            <img
              src="/Images/protein-cuts-logo.jpg"
              alt="Protein Cuts Logo"
              className="h-14 w-auto object-contain group-hover:scale-105 transition duration-300 shrink-0"
            />
          </button>

          {/* Delivery Pincode Selector */}
          <button
            onClick={() => setShowPincodeModal(true)}
            className="hidden xl:flex items-center gap-2 bg-neutral-50 border border-neutral-200 hover:border-emerald-400 px-3.5 py-1.5 rounded-full text-xs text-neutral-600 transition cursor-pointer shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <div className="text-left">
              <div className="text-[10px] text-emerald-700 uppercase font-bold">{t.deliverTo}</div>
              <div className="font-bold text-[#08120B] truncate max-w-[120px]">{selectedPincode}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
          </button>
        </div>

        {/* AI & Voice Search Bar Trigger */}
        <div className="flex-1 min-w-0 max-w-xs lg:max-w-sm xl:max-w-md hidden sm:flex items-center gap-2">
          <div className="relative w-full min-w-0">
            <button
              onClick={onOpenAISearch}
              className="w-full bg-neutral-50 border border-neutral-200 hover:border-emerald-400 px-4 py-2.5 rounded-full text-xs text-neutral-500 flex items-center justify-between shadow-sm transition cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{t.searchPlaceholder}</span>
              </div>
              <span className="hidden md:flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-600" /> AI
              </span>
            </button>
          </div>
          <button
            onClick={onOpenVoiceSearch}
            className="p-2.5 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-emerald-700 hover:border-emerald-400 transition cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 shrink-0"
            title="Voice Search"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
          {/* Protein Calculator — small icon button, no separate utility row needed */}
          <button
            onClick={onOpenCalculator}
            className="hidden lg:flex p-2.5 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-emerald-700 hover:border-emerald-400 transition cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
            title={t.proteinCalc}
          >
            <Calculator className="w-4 h-4" />
          </button>

          {/* Call — quick access, replaces the old dedicated utility bar */}
          <a
            href="tel:1800-446-446"
            className="hidden lg:flex p-2.5 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-emerald-700 hover:border-emerald-400 transition"
            title="Call 1800-446-446"
          >
            <PhoneCall className="w-4 h-4" />
          </a>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="hidden md:block px-2.5 py-2 rounded-full bg-neutral-50 border border-neutral-200 text-[11px] font-bold text-neutral-600 hover:text-emerald-700 hover:border-emerald-400 transition cursor-pointer"
          >
            {lang === 'en' ? 'தமிழ்' : 'EN'}
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-emerald-700 hover:border-emerald-400 transition cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-emerald-600" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => onNavigate('/wishlist')}
            className="relative p-2.5 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-emerald-700 hover:border-emerald-400 transition cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
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
            className="relative flex items-center gap-2 bg-[#0F7B3A] hover:bg-emerald-500 text-white px-3 xl:px-4 py-2 rounded-full text-xs font-bold shadow-md transition cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-300 shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden xl:inline">{t.cart}</span>
            <span className="bg-black/25 px-2 py-0.5 rounded-full text-[11px]">{cartCount}</span>
          </button>

          {/* Account / Login / Profile */}
          <button
            onClick={() => {
              if (isLoggedIn) {
                onNavigate('/account');
              } else {
                onOpenAuth();
              }
            }}
            className="flex items-center gap-1.5 p-2.5 xl:px-3 xl:py-2 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-600 hover:border-emerald-400 hover:text-emerald-700 transition cursor-pointer text-xs font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 shrink-0"
            title={isLoggedIn ? 'Go to Profile' : 'Login'}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span className="hidden xl:inline">
              {isLoggedIn ? (userProfile.name ? userProfile.name.split(' ')[0] : 'Profile') : t.account}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-500 hover:text-[#08120B] focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded-full"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Bar Category Links (Desktop) — dark branded bar with an
          embedded search + category selector, matching the colored-bar +
          integrated-search nav pattern used on other meat-delivery sites.
          Links are still our own real routes (Subscriptions, Gifting,
          Offers, B2B, Support all exist on this site) rather than swapped
          for pages we don't have. */}
      <nav className="hidden lg:block bg-[#08120B] px-4 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 text-xs font-medium py-2.5">
          <div className="flex items-center gap-1 shrink-0">
            {primaryLinks.map((link) => (
              <button key={link.path} onClick={() => onNavigate(link.path)} className={navLinkClassDark(link.path)}>
                <link.icon className="w-3.5 h-3.5" />
                {link.name}
              </button>
            ))}

            {/* Shop by Category dropdown — keeps the header to one clean row as categories grow */}
            <div className="relative">
              <button
                onClick={() => setCategoriesMenuOpen((v) => !v)}
                className={`flex items-center gap-1.5 transition whitespace-nowrap px-3 py-1.5 rounded-full font-semibold cursor-pointer ${
                  categoriesMenuOpen || categoryLinks.some((c) => c.path === currentPath)
                    ? 'bg-white/12 text-white font-bold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                {lang === 'ta' ? 'வகைகள்' : 'Categories'}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCategoriesMenuOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-[420px] bg-white border border-neutral-200 rounded-2xl shadow-xl p-3 grid grid-cols-2 gap-1.5 z-50">
                    {categoryLinks.map((link) => (
                      <button
                        key={link.path}
                        onClick={() => {
                          onNavigate(link.path);
                          setCategoriesMenuOpen(false);
                        }}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          currentPath === link.path
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-neutral-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {link.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <span className="w-px h-4 bg-white/15 mx-1 shrink-0" aria-hidden="true" />

            {secondaryLinks.map((link) => (
              <button key={link.name} onClick={() => onNavigate(link.path)} className={navLinkClassDark(link.path)}>
                <link.icon className="w-3.5 h-3.5" />
                {link.name}
              </button>
            ))}
          </div>

          {/* Embedded search + category selector, integrated directly into
              the colored bar rather than as a separate row. */}
          <div className="flex items-center bg-white rounded-full overflow-hidden shrink-0 shadow-sm w-full max-w-xs xl:max-w-sm">
            <input
              type="text"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitNavSearch();
              }}
              placeholder="Search for products"
              className="flex-1 min-w-0 px-4 py-2 text-xs text-[#08120B] placeholder-neutral-400 focus:outline-none"
            />
            <select
              onChange={(e) => {
                if (e.target.value) onNavigate(e.target.value);
                e.target.value = '';
              }}
              defaultValue=""
              aria-label="Jump to category"
              className="hidden xl:block text-[11px] font-semibold text-neutral-500 border-l border-neutral-200 px-2 py-2 bg-white focus:outline-none cursor-pointer max-w-[120px] shrink-0"
            >
              <option value="">All Categories</option>
              {categoryLinks.map((link) => (
                <option key={link.path} value={link.path}>
                  {link.name}
                </option>
              ))}
            </select>
            <button
              onClick={submitNavSearch}
              aria-label="Search"
              className="px-3.5 py-2.5 bg-[#0F7B3A] hover:bg-emerald-500 text-white transition cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={onOpenAISearch}
              className="w-full bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-lg text-xs text-neutral-500 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-600" />
                <span>AI Smart Search...</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            </button>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <button
              onClick={onOpenCalculator}
              className="text-xs text-emerald-700 font-bold flex items-center gap-1"
            >
              <Calculator className="w-4 h-4" /> {t.proteinCalc}
            </button>
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

      {/* Pincode Check Modal */}
      {showPincodeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-6 text-[#08120B] relative shadow-2xl">
            <button
              onClick={() => setShowPincodeModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-[#08120B]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
              <MapPin className="w-5 h-5" /> Select Delivery Location
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Enter your Pincode to check express 30-minute cold chain delivery coverage and live product availability in your neighborhood.
            </p>

            <form onSubmit={handleVerifyPincode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Pincode</label>
                <input
                  type="text"
                  placeholder="e.g. 560038"
                  value={inputPincode}
                  onChange={(e) => setInputPincode(e.target.value)}
                  className="w-full bg-white border border-neutral-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-[#08120B] focus:outline-none"
                  maxLength={6}
                />
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
                className="w-full bg-[#0F7B3A] hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Verify Delivery Slot
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
