import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { LiveOrderTracking } from './components/LiveOrderTracking';
import { AISearchModal } from './components/AISearchModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { UserAuthModal } from './components/UserAuthModal';
import { IGOEcosystemModal } from './components/IGOEcosystemModal';
import { ProteinCalculatorModal } from './components/ProteinCalculatorModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { FloatingContactWidget } from './components/FloatingContactWidget';
import { MobileTabBar } from './components/MobileTabBar';
import { AddedToCartOverlay } from './components/AddedToCartOverlay';

import { HomePage } from './pages/HomePage';
import { SearchBrowsePage } from './pages/SearchBrowsePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { OffersPage } from './pages/OffersPage';
import { SupportPage } from './pages/SupportPage';
import { CategoryPage } from './pages/CategoryPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { RecipesPage } from './pages/RecipesPage';
import { AboutPage } from './pages/AboutPage';
import { FranchisePage } from './pages/FranchisePage';
import { B2BPage } from './pages/B2BPage';
import { GiftingPage } from './pages/GiftingPage';
import { WishlistPage } from './pages/WishlistPage';
import { CareersPage } from './pages/CareersPage';
import { ContactPage } from './pages/ContactPage';
import { PolicyPage } from './pages/PolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { UserAccountPage } from './pages/UserAccountPage';
import { BlogPage } from './pages/BlogPage';
import { CartPage } from './pages/CartPage';
import { AdminDashboard } from './pages/AdminDashboard';

import { Product, ProductWeightOption, ProductCategory } from './types';
import { StoreService } from './lib/storage';
import { Language, LanguageContext, translate } from './lib/language';
import { isActiveAdmin, onAuthStateChange, onPasswordRecovery, getCurrentUser } from './lib/api/auth';
import { AdminLogin } from './components/admin/AdminLogin';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  // Tracked separately from currentPath so query-string-only navigations
  // (e.g. /search?q=chicken -> /search?q=mutton) still trigger a re-render
  // and remount of the target page even though the pathname is unchanged.
  const [currentQuery, setCurrentQuery] = useState<string>(() => window.location.search || '');

  const [products, setProducts] = useState<Product[]>(() => StoreService.getProducts());
  const [lang, setLang] = useState<Language>('en');
  const t = (key: string) => translate(lang, key);

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  // Normally the auth modal always opens on the login view. When the
  // customer arrives via a Supabase password-reset email link, it needs to
  // instead pop open straight into the "set a new password" view — see the
  // onPasswordRecovery subscription below.
  const [authInitialView, setAuthInitialView] = useState<'login' | 'reset'>('login');
  const [isEcosystemOpen, setIsEcosystemOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Admin access. Starts as 'checking' so the dashboard is never rendered
  // optimistically while the membership lookup is still in flight — the old
  // behaviour rendered /admin to everyone with no check at all.
  const [adminAccess, setAdminAccess] = useState<'checking' | 'allowed' | 'denied'>('checking');

  // Distinguishes "nobody is signed in" from "a customer is signed in but
  // isn't staff" — the login screen wording differs between the two.
  const [hasSession, setHasSession] = useState(false);
  // True once the first real Supabase session check has resolved. Used to
  // gate the /account route: without this, a signed-out visitor would see
  // hasSession=false for one render on every page load (even if they really
  // are logged in) before the async check resolves, which would incorrectly
  // flash a "please sign in" prompt for real customers too.
  const [sessionChecked, setSessionChecked] = useState(false);

  // Sync Products from storage
  const refreshProducts = () => {
    setProducts(StoreService.getProducts());
  };

  // Pull the live catalog and coupons from the canonical, admin-owned tables.
  // getProducts() has already returned the cached/seed copy synchronously, so
  // this only ever upgrades what's on screen — it never blocks first paint.
  useEffect(() => {
    let cancelled = false;

    StoreService.hydrateCatalog()
      .then((fresh) => {
        if (!cancelled && fresh) setProducts(fresh);
      })
      .catch(() => {
        // Non-fatal: the cached catalog stays on screen.
      });

    StoreService.hydrateCoupons().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  // Re-check admin membership against the app's `admin_users` table whenever
  // the session changes. This replaces the previous `email.includes('admin')`
  // check, which handed Super Admin to anyone who typed the right address.
  useEffect(() => {
    let cancelled = false;

    const check = () => {
      Promise.all([isActiveAdmin(), getCurrentUser()])
        .then(([allowed, user]) => {
          if (cancelled) return;
          setHasSession(Boolean(user));
          setSessionChecked(true);
          setAdminAccess(allowed ? 'allowed' : 'denied');
          // Pull the real wishlist down from Supabase whenever a session
          // appears (sign-in, or already signed in on page load) — no-ops
          // internally when signed out. See StoreService.hydrateWishlist().
          if (user) StoreService.hydrateWishlist().catch(() => {});
        })
        .catch(() => {
          if (!cancelled) {
            setAdminAccess('denied');
            setSessionChecked(true);
          }
        });
    };

    check();
    const unsubscribe = onAuthStateChange(check);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  // Password-reset email links land here with a temporary recovery session
  // already established (Supabase auto-detects it from the URL). Previously
  // nothing listened for this, so the customer was just silently signed in
  // with no chance to actually set a new password. Now it pops the auth
  // modal open directly into that "set a new password" screen.
  useEffect(() => {
    const unsubscribe = onPasswordRecovery(() => {
      setAuthInitialView('reset');
      setIsAuthOpen(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleProductsUpdate = () => {
      setProducts(StoreService.getProducts());
    };

    window.addEventListener('protein_cuts_products_updated', handleProductsUpdate);

    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setCurrentQuery(window.location.search || '');
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('protein_cuts_products_updated', handleProductsUpdate);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    const [pathname, query = ''] = path.split('?');
    setCurrentPath(pathname);
    setCurrentQuery(query ? `?${query}` : '');
    setTrackingOrderId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [addedToCartInfo, setAddedToCartInfo] = useState<{
    product: Product;
    weight: ProductWeightOption;
    quantity: number;
  } | null>(null);

  // Short two-note confirmation chime, synthesized with the Web Audio API so
  // there's no sound asset to source/host — fires on the same click that
  // satisfies the browser's autoplay-permission requirement.
  const playAddToCartSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      [880, 1320].forEach((freq, i) => {
        const start = ctx.currentTime + i * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {
      // Autoplay/audio restrictions — silently skip, the visual overlay still shows.
    }
  };

  const handleAddToCart = (
    product: Product,
    weight: ProductWeightOption,
    quantity: number,
    cutPreference?: string
  ) => {
    const cart = StoreService.getCart();
    // Cut preference is part of the match too — otherwise "Curry Cut" and
    // "Boneless Cubes" of the same product/weight would silently merge into
    // one line and the second choice would be lost, which is exactly the
    // "preference isn't showing in the cart" symptom this was fixed for.
    const existingIdx = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedWeight.label === weight.label &&
        (item.cutPreference ?? '') === (cutPreference ?? '')
    );

    if (existingIdx >= 0) {
      cart[existingIdx].quantity += quantity;
    } else {
      cart.push({
        product,
        selectedWeight: weight,
        quantity,
        ...(cutPreference ? { cutPreference } : {})
      });
    }

    StoreService.saveCart(cart);
    setAddedToCartInfo({ product, weight, quantity });
    playAddToCartSound();
  };

  const handleTrackOrder = (orderId: string) => {
    // Navigate to the real URL rather than flipping component state, so the
    // browser back button works and the page can be linked to or refreshed.
    navigate(`/tracking/${encodeURIComponent(orderId)}`);
  };

  // Route Renderer
  const renderMainContent = () => {
    if (currentPath === '/admin') {
      // NOTE: /admin never reaches here in practice — it's intercepted before
      // the site layout is rendered (see the early return below) so the staff
      // area has no customer navbar, footer or marketing chrome. This branch
      // stays only as a safety net.
      return (
        <AdminDashboard
          products={products}
          onNavigate={navigate}
          onRefreshProducts={refreshProducts}
        />
      );
    }

    if (trackingOrderId) {
      return (
        <LiveOrderTracking
          orderId={trackingOrderId}
          onBack={() => setTrackingOrderId(null)}
        />
      );
    }

    // Order tracking by URL — /tracking/<orderId>
    //
    // Tracking previously only worked through component state, reached by
    // pressing "Track" inside the account page. But notifications carry a
    // deepLink of '/tracking/<id>' (see mockData INITIAL_NOTIFICATIONS), and
    // the delivery emails do too, so opening one always hit the 404 page.
    // Handling the path here makes those links work and makes a tracking page
    // shareable — you can send someone the URL.
    if (currentPath.startsWith('/tracking/')) {
      const orderId = decodeURIComponent(currentPath.replace('/tracking/', '')).trim();
      if (orderId) {
        return (
          <LiveOrderTracking
            key={orderId}
            orderId={orderId}
            onBack={() => navigate('/account')}
          />
        );
      }
    }

    if (currentPath.startsWith('/product/')) {
      const prodId = currentPath.replace('/product/', '');
      const matched = products.find((p) => p.id === prodId) || products[0];
      return (
        <ProductDetailPage
          key={currentPath}
          product={matched}
          allProducts={products}
          onAddToCart={handleAddToCart}
          onSelectProduct={(p) => navigate(`/product/${p.id}`)}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath.startsWith('/recipes/')) {
      const recipeId = currentPath.replace('/recipes/', '');
      return (
        <RecipesPage
          key={currentPath}
          products={products}
          onAddToCart={handleAddToCart}
          onNavigate={navigate}
          initialRecipeId={recipeId}
        />
      );
    }

    if (currentPath.startsWith('/category/')) {
      const cat = currentPath.replace('/category/', '') as ProductCategory;
      return (
        <SearchBrowsePage
          key={currentPath}
          products={products}
          initialCategory={cat}
          onSelectProduct={(p) => navigate(`/product/${p.id}`)}
          onAddToCart={handleAddToCart}
          onNavigate={navigate}
        />
      );
    }

    switch (currentPath) {
      case '/search': {
        const qParam = new URLSearchParams(currentQuery).get('q') || '';
        return (
          <SearchBrowsePage
            key={currentQuery}
            products={products}
            initialSearchQuery={qParam}
            onSelectProduct={(p) => navigate(`/product/${p.id}`)}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
          />
        );
      }
      case '/offers':
        return (
          <OffersPage
            products={products}
            onSelectProduct={(p) => navigate(`/product/${p.id}`)}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
          />
        );
      case '/support':
        return <SupportPage onNavigate={navigate} />;
      case '/subscriptions':
        return <SubscriptionsPage products={products} onNavigate={navigate} />;
      case '/recipes':
        return <RecipesPage products={products} onAddToCart={handleAddToCart} onNavigate={navigate} />;
      case '/about':
        return <AboutPage />;
      case '/blog':
        return <BlogPage />;
      case '/franchise':
        return <FranchisePage />;
      case '/b2b':
        return <B2BPage />;
      case '/gifts':
        return (
          <GiftingPage
            products={products}
            onSelectProduct={(p) => navigate(`/product/${p.id}`)}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
          />
        );
      case '/wishlist':
        return (
          <WishlistPage
            products={products}
            onSelectProduct={(p) => navigate(`/product/${p.id}`)}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
          />
        );
      case '/careers':
        return <CareersPage />;
      case '/contact':
        return <ContactPage onNavigate={navigate} />;
      case '/policy':
        return <PolicyPage section={new URLSearchParams(currentQuery).get('section') ?? undefined} />;
      // Dedicated single-policy pages — previously every policy link landed
      // on the same combined /policy page. These give each one its own real
      // URL, matching how most e-commerce sites structure Privacy/Terms/etc.
      case '/shipping-policy':
        return <PolicyPage only="shipping-policy" onNavigate={navigate} />;
      case '/refund-policy':
        return <PolicyPage only="return-policy" onNavigate={navigate} />;
      case '/privacy-policy':
        return <PolicyPage only="privacy-policy" onNavigate={navigate} />;
      case '/terms-conditions':
        return <PolicyPage only="terms-of-use" onNavigate={navigate} />;
      case '/account': {
        // Previously this route rendered UserAccountPage unconditionally, so
        // a signed-out visitor who typed /account (or clicked the header
        // greeting before logging in) saw a fully-populated account page —
        // fake wallet balance, reward points, a saved address and a working
        // "Logout" button — because the page's own profile state fell back
        // to a hardcoded mock persona rather than checking whether anyone
        // was actually signed in. Now the route itself requires a real
        // Supabase session before it will render any account content.
        if (!sessionChecked) {
          // Avoid flashing the sign-in prompt at a real, logged-in customer
          // for the one render before the async session check resolves.
          return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24" />;
        }
        if (!hasSession) {
          return (
            <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4">
              <h1 className="text-2xl font-black text-[#0A1F12]">Sign in to view your account</h1>
              <p className="text-sm text-neutral-500">
                Your orders, wallet, reward points and saved addresses are only visible once you're signed in.
              </p>
              <button
                onClick={() => {
                  setAuthInitialView('login');
                  setIsAuthOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-[#0F7B3A] hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-2xl text-sm transition cursor-pointer"
              >
                Sign In
              </button>
            </div>
          );
        }
        return (
          <UserAccountPage
            onNavigate={navigate}
            // This prop was never passed, so the "Track" button on each order
            // silently did nothing — the optional-call guard swallowed it.
            onSelectOrderForTracking={(order) => handleTrackOrder(order.id)}
            // Lets `/account?tab=profile` (e.g. Cart's address "Edit" button)
            // land directly on that tab instead of always defaulting to Orders.
            initialTab={new URLSearchParams(currentQuery).get('tab') ?? undefined}
          />
        );
      }
      case '/cart':
        return (
          <CartPage
            products={products}
            onSelectProduct={(p) => navigate(`/product/${p.id}`)}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
            onTrackOrder={handleTrackOrder}
            onOpenAuth={() => {
              setAuthInitialView('login');
              setIsAuthOpen(true);
            }}
          />
        );
      case '/':
        return (
          <HomePage
            products={products}
            onSelectProduct={(p) => navigate(`/product/${p.id}`)}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
          />
        );
      default:
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  // ── /admin is a standalone staff area ───────────────────────────────────
  //
  // Returned BEFORE the site layout, so it renders without the customer
  // navbar, footer, mobile tab bar, floating contact widget or offer ribbon.
  // Typing /admin gives you a login screen; once the account is confirmed as
  // an active admin, the dashboard replaces it.
  if (currentPath === '/admin') {
    if (adminAccess === 'checking') {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0A1F12]">
          <p className="text-sm text-white/50">Checking access…</p>
        </div>
      );
    }

    if (adminAccess === 'denied') {
      return (
        <AdminLogin
          onAuthenticated={() => setAdminAccess('allowed')}
          onExit={() => navigate('/')}
          deniedForCurrentUser={hasSession}
        />
      );
    }

    return (
      <div className="min-h-screen bg-white font-sans text-[#0A1F12] antialiased">
        <AdminDashboard
          products={products}
          onNavigate={navigate}
          onRefreshProducts={refreshProducts}
        />
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, t }}>
    <div className="min-h-screen bg-white font-sans text-[#0A1F12] antialiased selection:bg-[#0F7B3A] selection:text-white flex flex-col justify-between">
      {/* Navbar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => {
          setAuthInitialView('login');
          setIsAuthOpen(true);
        }}
        onOpenAISearch={() => setIsAISearchOpen(true)}
        onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
        onOpenEcosystem={() => setIsEcosystemOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onNavigate={navigate}
        currentPath={currentPath}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ta' : 'en'))}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16 lg:pb-0">{renderMainContent()}</main>

      {/* Footer — shows on every page except the profile (/account), per request. */}
      {currentPath !== '/account' && <Footer onNavigate={navigate} />}

      {/* Persistent floating contact + mobile bottom tab bar */}
      <FloatingContactWidget onNavigate={navigate} />
      <MobileTabBar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
      />

      {/* Full-screen "Added to Cart" confirmation — fires from every Add
          button site-wide since they all funnel through handleAddToCart. */}
      <AddedToCartOverlay info={addedToCartInfo} onClose={() => setAddedToCartInfo(null)} />

      {/* Modals & Drawers */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigate={navigate}
      />

      <AISearchModal
        isOpen={isAISearchOpen}
        onClose={() => setIsAISearchOpen(false)}
        onSelectProduct={(p) => navigate(`/product/${p.id}`)}
        products={products}
      />

      <VoiceSearchModal
        isOpen={isVoiceSearchOpen}
        onClose={() => setIsVoiceSearchOpen(false)}
        onSearchQuery={(q) => {
          const match = products.find((p) => p.name.toLowerCase().includes(q.toLowerCase())) || products[0];
          navigate(`/product/${match.id}`);
        }}
      />

      <UserAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onNavigate={navigate}
        initialView={authInitialView}
      />

      <IGOEcosystemModal
        isOpen={isEcosystemOpen}
        onClose={() => setIsEcosystemOpen(false)}
        onNavigate={navigate}
      />

      <ProteinCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        products={products}
        onSelectProduct={(p) => navigate(`/product/${p.id}`)}
      />

      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={navigate}
      />
    </div>
    </LanguageContext.Provider>
  );
}
