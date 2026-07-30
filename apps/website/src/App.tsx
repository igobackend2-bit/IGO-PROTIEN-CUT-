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
import { StickyOfferRibbon } from './components/StickyOfferRibbon';
import { MobileTabBar } from './components/MobileTabBar';

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
import { CartPage } from './pages/CartPage';
import { AdminDashboard } from './pages/AdminDashboard';

import { Product, ProductWeightOption, ProductCategory } from './types';
import { StoreService } from './lib/storage';
import { Language } from './lib/language';
import { isActiveAdmin, onAuthStateChange } from './lib/api/auth';

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

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isEcosystemOpen, setIsEcosystemOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Admin access. Starts as 'checking' so the dashboard is never rendered
  // optimistically while the membership lookup is still in flight — the old
  // behaviour rendered /admin to everyone with no check at all.
  const [adminAccess, setAdminAccess] = useState<'checking' | 'allowed' | 'denied'>('checking');

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
      isActiveAdmin()
        .then((allowed) => {
          if (!cancelled) setAdminAccess(allowed ? 'allowed' : 'denied');
        })
        .catch(() => {
          if (!cancelled) setAdminAccess('denied');
        });
    };

    check();
    const unsubscribe = onAuthStateChange(check);

    return () => {
      cancelled = true;
      unsubscribe();
    };
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

  const handleAddToCart = (product: Product, weight: ProductWeightOption, quantity: number) => {
    const cart = StoreService.getCart();
    const existingIdx = cart.findIndex(
      (item) => item.product.id === product.id && item.selectedWeight.label === weight.label
    );

    if (existingIdx >= 0) {
      cart[existingIdx].quantity += quantity;
    } else {
      cart.push({
        product,
        selectedWeight: weight,
        quantity
      });
    }

    StoreService.saveCart(cart);
  };

  const handleTrackOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    navigate('/account');
  };

  // Route Renderer
  const renderMainContent = () => {
    if (currentPath === '/admin') {
      // Gated on a real row in the app's `admin_users` table (checked via its
      // existing self-read RLS policy — nothing about that table is modified).
      if (adminAccess === 'checking') {
        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <p className="text-neutral-500">Checking access…</p>
          </div>
        );
      }

      if (adminAccess === 'denied') {
        return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-6 text-center">
            <h1 className="text-2xl font-bold text-neutral-900">Admin access required</h1>
            <p className="max-w-md text-neutral-600">
              This area is restricted to IGO staff accounts. Sign in with an admin account, or
              use the main admin dashboard for products, orders, inventory and customers.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 rounded-full bg-[#0F7B3A] px-6 py-2.5 font-semibold text-white"
            >
              Back to store
            </button>
          </div>
        );
      }

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
        return <SubscriptionsPage products={products} />;
      case '/recipes':
        return <RecipesPage products={products} onAddToCart={handleAddToCart} />;
      case '/about':
        return <AboutPage />;
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
        return <PolicyPage />;
      case '/account':
        return (
          <UserAccountPage
            onNavigate={navigate}
          />
        );
      case '/cart':
        return (
          <CartPage
            products={products}
            onSelectProduct={(p) => navigate(`/product/${p.id}`)}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
            onTrackOrder={handleTrackOrder}
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

  return (
    <div className="min-h-screen bg-white font-sans text-[#08120B] antialiased selection:bg-[#0F7B3A] selection:text-white flex flex-col justify-between">
      {/* Navbar */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
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

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Persistent floating contact + mobile bottom tab bar */}
      <FloatingContactWidget onNavigate={navigate} />
      <StickyOfferRibbon onNavigate={navigate} />
      <MobileTabBar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenVoiceSearch={() => setIsVoiceSearchOpen(true)}
      />

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
  );
}
