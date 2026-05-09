import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, User, Heart, Mic, Crown, TrendingUp, Sparkles, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useCart } from '../context/CartContext';
import WishlistDrawer from './WishlistDrawer';
import ProfileModal from './ProfileModal';
import AuthModal from './AuthModal';

const BrandLogo = ({ light = false }) => (
  <Link to="/" className="flex items-center gap-3 group">
    <div className="relative w-14 h-14 overflow-hidden rounded-full bg-white flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-lg">
      <img 
        src="/logo.png" 
        alt="Protein Cuts Logo" 
        className="w-full h-full object-cover"
      />
    </div>
    <div className="flex flex-col">
      <span className={cn("font-display font-bold text-lg tracking-tight leading-none", light ? "text-white" : "text-neutral-dark")}>
        PROTEIN <span className="text-igo-green">CUTS</span>
      </span>
      <span className={cn("text-[8px] font-bold uppercase tracking-[0.2em] mt-0.5", light ? "text-white/40" : "text-neutral-400")}>
        Unit of IGO Group
      </span>
    </div>
  </Link>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);


  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, setIsCartOpen, wishlist } = useCart();

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    
    setIsListening(true);

    recognition.onstart = () => {
      console.log("Voice recognition started...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Speech captured:", transcript);
      setSearchQuery(transcript);
      window.dispatchEvent(new CustomEvent('searchQuery', { detail: transcript }));
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Voice recognition error:", event.error);
      if (event.error === 'no-speech') {
        // Silent fail or brief retry
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log("Voice recognition ended.");
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
      setIsListening(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Check for existing session
    const savedUser = localStorage.getItem('igo_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.isAuthenticated) {
          setIsAuthenticated(true);
          setUser(user);
        }

      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }

    const handleProfileTrigger = () => {
      handleProfileClick();
    };

    const handleVoiceTrigger = () => {
      handleVoiceSearch();
    };

    window.addEventListener('openProfile', handleProfileTrigger);
    window.addEventListener('startVoiceSearch', handleVoiceTrigger);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('openProfile', handleProfileTrigger);
      window.removeEventListener('startVoiceSearch', handleVoiceTrigger);
    };

  }, [isAuthenticated]); // Re-bind when auth state changes

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    window.dispatchEvent(new CustomEvent('searchQuery', { detail: value }));
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setIsProfileOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const navLinks = [
    { name: 'Products', href: '/#products' },
    { name: 'Traceability', href: '/#traceability' },
    { name: 'B2B', href: '/#b2b' },
    { name: 'About', href: '/#about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Prime', href: '/#prime', highlight: true },
  ];

  return (
    <nav
      className={cn(
        'sticky top-0 left-0 right-0 z-40 transition-all duration-300 border-b',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md py-3 border-neutral-200 shadow-sm'
          : 'bg-white py-4 border-neutral-100'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <BrandLogo />

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-sm mx-8 relative group">
          <div className="w-full relative z-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search chicken, mutton, fish..."
              className="w-full pl-10 pr-10 py-2.5 bg-neutral-100 rounded-xl text-sm border border-transparent focus:border-igo-green/40 focus:bg-white focus:outline-none transition-all"
            />
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Mic button clicked");
                handleVoiceSearch();
              }}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-all z-[70] cursor-pointer hover:bg-neutral-200",
                isListening ? "text-red-500 bg-red-50 scale-110 animate-pulse" : "text-neutral-400 hover:text-igo-green"
              )}
              title="Voice Search (Tamil/English)"
              type="button"
            >
              <Mic className="w-4 h-4 pointer-events-none" />
            </button>
          </div>

          {/* Search Suggestions Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-neutral-100 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-40 overflow-hidden translate-y-2 group-focus-within:translate-y-0">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-igo-green" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Mutton Curry Cut', 'Chicken Breast', 'Kaadai', 'Tiger Prawns', 'Vanjaram'].map(term => (
                  <button 
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      window.dispatchEvent(new CustomEvent('searchQuery', { detail: term }));
                    }}
                    className="px-3 py-1.5 bg-neutral-50 hover:bg-igo-green/10 hover:text-igo-green rounded-lg text-xs font-medium transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-neutral-50 p-3 flex items-center justify-between">
              <span className="text-[9px] font-bold text-neutral-400 uppercase">Recent Searches</span>
              <button className="text-[9px] font-bold text-igo-green hover:underline uppercase">Clear All</button>
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {

            const LinkComponent: any = link.href?.startsWith('/#') ? 'a' : Link;
            return (
              <LinkComponent
                key={link.name}
                to={link.href?.startsWith('/#') ? undefined : link.href}
                href={link.href?.startsWith('/#') ? link.href : undefined}
                className={cn(
                  "text-sm font-medium transition-all flex items-center gap-1.5",
                  link.highlight 
                    ? "text-igo-gold hover:text-igo-gold/80 font-bold px-3 py-1.5 bg-igo-gold/10 rounded-lg animate-pulse" 
                    : "text-neutral-600 hover:text-igo-green"
                )}
              >
                {link.highlight && <Crown className="w-3.5 h-3.5 fill-igo-gold" />}
                {link.name}
              </LinkComponent>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search */}
          <button
            className="md:hidden w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-igo-green transition-colors"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Wishlist */}
          <button 
            onClick={() => setIsWishlistOpen(true)}
            className="hidden sm:flex w-9 h-9 rounded-xl bg-neutral-100 items-center justify-center text-neutral-600 hover:text-red-400 transition-colors relative"
          >
            <Heart className="w-4 h-4" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Account */}
          <button 
            onClick={handleProfileClick}
            className="hidden sm:flex w-9 h-9 rounded-xl bg-neutral-100 items-center justify-center text-neutral-600 hover:text-igo-green transition-colors relative overflow-hidden group"
          >
            {isAuthenticated && user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt="Profile" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            ) : (
              <User className="w-4 h-4" />
            )}

            {isAuthenticated && (
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-igo-green rounded-full border-2 border-white" />
            )}
          </button>


          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-igo-green text-white pl-3 pr-4 py-2 rounded-xl font-bold text-sm hover:bg-igo-green/90 transition-all shadow-md shadow-igo-green/20 relative active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  key={cartCount}
                  className="w-5 h-5 bg-white text-igo-green text-xs flex items-center justify-center rounded-full font-bold"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Mobile Menu */}
          <button
            className="md:hidden w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-dark"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search chicken, mutton, fish..."
                  autoFocus
                  className="w-full pl-10 pr-12 py-3 bg-neutral-100 rounded-xl text-sm border border-transparent focus:border-igo-green/40 focus:bg-white focus:outline-none transition-all"
                />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Mobile mic button clicked");
                    handleVoiceSearch();
                  }}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 p-2 transition-all z-[60] cursor-pointer",
                    isListening ? "text-red-500 scale-125 animate-pulse" : "text-neutral-400 hover:text-igo-green"
                  )}
                >
                  <Mic className="w-4 h-4 pointer-events-none" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden md:hidden border-t border-neutral-100 bg-white"
          >
            <div className="flex flex-col px-4 py-4 gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-neutral-dark hover:text-igo-green py-2 hover:bg-neutral-50 px-3 rounded-xl transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="mt-2 pt-2 border-t border-neutral-100">
                <button 
                  onClick={handleProfileClick}
                  className="w-full bg-igo-green text-white py-3 rounded-xl font-bold text-sm"
                >
                  {isAuthenticated ? 'My Account' : 'Login / Sign Up'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={() => {
          setIsAuthModalOpen(false);
          setIsAuthenticated(true);
          setIsProfileOpen(true);
        }} 
      />
    </nav>
  );
};

export default Navbar;
